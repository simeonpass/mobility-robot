/* Dealer finder: postcode search, list and map. Ported from the Hydrogen site's stockists page. */
(function () {
  'use strict';
  var root = document.querySelector('[data-mr-stockists]');
  if (!root) return;

  var dealers = JSON.parse(root.querySelector('[data-mr-dealers]').textContent);
  var form = root.querySelector('[data-mr-stockist-form]');
  var button = form.querySelector('button[type="submit"]');
  var input = form.querySelector('input[name="postcode"]');
  var countEl = root.querySelector('[data-mr-stockist-count]');
  var errorEl = root.querySelector('[data-mr-stockist-error]');
  var headingEl = root.querySelector('[data-mr-stockist-heading]');
  var listEl = root.querySelector('[data-mr-stockist-list]');
  var mapEl = root.querySelector('[data-mr-stockist-map]');
  var MAX_BOUNDS = [[48.8, -12.5], [61.5, 3.5]];
  var UK_FOCUS_BOUNDS = [[50.5, -7.5], [56.3, 1.6]];

  var state = {selected: null, ranked: null, origin: null};
  var map = null;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }

  function directionsUrl(dealer) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(dealer.address + ', ' + dealer.city + ', ' + dealer.postcode);
  }

  function card(dealer, distanceKm, selected) {
    var html =
      '<article class="rounded-lg border transition-colors ' +
      (selected ? 'border-navy/30 bg-navy/[0.03] ring-1 ring-navy/15' : 'border-border/80 bg-background hover:border-navy/20') + '">' +
      '<button class="flex w-full items-start gap-3 px-3 py-2.5 text-left" type="button">' +
      '<span aria-hidden="true" class="mt-1.5 size-2 shrink-0 rounded-full ' + (selected ? 'bg-primary' : 'bg-navy/25') + '"></span>' +
      '<span class="min-w-0 flex-1"><span class="flex items-start justify-between gap-2">' +
      '<span class="text-sm font-semibold leading-snug text-navy">' + escapeHtml(dealer.name) + '</span>' +
      (typeof distanceKm === 'number' ? '<span class="shrink-0 text-[0.6875rem] font-medium tabular-nums text-muted-foreground">' + distanceKm.toFixed(0) + ' km</span>' : '') +
      '</span><span class="mt-0.5 block text-xs leading-snug text-muted-foreground">' + escapeHtml(dealer.city) +
      (dealer.regions && dealer.regions.length ? ' · ' + escapeHtml(dealer.regions[0]) : '') + '</span></span></button>';
    if (selected) {
      html +=
        '<div class="border-t border-navy/10 px-3 pb-3 pt-2.5 pl-8">' +
        '<address class="not-italic text-xs leading-relaxed text-navy/65">' + escapeHtml(dealer.address + ', ' + dealer.city + ', ' + dealer.postcode) + '</address>' +
        '<div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">' +
        '<a class="font-medium text-navy hover:text-primary" href="tel:' + escapeHtml(String(dealer.phone).replace(/\s/g, '')) + '">' + escapeHtml(dealer.phone) + '</a>' +
        '<a class="font-medium text-navy hover:text-primary" href="mailto:' + escapeHtml(dealer.email) + '">Email</a>' +
        '<a class="font-medium text-navy hover:text-primary" href="' + escapeHtml(directionsUrl(dealer)) + '" rel="noopener noreferrer" target="_blank">Directions</a>' +
        (dealer.website ? '<a class="font-medium text-muted-foreground hover:text-navy" href="' + escapeHtml(dealer.website) + '" rel="noopener noreferrer" target="_blank">Website</a>' : '') +
        '</div><div class="mt-2 flex flex-wrap items-center gap-2">' +
        (dealer.offers_demo ? '<span class="rounded-full bg-vat-price/10 px-2 py-0.5 text-[0.6875rem] font-medium text-vat-price">Offers demo</span>' : '') +
        (dealer.hours ? '<span class="text-[0.6875rem] text-muted-foreground">' + escapeHtml(dealer.hours) + '</span>' : '') +
        '</div></div>';
    }
    return html + '</article>';
  }

  function renderList() {
    var shown = state.ranked ? state.ranked.slice(0, 10) : dealers;
    listEl.innerHTML = '';
    shown.forEach(function (dealer) {
      var wrap = document.createElement('div');
      wrap.setAttribute('data-dealer', dealer.name);
      wrap.innerHTML = card(dealer, state.ranked ? dealer.distanceKm : null, state.selected === dealer.name);
      wrap.querySelector('button').addEventListener('click', function () { select(dealer.name); });
      listEl.appendChild(wrap);
    });
    headingEl.textContent = state.ranked ? 'Nearest stockists' : 'All stockists';
    countEl.textContent = state.ranked ? shown.length + ' nearest results' : dealers.length + ' UK & Ireland partners';
  }

  function updateView() {
    if (!map) return;
    if (state.selected) {
      var dealer = dealers.filter(function (d) { return d.name === state.selected; })[0];
      if (dealer) { map.setView([dealer.lat, dealer.lng], 10, {animate: true}); return; }
    }
    if (state.origin) { map.setView([state.origin.lat, state.origin.lng], 8, {animate: true}); return; }
    var lats = dealers.map(function (d) { return d.lat; });
    var lngs = dealers.map(function (d) { return d.lng; });
    map.fitBounds([[Math.min.apply(null, lats), Math.min.apply(null, lngs)], [Math.max.apply(null, lats), Math.max.apply(null, lngs)]], {padding: [28, 28], maxZoom: 8, animate: false});
  }

  function select(name) {
    state.selected = name;
    renderList();
    updateView();
    var el = listEl.querySelector('[data-dealer="' + (window.CSS && CSS.escape ? CSS.escape(name) : name) + '"]');
    if (el) el.scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }

  function initMap() {
    var L = window.L;
    if (!L || map) return;
    L.Icon.Default.mergeOptions({iconUrl: mapEl.getAttribute('data-icon'), iconRetinaUrl: mapEl.getAttribute('data-icon-2x'), shadowUrl: mapEl.getAttribute('data-shadow')});
    L.Icon.Default.imagePath = '';
    delete L.Icon.Default.prototype._getIconUrl;
    map = L.map(mapEl, {scrollWheelZoom: false, minZoom: 5, maxBounds: MAX_BOUNDS, maxBoundsViscosity: 0.65}).fitBounds(UK_FOCUS_BOUNDS, {padding: [16, 16], maxZoom: 7});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19}).addTo(map);
    var group = L.layerGroup().addTo(map);
    dealers.forEach(function (dealer) {
      var marker = L.marker([dealer.lat, dealer.lng]);
      marker.bindPopup('<strong>' + escapeHtml(dealer.name) + '</strong><br>' + escapeHtml(dealer.city) + '<br>' + escapeHtml(dealer.postcode));
      marker.on('click', function () { select(dealer.name); });
      group.addLayer(marker);
    });
    var sync = function () { map.invalidateSize({animate: false}); };
    sync();
    requestAnimationFrame(sync);
    if ('ResizeObserver' in window) new ResizeObserver(sync).observe(mapEl);
    updateView();
  }

  function haversine(a, b) {
    var toRad = function (deg) { return (deg * Math.PI) / 180; };
    var dLat = toRad(b.lat - a.lat);
    var dLng = toRad(b.lng - a.lng);
    var h = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.pow(Math.sin(dLng / 2), 2);
    return 2 * 6371 * Math.asin(Math.sqrt(h));
  }

  function geocode(query) {
    var normalized = query.trim().toUpperCase().replace(/\s+/g, ' ');
    var urls = [
      'https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb,ie&limit=1&postalcode=' + encodeURIComponent(normalized),
      'https://nominatim.openstreetmap.org/search?format=json&countrycodes=gb,ie&limit=1&q=' + encodeURIComponent(normalized)
    ];
    function attempt(index) {
      if (index >= urls.length) return Promise.resolve(null);
      return fetch(urls[index], {headers: {Accept: 'application/json'}})
        .then(function (response) { return response.ok ? response.json() : []; })
        .then(function (results) {
          if (results && results[0]) return {lat: Number(results[0].lat), lng: Number(results[0].lon)};
          return attempt(index + 1);
        })
        .catch(function () { return attempt(index + 1); });
    }
    return attempt(0);
  }

  function showError(text) {
    errorEl.textContent = text || '';
    errorEl.hidden = !text;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var postcode = input.value.trim();
    if (!postcode) { showError('Please enter a postcode.'); return; }
    button.disabled = true;
    button.textContent = 'Searching…';
    geocode(postcode).then(function (origin) {
      button.disabled = false;
      button.textContent = 'Search';
      if (!origin) {
        showError('Postcode not found. Try a full UK or Ireland postcode.');
        state.ranked = null;
        state.origin = null;
      } else {
        showError('');
        state.origin = origin;
        state.ranked = dealers
          .map(function (dealer) { return Object.assign({}, dealer, {distanceKm: haversine(origin, {lat: dealer.lat, lng: dealer.lng})}); })
          .sort(function (a, b) { return a.distanceKm - b.distanceKm; })
          .slice(0, 10);
      }
      renderList();
      updateView();
    });
  });

  renderList();
  if (window.L) initMap();
  else {
    var script = document.querySelector('script[data-mr-leaflet]');
    if (script) script.addEventListener('load', initMap);
  }
})();

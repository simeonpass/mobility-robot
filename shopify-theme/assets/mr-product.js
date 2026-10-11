/* Product page behaviour: gallery, options, accessory add-ons, totals, add to basket,
   tabs, the video panel and "show more reviews". Ported from the Hydrogen site's components. */
(function () {
  'use strict';

  var money = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });
  function format(pence) {
    return money.format(pence / 100);
  }
  function withVat(pence) {
    return Math.round(pence * 1.2);
  }
  function all(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  /* ---------- Gallery ---------- */
  function initGallery(root) {
    var slides = all(root, '[data-mr-gallery-slide]');
    var thumbs = all(root, '[data-mr-gallery-thumb]');
    if (slides.length < 2) return null;
    var active = 0;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var on = i === active;
        slide.hidden = !on;
        var embed = slide.getAttribute('data-embed');
        if (!embed) return;
        if (on && !slide.firstChild) {
          var iframe = document.createElement('iframe');
          iframe.className = 'size-full border-0 object-contain';
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
          iframe.allowFullscreen = true;
          iframe.title = slide.getAttribute('data-title') || '';
          iframe.src = embed;
          slide.appendChild(iframe);
        } else if (!on) {
          slide.innerHTML = '';
        }
      });
      thumbs.forEach(function (thumb, i) {
        thumb.setAttribute('aria-pressed', String(i === active));
        thumb.classList.toggle('is-selected', i === active);
      });
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () { show(i); });
    });
    var prev = root.querySelector('[data-mr-gallery-prev]');
    var next = root.querySelector('[data-mr-gallery-next]');
    if (prev) prev.addEventListener('click', function () { show(active - 1); });
    if (next) next.addEventListener('click', function () { show(active + 1); });

    return {
      showMedia: function (mediaId) {
        var index = slides.findIndex(function (slide) { return slide.getAttribute('data-media-id') === String(mediaId); });
        if (index >= 0) show(index);
      }
    };
  }

  /* ---------- Buy box ---------- */
  function initBuyBox(root, gallery) {
    var variants = JSON.parse(root.querySelector('[data-mr-product-variants]').textContent);
    var form = root.querySelector('form[action*="/cart/add"]');
    if (!form) return;
    var idInput = form.querySelector('[data-mr-variant-id]');
    var addButton = form.querySelector('[data-mr-add]');
    var proxyButton = root.querySelector('[data-mr-add-proxy]');
    var errorBox = form.querySelector('[data-mr-add-error]');
    var isChair = root.getAttribute('data-is-chair') === 'true';
    var title = root.getAttribute('data-title') || '';
    var current = variants.filter(function (v) { return String(v.id) === idInput.value; })[0] || variants[0];
    var busy = false;

    var addonsRoot = root.querySelector('[data-mr-addons]');
    var addons = addonsRoot ? all(addonsRoot, '[data-mr-addon]').map(function (element) {
      return {
        element: element,
        check: element.querySelector('[data-mr-addon-check]'),
        select: element.querySelector('[data-mr-addon-select]'),
        options: element.querySelector('[data-mr-addon-options]'),
        added: element.querySelector('[data-mr-addon-added]'),
        priceEl: element.querySelector('[data-mr-addon-price]'),
        extra: element.hasAttribute('data-mr-addon-extra')
      };
    }) : [];
    var showAll = false;

    function addonPrice(addon) {
      if (addon.select) {
        var option = addon.select.options[addon.select.selectedIndex];
        return Number(option.getAttribute('data-price'));
      }
      return Number(addon.element.getAttribute('data-price'));
    }
    function addonId(addon) {
      return addon.select ? addon.select.value : addon.check.value;
    }
    function selectedAddons() {
      return addons.filter(function (addon) { return addon.check.checked; });
    }

    function render() {
      var chosen = selectedAddons();
      var total = withVat(current.price) + chosen.reduce(function (sum, addon) { return sum + withVat(addonPrice(addon)); }, 0);
      all(root, '[data-mr-total]').forEach(function (el) { el.textContent = format(total); });
      var label = root.querySelector('[data-mr-total-label]');
      if (label) {
        label.textContent = (chosen.length
          ? 'Chair + ' + chosen.length + ' accessor' + (chosen.length === 1 ? 'y' : 'ies')
          : isChair ? 'Chair only' : title) + ' · including VAT';
      }
      var installment = root.querySelector('[data-mr-installment]');
      if (installment) installment.textContent = format(Math.round(total / 3));

      var priceEx = root.querySelector('[data-mr-price-ex]');
      var priceInc = root.querySelector('[data-mr-price-inc]');
      var wasWrap = root.querySelector('[data-mr-price-was-wrap]');
      if (priceEx) priceEx.textContent = format(current.price);
      if (priceInc) priceInc.textContent = format(withVat(current.price));
      if (wasWrap) {
        var hasWas = current.compare_at_price > current.price;
        wasWrap.hidden = !hasWas;
        if (hasWas) wasWrap.querySelector('[data-mr-price-was]').textContent = format(current.compare_at_price);
      }

      var text = current.available ? addButton.getAttribute('data-label') : addButton.getAttribute('data-sold-out');
      if (!busy) {
        addButton.textContent = text;
        addButton.disabled = !current.available;
        if (proxyButton) {
          proxyButton.textContent = text;
          proxyButton.disabled = !current.available;
        }
      }

      addons.forEach(function (addon) {
        var on = addon.check.checked;
        addon.element.classList.toggle('is-selected', on);
        if (addon.options) addon.options.hidden = !on;
        if (addon.added) addon.added.hidden = !on;
        if (addon.priceEl) addon.priceEl.textContent = format(withVat(addonPrice(addon)));
        if (addon.extra) addon.element.hidden = !(showAll || on);
      });
      if (addonsRoot) {
        var status = addonsRoot.querySelector('[data-mr-addons-status]');
        var note = addonsRoot.querySelector('[data-mr-addons-note]');
        var panel = addonsRoot.querySelector('[data-mr-addons-panel]');
        if (status) status.textContent = 'Optional' + (chosen.length ? ' · ' + chosen.length + ' selected' : '');
        if (note) {
          note.hidden = !(panel.hidden && chosen.length);
          note.textContent = chosen.length + ' selected · included in your total below.';
        }
      }
    }

    /* Options */
    all(root, '[data-mr-option]').forEach(function (fieldset) {
      var position = Number(fieldset.getAttribute('data-mr-option'));
      all(fieldset, '[data-mr-option-value]').forEach(function (button) {
        button.addEventListener('click', function () {
          var wanted = current.options.slice();
          wanted[position] = button.getAttribute('data-mr-option-value');
          var match = variants.filter(function (v) {
            return v.options.every(function (value, i) { return value === wanted[i]; });
          })[0];
          if (!match) return;
          current = match;
          idInput.value = String(match.id);
          all(fieldset, '[data-mr-option-value]').forEach(function (other) {
            var on = other === button;
            other.setAttribute('aria-pressed', String(on));
            other.className = 'inline-flex items-center gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors ' +
              (on ? 'border-foreground bg-foreground text-background' : 'border-border bg-background text-foreground hover:border-foreground/40');
          });
          if (match.media_id && gallery) gallery.showMedia(match.media_id);
          try {
            var url = new URL(window.location.href);
            url.searchParams.set('variant', String(match.id));
            window.history.replaceState({}, '', url.toString());
          } catch (error) { /* older browsers keep the old address */ }
          render();
        });
      });
    });

    /* Accessory add-ons */
    if (addonsRoot) {
      var trigger = addonsRoot.querySelector('[data-mr-addons-trigger]');
      var panel = addonsRoot.querySelector('[data-mr-addons-panel]');
      var more = addonsRoot.querySelector('[data-mr-addons-more]');
      trigger.addEventListener('click', function () {
        panel.hidden = !panel.hidden;
        trigger.setAttribute('aria-expanded', String(!panel.hidden));
        var chevron = trigger.querySelector('svg');
        if (chevron) chevron.classList.toggle('is-open', !panel.hidden);
        render();
      });
      if (more) {
        more.addEventListener('click', function () {
          showAll = !showAll;
          more.textContent = showAll ? more.getAttribute('data-fewer') : more.getAttribute('data-more');
          render();
        });
      }
      addons.forEach(function (addon) {
        addon.check.addEventListener('change', render);
        if (addon.select) addon.select.addEventListener('change', render);
      });
    }

    /* Add to basket: chair plus any selected accessories, then on to the basket */
    function showError(text) {
      if (!errorBox) return;
      errorBox.textContent = text || '';
      errorBox.hidden = !text;
    }
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (busy || !current.available) return;
      busy = true;
      showError('');
      addButton.disabled = true;
      addButton.setAttribute('aria-busy', 'true');
      addButton.textContent = 'Adding…';
      var items = [{ id: current.id, quantity: 1 }].concat(selectedAddons().map(function (addon) {
        return { id: Number(addonId(addon)), quantity: 1 };
      }));
      fetch(root.getAttribute('data-cart-add-url') + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          return response.json().then(function (data) {
            if (!response.ok) throw new Error(data.description || data.message || 'Sorry, that could not be added to your basket.');
            return data;
          });
        })
        .then(function () {
          window.location.assign(root.getAttribute('data-cart-url'));
        })
        .catch(function (error) {
          busy = false;
          addButton.setAttribute('aria-busy', 'false');
          showError(error.message);
          render();
        });
    });
    if (proxyButton) {
      proxyButton.addEventListener('click', function () {
        if (form.requestSubmit) form.requestSubmit();
        else addButton.click();
      });
    }

    /* The sticky bar on phones hides while the main button is on screen */
    var mobileBar = root.querySelector('[data-mr-mobile-atc]');
    var purchase = root.querySelector('[data-mr-purchase]');
    if (mobileBar && purchase && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        mobileBar.classList.toggle('is-inline-visible', entries[0].isIntersecting);
      }, { threshold: 0.5, rootMargin: '-110px 0px -90px 0px' }).observe(purchase);
    }

    all(root, '[data-mr-href]').forEach(function (button) {
      button.addEventListener('click', function () { window.location.assign(button.getAttribute('data-mr-href')); });
    });

    render();
  }

  /* ---------- Tabs ---------- */
  function initTabs(section) {
    var tabs = all(section, '[role="tab"]');
    if (!tabs.length) return;
    var ON = 'border-navy text-navy';
    var OFF = 'border-transparent text-slate hover:text-navy';
    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        (on ? OFF : ON).split(' ').forEach(function (name) { tab.classList.remove(name); });
        (on ? ON : OFF).split(' ').forEach(function (name) { tab.classList.add(name); });
        var panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tabs[index].focus();
    }
    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { select(index); });
      tab.addEventListener('keydown', function (event) {
        var next = null;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
  }

  /* ---------- "Meet the chair in motion" ---------- */
  function initVideoHero(button) {
    button.addEventListener('click', function () {
      var embed = button.getAttribute('data-embed');
      var wrap = document.createElement('div');
      wrap.className = 'aspect-video';
      if (/\.(mp4|webm|mov)(\?|$)/i.test(embed)) {
        var player = document.createElement('video');
        player.className = 'size-full border-0 object-contain';
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
        player.title = button.getAttribute('data-title') || '';
        player.src = embed;
        wrap.appendChild(player);
      } else {
        var iframe = document.createElement('iframe');
        iframe.className = 'size-full border-0 object-contain';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.title = button.getAttribute('data-title') || '';
        iframe.src = embed + (embed.indexOf('?') >= 0 ? '&' : '?') + 'autoplay=1';
        wrap.appendChild(iframe);
      }
      button.replaceWith(wrap);
    });
  }

  /* ---------- Reviews ---------- */
  function initReviews(grid) {
    var button = document.querySelector('[data-mr-reviews-more]');
    if (!button) return;
    var slug = grid.getAttribute('data-slug');
    var total = Number(grid.getAttribute('data-total'));
    var loaded = null;
    var PAGE = 8;

    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    function initials(name) {
      var parts = String(name).trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return '?';
      if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
      return (parts[0].slice(0, 1) + parts[parts.length - 1].slice(0, 1)).toUpperCase();
    }
    function stars(rating) {
      var clamped = Math.max(0, Math.min(5, rating));
      var html = '<span role="img" aria-label="' + clamped.toFixed(1) + ' out of 5 stars" class="inline-flex items-center gap-0.5 text-gold text-sm">';
      for (var i = 0; i < 5; i++) html += '<span aria-hidden="true">' + (i < Math.round(clamped) ? '★' : '☆') + '</span>';
      return html + '</span>';
    }
    function date(value) {
      try {
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
      } catch (error) {
        return '';
      }
    }
    function card(review) {
      return '<article class="flex h-full flex-col border-t border-border/80 pt-5 md:pt-6"><div class="flex items-start gap-3">' +
        '<div aria-hidden="true" class="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy/[0.06] text-[0.6875rem] font-semibold tracking-wide text-navy">' + escapeHtml(initials(review.author)) + '</div>' +
        '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-x-2 gap-y-1"><p class="text-sm font-semibold text-navy">' + escapeHtml(review.author) + '</p>' + stars(review.rating) + '</div>' +
        (review.title ? '<h3 class="mt-1.5 text-[0.9375rem] font-medium leading-snug text-navy">' + escapeHtml(review.title) + '</h3>' : '') +
        '<p class="mt-1.5 text-sm leading-relaxed text-navy/70">' + escapeHtml(review.body) + '</p>' +
        '<p class="mt-2 text-xs text-navy/70">' + escapeHtml(date(review.createdAt)) + (review.productName ? ' · ' + escapeHtml(review.productName) : '') + '</p></div></div></article>';
    }
    function append() {
      var shown = grid.children.length;
      loaded.slice(shown, shown + PAGE).forEach(function (review) {
        grid.insertAdjacentHTML('beforeend', card(review));
      });
      button.disabled = false;
      button.textContent = 'Show more reviews';
      if (grid.children.length >= Math.min(total, loaded.length)) button.parentElement.hidden = true;
    }
    button.addEventListener('click', function () {
      if (loaded) { append(); return; }
      button.disabled = true;
      button.textContent = 'Loading reviews…';
      fetch(grid.getAttribute('data-src'))
        .then(function (response) { return response.json(); })
        .then(function (reviews) {
          loaded = reviews.filter(function (review) { return review.productSlug === slug; });
          append();
        })
        .catch(function () {
          button.disabled = false;
          button.textContent = 'Show more reviews';
        });
    });
  }

  function init() {
    var galleryRoot = document.querySelector('[data-mr-gallery]');
    var gallery = galleryRoot ? initGallery(galleryRoot) : null;
    all(document, '[data-mr-product]').forEach(function (root) { initBuyBox(root, gallery); });
    all(document, '[data-mr-tabs]').forEach(initTabs);
    all(document, '[data-mr-video-hero]').forEach(initVideoHero);
    all(document, '[data-mr-reviews]').forEach(initReviews);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

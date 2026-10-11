/* Mobility Robot storefront behaviour: drawers, range menu, hero turntable,
   video dialog and review toggle. Ported from the Hydrogen site's components. */
(function () {
  'use strict';

  var reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function all(root, selector) {
    return Array.prototype.slice.call(root.querySelectorAll(selector));
  }

  /* ---------- Drawers (basket, search, mobile menu) ---------- */
  function initAsides() {
    var overlays = all(document, '[data-mr-aside]');
    if (!overlays.length) return;

    function close() {
      overlays.forEach(function (overlay) {
        overlay.classList.remove('expanded');
      });
    }

    function open(type) {
      overlays.forEach(function (overlay) {
        overlay.classList.toggle('expanded', overlay.getAttribute('data-mr-aside') === type);
      });
      if (type === 'search') {
        var input = document.querySelector('[data-mr-search-input]');
        if (input) window.setTimeout(function () { input.focus(); }, 60);
      }
    }

    document.addEventListener('click', function (event) {
      var opener = event.target.closest('[data-mr-aside-open]');
      if (opener) {
        event.preventDefault();
        open(opener.getAttribute('data-mr-aside-open'));
        return;
      }
      if (event.target.closest('[data-mr-aside-close]')) {
        close();
        return;
      }
      // Following a link inside the mobile menu closes it, as on the original site.
      if (event.target.closest('[data-mr-aside="mobile"] a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });
  }

  /* ---------- "Our range" menu ---------- */
  function initDropdown() {
    var root = document.querySelector('[data-mr-dropdown]');
    if (!root) return;
    var trigger = root.querySelector('[data-mr-dropdown-trigger]');
    var panel = root.querySelector('[data-mr-dropdown-panel]');
    var chevron = trigger.querySelector('.site-header-chevron');
    var path = window.location.pathname.replace(/\/$/, '') || '/';
    var productActive = all(panel, '.site-header-dropdown-item').some(function (link) {
      var active = link.getAttribute('href') === path;
      if (active) link.classList.add('site-header-dropdown-item--active');
      return active;
    });
    var isOpen = false;

    function render() {
      panel.hidden = !isOpen;
      trigger.setAttribute('aria-expanded', String(isOpen));
      trigger.classList.toggle('site-header-link--active', isOpen || productActive);
      if (chevron) chevron.classList.toggle('site-header-chevron--open', isOpen);
    }

    trigger.addEventListener('click', function () {
      isOpen = !isOpen;
      render();
    });
    document.addEventListener('mousedown', function (event) {
      if (isOpen && !root.contains(event.target)) {
        isOpen = false;
        render();
      }
    });
    document.addEventListener('keydown', function (event) {
      if (isOpen && event.key === 'Escape') {
        isOpen = false;
        render();
        trigger.focus();
      }
    });
    root.addEventListener('focusout', function (event) {
      if (isOpen && !root.contains(event.relatedTarget)) {
        isOpen = false;
        render();
      }
    });
    render();

    all(document, '.site-header-nav-desktop > a.site-header-link, .site-header-mobile a.site-header-link').forEach(function (link) {
      var url = link.getAttribute('href');
      if (!url || url === '/' || url === '#') return;
      if (path === url || path.indexOf(url + '/') === 0) {
        link.classList.add('site-header-link--active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ---------- Hero turntable ---------- */
  function initTurntable(root) {
    var stage = root.querySelector('[data-mr-turntable-stage]');
    var items = all(root, '[data-mr-turntable-item]');
    var COUNT = items.length;
    if (!stage || !COUNT) return;

    var tabs = all(root, '[data-mr-turntable-tab]');
    var placards = all(root, '[data-mr-turntable-placard]');
    var controls = all(root, '[data-mr-motion-controls]');
    var panel = root.querySelector('[data-mr-turntable-panel]');
    var pauseButton = root.querySelector('[data-mr-turntable-pause]');
    var firstEdge = stage.querySelector('.mr-turntable-edge');
    var baseId = root.getAttribute('data-base-id');

    var STEP_DEG = 360 / COUNT;
    var FADE_FULL_DEG = STEP_DEG * 1.1;
    var FADE_GONE_DEG = Math.min(STEP_DEG * 1.9, 150);
    var NEIGHBOUR_OFFSET = { desktop: 1.17, mobile: 0.8 };
    var DWELL_MS = Number(root.getAttribute('data-dwell')) || 11000;
    var SPIN_MS = 1150;
    var DRAG_PX_PER_STEP = { desktop: 220, mobile: 140 };

    var state = {
      active: 0,
      paused: false,
      hovered: false,
      focused: false,
      inView: true,
      visiblePage: !document.hidden,
      motionStarted: false,
      motionReady: false,
      clipIndex: 0,
      manualDemo: false,
      showMotion: true
    };
    var reducedMotion = reducedMotionQuery.matches;
    var geometry = null;
    var position = 0;
    var target = 0;
    var frame = null;
    var drag = null;
    var suppressClick = false;
    var rotateTimer = null;
    var motionTimer = null;
    var wasRotating = null;
    var lastActive = null;
    var spotlight = null;
    var spotlightKey = null;
    var video = null;

    function mod(value, n) {
      return ((value % n) + n) % n;
    }
    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function solveRadius(perspective, goal) {
      var theta = (STEP_DEG * Math.PI) / 180;
      var low = 0;
      var high = perspective * 0.9;
      for (var i = 0; i < 40; i++) {
        var radius = (low + high) / 2;
        var projected = (radius * Math.sin(theta) * perspective) / (perspective - radius * Math.cos(theta));
        if (projected < goal) low = radius;
        else high = radius;
      }
      return (low + high) / 2;
    }

    function measure() {
      var width = stage.clientWidth;
      var height = stage.clientHeight;
      var mobile = width < 768;
      var perspective = height * 3.8;
      var neighbour = mobile
        ? Math.min(height * NEIGHBOUR_OFFSET.mobile, width * 0.68)
        : height * NEIGHBOUR_OFFSET.desktop;
      return {
        width: width,
        height: height,
        itemHeight: height * 0.72,
        radius: solveRadius(perspective, neighbour),
        perspective: perspective,
        camera: height * 0.34,
        floor: height * 0.8
      };
    }

    function project(rel) {
      var rad = (rel * Math.PI) / 180;
      var x3 = geometry.radius * Math.sin(rad);
      var z3 = geometry.radius * Math.cos(rad);
      var scale = geometry.perspective / (geometry.perspective - z3);
      var feet = geometry.camera + (geometry.floor - geometry.camera) * scale;
      var distance = Math.abs(rel);
      var opacity =
        distance <= FADE_FULL_DEG
          ? 1
          : distance >= FADE_GONE_DEG
            ? 0
            : 1 - (distance - FADE_FULL_DEG) / (FADE_GONE_DEG - FADE_FULL_DEG);
      return { x: x3 * scale, y: feet - geometry.itemHeight, scale: scale, opacity: opacity, depth: z3 };
    }

    function paint() {
      if (!geometry) return;
      items.forEach(function (element, index) {
        var rel = mod(index * STEP_DEG - position * STEP_DEG + 180, 360) - 180;
        var point = project(rel);
        element.style.transform =
          'translate(calc(-50% + ' + point.x.toFixed(2) + 'px), ' + point.y.toFixed(2) + 'px) scale(' + point.scale.toFixed(4) + ')';
        element.style.opacity = point.opacity.toFixed(3);
        element.style.visibility = point.opacity <= 0 ? 'hidden' : 'visible';
        element.style.zIndex = String(Math.round(point.depth + geometry.radius));
      });
    }

    function cancelFrame() {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }
    }

    function layout() {
      geometry = measure();
      stage.style.setProperty('--tt-item-h', geometry.itemHeight + 'px');
      stage.style.setProperty('--tt-item-w', geometry.itemHeight * 1.06 + 'px');
      stage.style.setProperty('--tt-radius', geometry.radius + 'px');
      stage.style.setProperty('--tt-persp', geometry.perspective + 'px');
      stage.style.setProperty('--tt-cam', geometry.camera + 'px');
      stage.style.setProperty('--tt-floor', geometry.floor + 'px');
      paint();
    }

    function clipButtons() {
      var block = controls.filter(function (el) {
        return Number(el.getAttribute('data-mr-motion-controls')) === state.active;
      })[0];
      return block ? { block: block, buttons: all(block, '[data-mr-clip]') } : null;
    }

    function currentClip() {
      var set = clipButtons();
      if (!set) return null;
      var clips = set.buttons.filter(function (button) {
        return button.getAttribute('data-mr-clip') !== 'off';
      });
      return clips[state.clipIndex] || clips[0] || null;
    }

    function removeSpotlight() {
      if (spotlight) {
        spotlight.remove();
        spotlight = null;
        video = null;
        spotlightKey = null;
      }
    }

    function setReady(value) {
      if (state.motionReady === value) return;
      state.motionReady = value;
      render();
    }

    function mountSpotlight(clip, key) {
      removeSpotlight();
      var style = clip.getAttribute('data-style');
      spotlight = document.createElement('div');
      spotlight.className = 'mr-motion-spotlight' + (style === 'studio' ? ' is-studio' : '');
      var film = document.createElement('div');
      film.className = 'mr-motion-film' + (style === 'studio' ? ' is-studio' : '') + (style === 'portrait' ? ' is-portrait' : '');
      video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('playsinline', '');
      video.preload = 'metadata';
      video.disablePictureInPicture = true;
      video.poster = clip.getAttribute('data-poster');
      video.addEventListener('playing', function () { setReady(true); });
      video.addEventListener('error', function () { setReady(false); });
      video.src = clip.getAttribute('data-file');
      var label = document.createElement('span');
      label.className = 'mr-motion-film-label';
      label.appendChild(document.createElement('span'));
      label.appendChild(document.createTextNode(clip.getAttribute('data-caption') || ''));
      film.appendChild(video);
      film.appendChild(label);
      if (style === 'portrait') {
        var credit = document.createElement('span');
        credit.className = 'mr-motion-credit';
        credit.textContent = 'XSTO demonstration';
        film.appendChild(credit);
      }
      spotlight.appendChild(film);
      stage.insertBefore(spotlight, firstEdge);
      spotlightKey = key;
    }

    function resetMotionTimer() {
      window.clearTimeout(motionTimer);
      if (reducedMotion || !state.showMotion) return;
      motionTimer = window.setTimeout(function () {
        state.motionStarted = true;
        render();
      }, SPIN_MS + 250);
    }

    function render() {
      var rotating =
        state.inView &&
        state.visiblePage &&
        !reducedMotion &&
        !state.paused &&
        !state.hovered &&
        !state.focused &&
        !state.manualDemo;

      root.classList.toggle('is-rotating', rotating);
      if (rotating !== wasRotating || state.active !== lastActive) {
        window.clearInterval(rotateTimer);
        rotateTimer = null;
        if (rotating) {
          rotateTimer = window.setInterval(function () {
            if (!document.hidden) stepBy(1);
          }, DWELL_MS);
        }
        wasRotating = rotating;
        lastActive = state.active;
      }

      items.forEach(function (element, index) {
        var relative = mod(index - state.active + COUNT / 2, COUNT) - COUNT / 2;
        element.setAttribute('data-pos', String(Math.round(relative)));
        if (index === state.active) element.setAttribute('data-current', 'true');
        else element.removeAttribute('data-current');
      });

      tabs.forEach(function (tab, index) {
        tab.setAttribute('aria-selected', String(index === state.active));
        tab.tabIndex = index === state.active ? 0 : -1;
      });
      placards.forEach(function (placard) {
        placard.hidden = Number(placard.getAttribute('data-mr-turntable-placard')) !== state.active;
      });
      if (panel && baseId) panel.setAttribute('aria-labelledby', baseId + '-tab-' + state.active);

      controls.forEach(function (block) {
        block.hidden = Number(block.getAttribute('data-mr-motion-controls')) !== state.active;
      });
      var set = clipButtons();
      var clip = currentClip();
      if (set) {
        var eyebrow = set.block.querySelector('[data-mr-motion-eyebrow]');
        var functions = set.block.querySelector('[data-mr-motion-functions]');
        var description = set.block.querySelector('[data-mr-motion-description]');
        if (eyebrow) eyebrow.textContent = reducedMotion ? 'Explore the details' : 'See what it can do';
        if (functions) functions.hidden = reducedMotion;
        if (description && clip) description.textContent = clip.getAttribute('data-description') || '';
        set.buttons.forEach(function (button) {
          var id = button.getAttribute('data-mr-clip');
          var pressed = id === 'off' ? !state.showMotion : state.showMotion && Number(id) === state.clipIndex;
          button.setAttribute('aria-pressed', String(pressed));
        });
      }

      var mounted = !reducedMotion && state.showMotion && state.motionStarted && Boolean(clip);
      if (mounted) {
        var key = state.active + '-' + state.clipIndex;
        if (key !== spotlightKey) mountSpotlight(clip, key);
        var playing = !state.paused && state.inView && state.visiblePage;
        if (video) {
          if (playing) {
            var attempt = video.play();
            if (attempt && attempt.catch) attempt.catch(function () { setReady(false); });
          } else {
            video.pause();
          }
        }
      } else {
        removeSpotlight();
      }
      var demoVisible = mounted && state.motionReady;
      if (spotlight) spotlight.classList.toggle('is-ready', demoVisible);
      stage.classList.toggle('is-demonstrating', demoVisible);

      if (pauseButton) {
        pauseButton.hidden = reducedMotion;
        pauseButton.setAttribute('aria-label', state.paused ? 'Resume animation' : 'Pause animation');
        pauseButton.setAttribute('aria-pressed', String(state.paused));
        var pauseIcon = pauseButton.querySelector('[data-mr-icon-pause]');
        var playIcon = pauseButton.querySelector('[data-mr-icon-play]');
        if (pauseIcon) pauseIcon.hidden = state.paused;
        if (playIcon) playIcon.hidden = !state.paused;
      }
    }

    function animateTo(next) {
      state.motionStarted = false;
      state.motionReady = false;
      state.clipIndex = 0;
      state.manualDemo = false;
      target = next;
      state.active = mod(Math.round(next), COUNT);
      cancelFrame();
      resetMotionTimer();
      render();
      if (reducedMotion) {
        position = next;
        paint();
        return;
      }
      var from = position;
      var started = performance.now();
      var tick = function (now) {
        var progress = Math.min(1, (now - started) / SPIN_MS);
        position = from + (next - from) * easeOut(progress);
        paint();
        frame = progress < 1 ? window.requestAnimationFrame(tick) : null;
      };
      frame = window.requestAnimationFrame(tick);
    }

    function stepBy(delta) {
      animateTo(Math.round(target) + delta);
    }

    function goTo(index) {
      var current = mod(Math.round(target), COUNT);
      var delta = mod(index - current, COUNT);
      if (delta > COUNT / 2) delta -= COUNT;
      animateTo(Math.round(target) + delta);
    }

    /* Wiring */
    stage.addEventListener('mouseenter', function () { state.hovered = true; render(); });
    stage.addEventListener('mouseleave', function () { state.hovered = false; render(); });

    stage.addEventListener('pointerdown', function (event) {
      if (event.button !== 0) return;
      drag = { startX: event.clientX, startPosition: position, moved: false };
      cancelFrame();
    });
    stage.addEventListener('pointermove', function (event) {
      if (!drag || !geometry) return;
      var dx = event.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        try { stage.setPointerCapture(event.pointerId); } catch (error) { /* not capturable */ }
        stage.classList.add('is-dragging');
      }
      if (!drag.moved) return;
      var perStep = geometry.width < 768 ? DRAG_PX_PER_STEP.mobile : DRAG_PX_PER_STEP.desktop;
      position = drag.startPosition - dx / perStep;
      paint();
    });
    function onPointerEnd() {
      if (!drag) return;
      var finished = drag;
      drag = null;
      stage.classList.remove('is-dragging');
      if (finished.moved) {
        suppressClick = true;
        window.setTimeout(function () { suppressClick = false; }, 0);
        animateTo(Math.round(position));
      }
    }
    stage.addEventListener('pointerup', onPointerEnd);
    stage.addEventListener('pointercancel', onPointerEnd);

    items.forEach(function (element, index) {
      element.addEventListener('click', function () {
        if (!suppressClick && index !== state.active) goTo(index);
      });
    });

    tabs.forEach(function (tab, index) {
      tab.addEventListener('click', function () { goTo(index); });
      tab.addEventListener('keydown', function (event) {
        var focusIndex = null;
        if (event.key === 'ArrowRight') {
          focusIndex = mod(state.active + 1, COUNT);
          stepBy(1);
        } else if (event.key === 'ArrowLeft') {
          focusIndex = mod(state.active - 1, COUNT);
          stepBy(-1);
        } else if (event.key === 'Home') {
          focusIndex = 0;
          goTo(0);
        } else if (event.key === 'End') {
          focusIndex = COUNT - 1;
          goTo(COUNT - 1);
        }
        if (focusIndex !== null) {
          event.preventDefault();
          if (tabs[focusIndex]) tabs[focusIndex].focus();
        }
      });
    });

    var prev = root.querySelector('[data-mr-turntable-prev]');
    var next = root.querySelector('[data-mr-turntable-next]');
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    if (pauseButton) {
      pauseButton.addEventListener('click', function () {
        state.paused = !state.paused;
        state.manualDemo = false;
        render();
      });
    }

    controls.forEach(function (block) {
      all(block, '[data-mr-clip]').forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-mr-clip');
          if (id === 'off') {
            state.showMotion = false;
            state.motionReady = false;
            window.clearTimeout(motionTimer);
          } else {
            var index = Number(id);
            if (index !== state.clipIndex || !state.showMotion) state.motionReady = false;
            state.clipIndex = index;
            state.motionStarted = true;
            state.showMotion = true;
            state.manualDemo = true;
            state.paused = false;
          }
          render();
        });
      });
    });

    root.addEventListener('focusin', function (event) {
      var keyboard = true;
      try { keyboard = event.target.matches(':focus-visible'); } catch (error) { keyboard = true; }
      if (keyboard) {
        state.focused = true;
        render();
      }
    });
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) {
        state.focused = false;
        render();
      }
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.inView = entries[0].isIntersecting;
        render();
      }, { threshold: 0.15 }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () {
      state.visiblePage = !document.hidden;
      render();
    });
    var onMotionPreference = function () {
      reducedMotion = reducedMotionQuery.matches;
      render();
    };
    if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', onMotionPreference);

    layout();
    if ('ResizeObserver' in window) new ResizeObserver(layout).observe(stage);
    else window.addEventListener('resize', layout);
    resetMotionTimer();
    render();
  }

  /* ---------- Video dialog ---------- */
  function initVideos() {
    var template = document.querySelector('[data-mr-video-dialog-template]');
    if (!template) return;

    document.addEventListener('click', function (event) {
      var card = event.target.closest('[data-mr-video]');
      if (!card) return;
      var dialog = template.content.firstElementChild.cloneNode(true);
      var frame = dialog.querySelector('[data-mr-video-frame]');
      var title = card.getAttribute('data-title') || '';
      var youtube = card.getAttribute('data-youtube');
      var file = card.getAttribute('data-video');
      dialog.querySelector('#mr-video-dialog-title').textContent = title;

      if (file && !youtube) {
        var player = document.createElement('video');
        player.className = frame.getAttribute('data-video-class');
        player.controls = true;
        player.autoplay = true;
        player.playsInline = true;
        player.poster = frame.getAttribute('data-poster');
        player.title = title;
        player.src = file;
        frame.appendChild(player);
      } else if (youtube) {
        var iframe = document.createElement('iframe');
        iframe.className = frame.getAttribute('data-iframe-class');
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.title = title;
        iframe.src =
          'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(youtube) +
          '?autoplay=1&mute=1&loop=1&playlist=' + encodeURIComponent(youtube) +
          '&controls=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3';
        frame.appendChild(iframe);
      }

      var previousOverflow = document.documentElement.style.overflow;
      document.body.appendChild(dialog);
      dialog.querySelector('[data-mr-video-close]').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('close', function () {
        document.documentElement.style.overflow = previousOverflow;
        dialog.remove();
        if (card.isConnected) card.focus({ preventScroll: true });
      });
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    });
  }

  /* ---------- "Show more reviews" on phones ---------- */
  function initReviewToggle() {
    all(document, '[data-mr-review-toggle]').forEach(function (button) {
      var grid = document.getElementById(button.getAttribute('aria-controls'));
      if (!grid) return;
      button.addEventListener('click', function () {
        var expanded = grid.getAttribute('data-expanded') !== 'true';
        grid.setAttribute('data-expanded', String(expanded));
        button.setAttribute('aria-expanded', String(expanded));
        button.textContent = expanded ? button.getAttribute('data-fewer') : button.getAttribute('data-more');
      });
    });
  }

  function init() {
    initAsides();
    initDropdown();
    all(document, '[data-mr-turntable]').forEach(initTurntable);
    initVideos();
    initReviewToggle();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

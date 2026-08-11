/* Shared site behavior.
   Every page that has a gallery includes initGallery(); the home page also
   calls initHomeHero() for the avatar parallax and the scroll-spy nav. Both
   are no-ops if their markup isn't present, so this file is safe to include
   everywhere. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Lightbox gallery — click a [data-gallery-item] to open the full image
     in the page's .lightbox-overlay. Preloads natural sizes on load so the
     panel opens at the right aspect ratio immediately.
     ------------------------------------------------------------------- */
  function initGallery() {
    var overlay = document.querySelector('[data-lightbox]');
    if (!overlay) return;

    var panel = overlay.querySelector('.lightbox-panel');
    var image = overlay.querySelector('.lightbox-image');
    var label = overlay.querySelector('.lightbox-label');
    var srcEl = overlay.querySelector('.lightbox-src');
    var closeBtn = overlay.querySelector('.lightbox-close');
    var items = document.querySelectorAll('[data-gallery-item]');
    var dims = {};

    function measure(src) {
      if (dims[src] || !src) return dims[src];
      var img = new Image();
      img.onload = function () {
        dims[src] = { w: img.naturalWidth, h: img.naturalHeight };
      };
      img.src = src;
      return null;
    }

    items.forEach(function (el) {
      measure(el.dataset.src);
    });

    function open(src, text) {
      var d = measure(src) || dims[src];
      var ratio = d ? d.w + ' / ' + d.h : '3 / 2';
      var isVector = /\.svg$/i.test(src || '');
      var height = d && !isVector ? 'min(78vh, ' + d.h + 'px)' : '72vh';

      image.style.aspectRatio = ratio;
      image.style.height = height;
      image.style.backgroundImage =
        "url('" + src + "'), repeating-linear-gradient(135deg, #efefec 0 1px, transparent 1px 12px)";
      image.style.backgroundSize = 'contain, auto';
      label.textContent = text || '';
      srcEl.textContent = src || '';
      overlay.classList.add('is-open');
    }

    function close() {
      overlay.classList.remove('is-open');
    }

    items.forEach(function (el) {
      el.addEventListener('click', function () {
        open(el.dataset.src, el.dataset.label || el.getAttribute('alt') || '');
      });
    });

    overlay.addEventListener('click', function (e) {
      if (panel && !panel.contains(e.target)) close();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  /* ---------------------------------------------------------------------
     Home page hero — subtle pointer-parallax on the layered avatar, and a
     scroll-spy that highlights the matching nav link as each section
     crosses the reading line.
     ------------------------------------------------------------------- */
  function initHomeHero() {
    var avatar = document.getElementById('avatar');
    if (avatar) {
      var raf = null;
      window.addEventListener('pointermove', function (e) {
        var px = e.clientX / window.innerWidth - 0.5;
        var py = e.clientY / window.innerHeight - 0.5;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          avatar.querySelectorAll('[data-move]').forEach(function (el) {
            var i = parseFloat(el.dataset.move);
            el.style.transform = 'translate(' + (px * i).toFixed(2) + 'px,' + (py * i).toFixed(2) + 'px)';
          });
          raf = null;
        });
      }, { passive: true });
    }

    var navLinks = document.querySelectorAll('[data-nav]');
    if (!navLinks.length) return;
    var ids = ['home', 'work', 'explore', 'about'];
    var sraf = null;

    function sync() {
      var line = window.innerHeight * 0.32;
      var current = 'home';
      if (window.scrollY > 4) {
        ids.forEach(function (id) {
          var sec = document.getElementById(id);
          if (!sec) return;
          var r = sec.getBoundingClientRect();
          if (r.top <= line && r.bottom > line) current = id;
        });
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        var present = ids.filter(function (id) { return document.getElementById(id); });
        var last = present[present.length - 1];
        if (last) current = last;
      }
      navLinks.forEach(function (l) {
        l.classList.toggle('is-active', l.dataset.nav === current);
      });
    }

    function onScroll() {
      if (sraf) return;
      sraf = requestAnimationFrame(function () { sync(); sraf = null; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    window.addEventListener('hashchange', onScroll);
    sync();
  }

  function start() {
    initGallery();
    initHomeHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

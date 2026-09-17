/* AMELIA GATES — panel scrolling, v2
   One wheel tick / swipe / key press moves exactly one panel. */

(function () {
  'use strict';

  var scroller = document.getElementById('scroller');
  if (!scroller) return;

  var panels = [].slice.call(scroller.querySelectorAll('.panel'));
  if (panels.length < 2) return;

  var index  = 0;
  var locked = false;
  var timer  = null;

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LOCK_MS = reduce ? 60 : 820;

  function goTo(i, instant) {
    i = Math.max(0, Math.min(panels.length - 1, i));
    if (locked) return;

    var top = i * scroller.clientHeight;
    var same = (i === index);

    index = i;

    if (instant || reduce) {
      scroller.scrollTop = top;
      return;
    }

    if (same && Math.abs(scroller.scrollTop - top) < 2) return;

    locked = true;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { locked = false; }, LOCK_MS);

    if (scroller.scrollTo) {
      scroller.scrollTo({ top: top, behavior: 'smooth' });
    } else {
      scroller.scrollTop = top;
    }
  }

  function step(dir) {
    var next = index + dir;
    if (next < 0 || next > panels.length - 1) return;
    goTo(next);
  }

  /* ---- wheel / trackpad ---- */

  scroller.addEventListener('wheel', function (e) {
    e.preventDefault();
    if (locked) return;
    if (Math.abs(e.deltaY) < 6) return;
    step(e.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  /* ---- touch ---- */

  var startY = null;

  scroller.addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
  }, { passive: true });

  scroller.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });

  scroller.addEventListener('touchend', function (e) {
    if (startY === null) return;
    var endY = (e.changedTouches && e.changedTouches[0])
      ? e.changedTouches[0].clientY : startY;
    var dy = startY - endY;
    startY = null;
    if (Math.abs(dy) < 38) return;
    step(dy > 0 ? 1 : -1);
  }, { passive: true });

  /* ---- keyboard ---- */

  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar') {
      e.preventDefault(); step(1);
    } else if (k === 'ArrowUp' || k === 'PageUp') {
      e.preventDefault(); step(-1);
    } else if (k === 'End') {
      e.preventDefault(); goTo(panels.length - 1);
    } else if (k === 'Home') {
      e.preventDefault(); goTo(0);
    }
  });

  /* ---- arrows and the wordmark ---- */

  [].slice.call(document.querySelectorAll('[data-goto]')).forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      goTo(parseInt(el.getAttribute('data-goto'), 10) || 0);
    });
  });

  /* ---- keep index honest if the browser scrolls on its own ---- */

  var sync = null;
  scroller.addEventListener('scroll', function () {
    if (sync) clearTimeout(sync);
    sync = setTimeout(function () {
      if (locked) return;
      var h = scroller.clientHeight;
      if (h) index = Math.round(scroller.scrollTop / h);
    }, 120);
  }, { passive: true });

  /* ---- resize: stay on the current panel ---- */

  var rz = null;
  window.addEventListener('resize', function () {
    if (rz) clearTimeout(rz);
    rz = setTimeout(function () {
      locked = false;
      goTo(index, true);
    }, 120);
  });

  /* ---- deep link ---- */

  if (window.location.hash === '#contact') {
    goTo(1, true);
  } else {
    goTo(0, true);
  }
})();

/* AMELIA GATES — panel scrolling, v3
   One wheel tick / swipe / key press moves exactly one panel,
   on a slow eased tween. */

(function () {
  'use strict';

  var scroller = document.getElementById('scroller');
  var masthead = document.getElementById('masthead');
  if (!scroller) return;

  var panels = [].slice.call(scroller.querySelectorAll('.panel'));
  if (panels.length < 2) return;

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var DURATION = 1250;   /* ms — length of the slide                     */
  var COOLDOWN = 260;    /* ms — swallows trackpad momentum afterwards   */

  var index   = 0;
  var locked  = false;
  var raf     = null;
  var cooling = null;

  /* ---- the masthead is fixed, so the panels need to know how tall it is ---- */

  function measure() {
    if (!masthead) return;
    var h = Math.round(masthead.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }

  /* ---- eased tween ---- */

  function ease(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function release() {
    if (cooling) clearTimeout(cooling);
    cooling = setTimeout(function () { locked = false; }, COOLDOWN);
  }

  function goTo(i, instant) {
    i = Math.max(0, Math.min(panels.length - 1, i));

    var target = i * scroller.clientHeight;
    index = i;

    if (raf) { cancelAnimationFrame(raf); raf = null; }

    if (instant || reduce) {
      scroller.scrollTop = target;
      locked = false;
      return;
    }

    var from  = scroller.scrollTop;
    var delta = target - from;

    if (Math.abs(delta) < 2) { locked = false; return; }

    locked = true;
    var t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = (ts - t0) / DURATION;
      if (p >= 1) {
        scroller.scrollTop = target;
        raf = null;
        release();
        return;
      }
      scroller.scrollTop = from + delta * ease(p);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
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
    if (locked) return;
    if (Math.abs(dy) < 38) return;
    step(dy > 0 ? 1 : -1);
  }, { passive: true });

  /* ---- keyboard ---- */

  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Spacebar') {
      e.preventDefault(); if (!locked) step(1);
    } else if (k === 'ArrowUp' || k === 'PageUp') {
      e.preventDefault(); if (!locked) step(-1);
    } else if (k === 'End') {
      e.preventDefault(); if (!locked) goTo(panels.length - 1);
    } else if (k === 'Home') {
      e.preventDefault(); if (!locked) goTo(0);
    }
  });

  /* ---- chevrons and the wordmark ---- */

  [].slice.call(document.querySelectorAll('[data-goto]')).forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      if (locked) return;
      goTo(parseInt(el.getAttribute('data-goto'), 10) || 0);
    });
  });

  /* ---- resize: remeasure the masthead, stay on the current panel ---- */

  var rz = null;
  window.addEventListener('resize', function () {
    if (rz) clearTimeout(rz);
    rz = setTimeout(function () {
      measure();
      locked = false;
      goTo(index, true);
    }, 120);
  });

  /* ---- start ---- */

  measure();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measure(); goTo(index, true); });
  }
  goTo(window.location.hash === '#contact' ? 1 : 0, true);
})();

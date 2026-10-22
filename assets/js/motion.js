// Scroll-linked motion that works everywhere, including iOS Safari (no CSS scroll timelines
// needed). One rAF-throttled scroll handler writes a few CSS variables; CSS turns them into
// transforms and opacity only, so everything stays on the compositor.
(function () {
  'use strict';

  var root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mobile = matchMedia('(max-width: 1020px)');

  /* ---------- headings that rise word by word ---------- */
  var SPLIT = '.section-head h2, .project h3, .contact-title';
  function split() {
    document.querySelectorAll(SPLIT).forEach(function (el) {
      var text = el.textContent.trim();
      if (el.dataset.split === text) return;
      el.dataset.split = text;
      el.classList.add('split');
      el.innerHTML = text.split(/\s+/).map(function (word, i) {
        return '<span class="w"><span style="--i:' + i + '">' + word + '</span></span>';
      }).join(' ');
    });
  }
  split();
  document.addEventListener('langchange', split);

  /* ---------- reveals: image curtains and counters ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('shown');
      if (en.target.matches('.metrics dt')) count(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.step-shot, .frame, .metrics dt, .project h3, .contact-title').forEach(function (el) { io.observe(el); });

  function count(el) {
    var m = el.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1]), suffix = m[2], decimals = (m[1].split('.')[1] || '').length;
    var t0 = performance.now(), dur = 1300;
    (function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * e).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- stacked step cards (phones and tablets) ---------- */
  var stacks = Array.prototype.map.call(document.querySelectorAll('.project .story'), function (story) {
    var steps = Array.prototype.slice.call(story.querySelectorAll('.step'));
    steps.forEach(function (s, i) { s.style.setProperty('--k', i); });
    return steps;
  });

  /* ---------- the scroll loop ---------- */
  var hero = document.querySelector('.hero');
  var tape = document.querySelector('.tape');
  var lastY = window.scrollY, velocity = 0, ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = document.documentElement.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);

    // Hero exit: 0 at the top, 1 once the hero has scrolled away.
    var hh = hero ? hero.offsetHeight : vh;
    root.style.setProperty('--hx', Math.min(1, Math.max(0, y / (hh * 0.85))).toFixed(4));

    // The tape leans with scroll speed, then settles.
    velocity = velocity * 0.8 + (y - lastY) * 0.2;
    lastY = y;
    if (tape) tape.style.setProperty('--skew', Math.max(-8, Math.min(8, velocity * 0.35)).toFixed(2) + 'deg');

    // Each stacked card shrinks as the next one slides over it.
    if (mobile.matches) {
      stacks.forEach(function (steps) {
        for (var i = 0; i < steps.length - 1; i++) {
          var cur = steps[i].getBoundingClientRect(), next = steps[i + 1].getBoundingClientRect();
          var overlap = (cur.bottom - next.top) / cur.height;
          steps[i].style.setProperty('--cover', Math.max(0, Math.min(1, overlap)).toFixed(3));
        }
      });
    }
    if (Math.abs(velocity) > 0.3) requestTick(); // keep easing the tape back to rest
  }
  function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
  update();
})();

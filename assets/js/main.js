(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };
  var t = function (key) { return (window.I18N[root.lang] || window.I18N.en)[key]; };

  /* ------------------------------------------------------------------ split-flap */
  var CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZÁÉÍÓÚÑ0123456789-·.';

  function buildRow(row, length) {
    row.textContent = '';
    for (var i = 0; i < length; i++) {
      var tile = document.createElement('span');
      tile.className = 'flap';
      tile.innerHTML = '<span> </span>';
      row.appendChild(tile);
    }
    return Array.prototype.slice.call(row.children);
  }

  // Each tile cycles through characters before settling on its target, left to right.
  function flipTo(tiles, text, opts) {
    opts = opts || {};
    var delay = opts.delay || 0;
    var speed = opts.speed || 55;
    tiles.forEach(function (tile, i) {
      var target = text[i] || ' ';
      var face = tile.firstChild;
      if (reduced) { face.textContent = target; return; }
      var current = CHARS.indexOf(face.textContent);
      if (current < 0) current = 0;
      var steps = opts.full ? 8 + i * 2 + Math.floor(Math.random() * 6) : 3 + Math.floor(Math.random() * 5);
      if (face.textContent === target && !opts.full) return;
      clearInterval(tile._timer);
      setTimeout(function () {
        var n = 0;
        tile._timer = setInterval(function () {
          n++;
          var ch = n >= steps ? target : CHARS[(current + n * 3) % CHARS.length];
          face.textContent = ch;
          tile.classList.remove('tick');
          void tile.offsetWidth;
          tile.classList.add('tick');
          if (n >= steps) {
            clearInterval(tile._timer);
            tile.classList.remove('tick');
            if (opts.settle) { tile.classList.add('done'); }
          }
        }, speed);
      }, delay + i * (opts.stagger || 40));
    });
  }

  var nameRows = document.querySelectorAll('.board [data-flap]');
  nameRows.forEach(function (row, r) {
    var word = row.dataset.flap;
    var tiles = buildRow(row, word.length);
    tiles[0].classList.add('is-accent');
    flipTo(tiles, word, { full: true, delay: 250 + r * 260, stagger: 70, settle: true });
  });

  var rolesRow = document.getElementById('roles');
  var ROLE_LEN = Math.max.apply(null, ['en', 'es'].map(function (l) {
    return Math.max.apply(null, window.I18N[l].roles.map(function (s) { return s.length; }));
  }));
  var roleTiles = buildRow(rolesRow, ROLE_LEN);
  var roleIndex = 0;
  var pad = function (s) { return (s + ' '.repeat(ROLE_LEN)).slice(0, ROLE_LEN); };
  function showRole(full) { flipTo(roleTiles, pad(t('roles')[roleIndex % t('roles').length]), { full: full, stagger: 22, speed: 45 }); }
  setTimeout(function () { showRole(true); }, 1300);
  if (!reduced) {
    setInterval(function () { roleIndex++; showRole(false); }, 3400);
  }

  /* ------------------------------------------------------------------ language */
  function applyLang(lang) {
    root.lang = lang;
    var dict = window.I18N[lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = dict[el.dataset.i18n];
      if (typeof v === 'string') el.textContent = v;
    });
    document.getElementById('lang-toggle').setAttribute('aria-label', dict['aria.lang']);
    document.getElementById('theme-toggle').setAttribute('aria-label', dict['aria.theme']);
    document.title = lang === 'es' ? 'Keylor Pineda · Desarrollador de software' : 'Keylor Pineda · Software Developer';
    store.set('lang', lang);
  }
  applyLang(root.lang === 'es' ? 'es' : 'en');
  document.getElementById('lang-toggle').addEventListener('click', function () {
    var next = root.lang === 'es' ? 'en' : 'es';
    var go = function () { applyLang(next); renderTabs(); };
    if (document.startViewTransition && !reduced) document.startViewTransition(go); else go();
    showRole(false);
  });

  /* ------------------------------------------------------------------ theme */
  document.getElementById('theme-toggle').addEventListener('click', function (e) {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.style.setProperty('--vx', e.clientX + 'px');
    root.style.setProperty('--vy', e.clientY + 'px');
    var go = function () { root.dataset.theme = next; store.set('theme', next); };
    root.classList.add('theme-switching');
    var end = function () { root.classList.remove('theme-switching'); };
    if (document.startViewTransition && !reduced) document.startViewTransition(go).finished.then(end, end);
    else { go(); requestAnimationFrame(end); }
  });

  // Warm the images of the other theme once the page is idle, so switching never waits on the network.
  var warm = function () {
    document.querySelectorAll('img.theme-dark, img.theme-light').forEach(function (img) {
      var pre = new Image();
      pre.decoding = 'async';
      pre.src = img.currentSrc || img.src;
      if (pre.decode) pre.decode().catch(function () {});
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2500 }); else setTimeout(warm, 1500);

  /* ------------------------------------------------------------------ pointer effects */
  var deck = document.querySelector('.deck');
  if (deck && !reduced) deck.classList.add('intro');
  if (!reduced && matchMedia('(pointer: fine)').matches) {
    var raf = 0;
    window.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        root.style.setProperty('--mx', e.clientX + 'px');
        root.style.setProperty('--my', e.clientY + 'px');
        if (deck) {
          var r = deck.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
          var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          deck.style.setProperty('--px', (dx * 14).toFixed(1) + 'px');
          deck.style.setProperty('--py', (dy * 14).toFixed(1) + 'px');
        }
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------ reveal */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal, .section-head').forEach(function (el, i) {
    el.style.transitionDelay = (el.classList.contains('cert') || el.classList.contains('next')) ? (i % 3) * 90 + 'ms' : '';
    io.observe(el);
  });

  /* ------------------------------------------------------------------ project stories */
  document.querySelectorAll('.project').forEach(function (project) {
    var steps = project.querySelectorAll('.step');
    var shots = project.querySelectorAll('.shot');
    var activate = function (idx) {
      steps.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      shots.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.classList.toggle('is-past', i < idx);
      });
    };
    activate(0);
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) activate(Number(en.target.dataset.shot));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { sio.observe(s); });
  });

  /* ------------------------------------------------------------------ nav current section */
  var links = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var nio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var a = links[en.target.id];
      if (a && en.isIntersecting) {
        Object.keys(links).forEach(function (k) { links[k].classList.remove('is-current'); });
        a.classList.add('is-current');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) nio.observe(s); });

  /* ------------------------------------------------------------------ stack */
  var TOOLS = [
    ['typescript', 'TypeScript', 'front'], ['javascript', 'JavaScript', 'front'], ['react', 'React', 'front'],
    ['react', 'React Native', 'front'], ['expo', 'Expo', 'front'], ['angular', 'Angular', 'front'],
    ['vite', 'Vite', 'front'], ['tailwind', 'Tailwind CSS', 'front'], ['tanstack', 'TanStack Query', 'front'],
    ['zod', 'Zod', 'front'],
    ['python', 'Python', 'back'], ['java', 'Java', 'back'], ['nodejs', 'Node.js', 'back'], ['nestjs', 'NestJS', 'back'],
    ['fastapi', 'FastAPI', 'back'], ['spring', 'Spring Boot', 'back'], ['graphql', 'GraphQL', 'back'],
    ['prisma', 'Prisma', 'back'], ['sqlalchemy', 'SQLAlchemy', 'back'], ['postgresql', 'PostgreSQL', 'back'],
    ['sqlite', 'SQLite', 'back'], ['neon', 'Neon', 'back'], ['firebase', 'Firebase', 'back'],
    ['tensorflow', 'TensorFlow', 'ai'], ['keras', 'Keras', 'ai'], ['numpy', 'NumPy', 'ai'], ['pandas', 'pandas', 'ai'],
    ['scikitlearn', 'scikit-learn', 'ai'], ['gemini', 'Gemini', 'ai'], ['cohere', 'Cohere', 'ai'], ['groq', 'Groq', 'ai'],
    ['oracle', 'Oracle Cloud', 'cloud'], ['googlecloud', 'Google Cloud', 'cloud'], ['aws', 'AWS', 'cloud'],
    ['docker', 'Docker', 'cloud'], ['githubactions', 'GitHub Actions', 'cloud'], ['vercel', 'Vercel', 'cloud'],
    ['render', 'Render', 'cloud'], ['cloudinary', 'Cloudinary', 'cloud'], ['linux', 'Linux', 'cloud'],
    ['jest', 'Jest', 'quality'], ['vitest', 'Vitest', 'quality'], ['playwright', 'Playwright', 'quality'],
    ['pytest', 'pytest', 'quality'], ['git', 'Git', 'quality'], ['pnpm', 'pnpm', 'quality'],
  ];
  var TABS = [['all', 'tab.all'], ['front', 'tab.front'], ['back', 'tab.back'], ['ai', 'tab.ai'], ['cloud', 'tab.cloud'], ['quality', 'tab.quality']];
  var currentTab = 'all';
  var grid = document.getElementById('stack-grid');
  var tabsEl = document.getElementById('stack-tabs');

  grid.innerHTML = TOOLS.map(function (tool) {
    return '<li class="tool box" data-cat="' + tool[2] + '"><span class="tool-logo"><img src="assets/logos/' + tool[0] +
      '.svg" alt="" loading="lazy"></span>' + tool[1] + '</li>';
  }).join('');

  function renderTabs() {
    tabsEl.innerHTML = TABS.map(function (tab) {
      return '<button class="tab" role="tab" type="button" data-tab="' + tab[0] + '" aria-selected="' + (tab[0] === currentTab) + '">' + t(tab[1]) + '</button>';
    }).join('');
  }
  renderTabs();
  tabsEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab');
    if (!btn) return;
    currentTab = btn.dataset.tab;
    renderTabs();
    var i = 0;
    grid.querySelectorAll('.tool').forEach(function (el) {
      var show = currentTab === 'all' || el.dataset.cat === currentTab;
      el.classList.toggle('is-hidden', !show);
      el.classList.remove('pop');
      if (show) { el.style.animationDelay = (i++ * 30) + 'ms'; void el.offsetWidth; el.classList.add('pop'); }
    });
  });

  /* ------------------------------------------------------------------ marquee */
  function fillTape(id, list) {
    var html = list.map(function (tool) {
      return '<span class="chip"><img src="assets/logos/' + tool[0] + '.svg" alt="">' + tool[1] + '</span>';
    }).join('');
    document.getElementById(id).innerHTML = html + html; // doubled for a seamless loop
  }
  fillTape('tape-a', TOOLS.filter(function (_, i) { return i % 2 === 0; }));
  fillTape('tape-b', TOOLS.filter(function (_, i) { return i % 2 === 1; }));

  /* ------------------------------------------------------------------ copy email */
  var toast = document.getElementById('toast');
  document.getElementById('copy-email').addEventListener('click', function (e) {
    var email = e.currentTarget.dataset.email;
    var done = function () {
      toast.textContent = t('contact.copied');
      toast.classList.add('show');
      clearTimeout(toast._t);
      toast._t = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(email).then(done, function () { location.href = 'mailto:' + email; });
    else location.href = 'mailto:' + email;
  });
})();

// Every interaction on the page. No dependencies; everything degrades to plain HTML.

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => el.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, el: ParentNode = document) => Array.from(el.querySelectorAll<T>(sel));
const store = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* private mode: the choice just lasts for this page */
    }
  },
};
/* ------------------------------------------------------------------ theme */
// The new theme spreads out from the button as a soft-edged wave of light.
// The page stays visible the whole time: the old theme outside the wave, the new one inside.
function toggleTheme() {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
    store.set('theme', next);
  };
  type Transition = { ready: Promise<void>; finished: Promise<void>; skipTransition: () => void };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => Transition };
  const btn = $('[data-theme-toggle]');
  if (reduced || !doc.startViewTransition || !btn) return apply();

  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);
  // Far corner, plus the width of the feathered edge, plus a margin.
  const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + Math.max(innerWidth, innerHeight) * 0.2 + 120;
  const transition = doc.startViewTransition(apply);
  transition.ready
    .then(() => {
      const wave = root.animate({ '--theme-r': ['0px', `${reach}px`] } as PropertyIndexedKeyframes, {
        duration: 1100,
        easing: 'cubic-bezier(0.3, 0, 0.15, 1)',
        fill: 'forwards',
        pseudoElement: '::view-transition-new(root)',
      });
      // Once the transition is over, drop the animation so they do not pile up.
      transition.finished.finally(() => wave.cancel());
    })
    .catch(() => undefined);
  // Never let a transition linger over the page.
  setTimeout(() => transition.skipTransition(), 2200);
}
$('[data-theme-toggle]')?.addEventListener('click', toggleTheme);

/* --------------------------------------------------------------- language */
// Switching language does not reload the page. The other language's page is fetched and every
// text here is rewritten in place: short texts are decoded letter by letter, long ones cross-fade.
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SYNCED = ['.skip', '.bar', '.dock', '.palette', 'main', '.footer'];
const HEAD = ['meta[name="description"]', 'link[rel="canonical"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]', 'meta[property="og:locale"]'];
let currentPath = location.pathname;
let switching = false;

const onScreen = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > -40 && r.top < innerHeight + 40;
};

function decode(node: Text, to: string, delay: number) {
  const from = node.data;
  const start = performance.now() + delay;
  const duration = 480 + Math.min(to.length, 32) * 16;
  const tick = (now: number) => {
    const k = Math.min(1, (now - start) / duration);
    if (k >= 1) {
      node.data = to;
      return;
    }
    if (k > 0) {
      // Settled letters grow from the left; the rest keeps spinning through random glyphs.
      const length = Math.round(from.length + (to.length - from.length) * k);
      const settled = Math.floor(to.length * k);
      let out = to.slice(0, settled);
      for (let i = settled; i < length; i++) out += (to[i] ?? from[i]) === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      node.data = out;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function fadeSwap(el: Element, apply: () => void) {
  if (reduced || !onScreen(el)) return apply();
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 170, easing: 'ease-in', fill: 'forwards' }).finished.then((out) => {
    apply();
    out.cancel();
    el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out' });
  });
}

const meaningful = (n: Node) => n.nodeType === 1 || (n.nodeType === 3 && (n as Text).data.trim() !== '');

// Walk both trees together and queue the differences.
function sync(cur: Element, next: Element, jobs: (() => void)[]) {
  for (const { name, value } of Array.from(next.attributes)) {
    if (name !== 'class' && name !== 'style' && cur.getAttribute(name) !== value) cur.setAttribute(name, value);
  }
  for (const { name } of Array.from(cur.attributes)) {
    if (name !== 'class' && name !== 'style' && name !== 'data-active' && !next.hasAttribute(name)) cur.removeAttribute(name);
  }
  const a = Array.from(cur.childNodes).filter(meaningful);
  const b = Array.from(next.childNodes).filter(meaningful);
  const sameShape = a.length === b.length && a.every((n, i) => n.nodeType === b[i].nodeType && n.nodeName === b[i].nodeName);
  if (!sameShape) {
    // Different structure (another word count, say): replace the contents as a block.
    jobs.push(() =>
      fadeSwap(cur, () => {
        cur.innerHTML = next.innerHTML;
        const style = next.getAttribute('style');
        if (style) cur.setAttribute('style', style);
      }),
    );
    return;
  }
  a.forEach((node, i) => {
    if (node.nodeType === 1) return sync(node as Element, b[i] as Element, jobs);
    const text = node as Text;
    const to = (b[i] as Text).data;
    if (text.data.trim() === to.trim()) return;
    const parent = text.parentElement!;
    if (parent.hasAttribute('data-clock')) return; // live value, not a translation
    jobs.push(() => {
      if (reduced || !onScreen(parent)) text.data = to;
      else if (to.trim().length <= 46) decode(text, to, Math.max(0, parent.getBoundingClientRect().top / innerHeight) * 260);
      else fadeSwap(parent, () => (text.data = to));
    });
  });
}

async function switchLanguage(url: string, push: boolean) {
  if (switching) return;
  switching = true;
  try {
    const res = await fetch(url, { headers: { accept: 'text/html' } });
    if (!res.ok) throw new Error(String(res.status));
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const jobs: (() => void)[] = [];
    for (const sel of SYNCED) {
      const cur = $(sel);
      const next = doc.querySelector(sel);
      if (cur && next) sync(cur, next, jobs);
    }
    for (const sel of HEAD) {
      const cur = document.head.querySelector(sel);
      const next = doc.head.querySelector(sel);
      if (cur && next) for (const { name, value } of Array.from(next.attributes)) cur.setAttribute(name, value);
    }
    root.lang = doc.documentElement.lang;
    document.title = doc.title;
    if (push) history.pushState(null, '', url);
    currentPath = location.pathname;
    jobs.forEach((job) => job());
  } catch {
    location.href = url; // anything goes wrong: fall back to a normal page load
  } finally {
    switching = false;
  }
}

$$<HTMLAnchorElement>('[data-lang]').forEach((a) => {
  a.addEventListener('click', (e) => {
    if (a.hasAttribute('aria-current')) return e.preventDefault();
    store.set('lang', a.dataset.lang!);
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    switchLanguage(a.href, true);
  });
});
// Back and Forward move between the two languages the same way.
addEventListener('popstate', () => {
  if (location.pathname !== currentPath) switchLanguage(location.href, false);
});

/* --------------------------------------------------------------- headlines */
$$('[data-chars]').forEach((el) => {
  const enter = () => el.classList.add('is-in');
  if (reduced) enter();
  else if (el.dataset.chars === 'load') setTimeout(enter, 120);
  else
    new IntersectionObserver(
      ([e], io) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        enter();
      },
      { threshold: 0.3 },
    ).observe(el);

  // Letters rise toward the pointer as it passes.
  if (!finePointer || reduced) return;
  let chars = $$('.ch', el);
  let boxes: { x: number; y: number }[] = [];
  const measure = () =>
    (boxes = (chars = $$('.ch', el)).map((c) => {
      const r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }));
  el.addEventListener('pointerenter', measure);
  let queued = false;
  el.addEventListener('pointermove', (e) => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (!boxes.length) measure();
      chars.forEach((c, i) => {
        const d = Math.hypot(e.clientX - boxes[i].x, e.clientY - boxes[i].y);
        c.style.setProperty('--lift', Math.max(0, 1 - d / 190).toFixed(2));
      });
    });
  });
  el.addEventListener('pointerleave', () => chars.forEach((c) => c.style.setProperty('--lift', '0')));
});

/* ----------------------------------------------------------------- reveal */
const reveals = $$('.reveal');
if (reduced || !('IntersectionObserver' in window)) {
  reveals.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        const counter = e.target.querySelector<HTMLElement>('[data-count]');
        if (counter) countUp(counter);
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
  );
  reveals.forEach((el) => io.observe(el));
}

function countUp(el: HTMLElement) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || reduced) return;
  const dec = Number(el.dataset.dec || 0);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const tick = (now: number) => {
    const k = Math.min(1, (now - start) / 1500);
    el.textContent = (target * (1 - Math.pow(1 - k, 4))).toFixed(dec) + suffix;
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ------------------------------------------------------------------ clock */
const clocks = $$('[data-clock]');
if (clocks.length) {
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Costa_Rica' });
  const tick = () => {
    const now = fmt.format(new Date());
    clocks.forEach((c) => (c.textContent = now));
  };
  tick();
  setInterval(tick, 15000);
}

/* ----------------------------------------------------------------- scenes */
// Pinned scenes. For each one the scroll position becomes two numbers on the pinned element:
// --e (0 → 1 while it scrolls into view) and --p (0 → 1 while it is pinned).
// Both are eased toward their target every frame so the motion glides instead of ticking.
type Scene = { el: HTMLElement; pin: HTMLElement; top: number; height: number; p: number; e: number; active: number };
const bar = $('[data-bar]');
const scenes: Scene[] = $$('[data-scene]').map((el) => ({ el, pin: $('.scene-pin', el)!, top: 0, height: 0, p: -1, e: -1, active: -1 }));
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
let running = false;

function measure() {
  const y = scrollY;
  for (const s of scenes) {
    s.top = s.el.getBoundingClientRect().top + y;
    s.height = s.el.offsetHeight;
  }
}

function frame() {
  const y = scrollY;
  const vh = innerHeight;
  let moving = false;
  for (const s of scenes) {
    const tp = clamp01((y - s.top) / Math.max(1, s.height - vh));
    const te = clamp01((y + vh - s.top) / vh);
    // First frame, reduced motion, or far off screen: jump straight to the target.
    const jump = reduced || s.p < 0 || y + vh < s.top - vh || y > s.top + s.height + vh;
    const p = jump || Math.abs(tp - s.p) < 0.0005 ? tp : s.p + (tp - s.p) * 0.16;
    const e = jump || Math.abs(te - s.e) < 0.0005 ? te : s.e + (te - s.e) * 0.16;
    if (p !== tp || e !== te) moving = true;
    if (p !== s.p) s.pin.style.setProperty('--p', p.toFixed(4));
    if (e !== s.e) s.pin.style.setProperty('--e', e.toFixed(4));
    s.p = p;
    s.e = e;
    if (s.el.dataset.scene === 'project') {
      const active = p < 0.33 ? 0 : p < 0.66 ? 1 : 2;
      if (active !== s.active) s.pin.dataset.active = String((s.active = active));
    }
  }
  running = moving;
  if (moving) requestAnimationFrame(frame);
}

function kick() {
  bar?.classList.toggle('is-scrolled', scrollY > 24);
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

measure();
addEventListener('scroll', kick, { passive: true });
addEventListener('resize', () => (measure(), kick()));
addEventListener('load', () => (measure(), kick()));
new ResizeObserver(() => (measure(), kick())).observe(document.body);
kick();

/* ------------------------------------------------------------------- dock */
const dock = $('[data-dock]');
const dockLinks = $$<HTMLAnchorElement>('a.dock-item');
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => e.isIntersecting && dockLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id))),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  dockLinks.forEach((a) => {
    const s = $(a.getAttribute('href')!);
    if (s) spy.observe(s);
  });
}
// Icons swell under the pointer, like a desktop dock.
if (dock && finePointer && !reduced) {
  const items = $$('.dock-item', dock);
  dock.addEventListener('pointermove', (e) => {
    for (const item of items) {
      const r = item.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      item.style.setProperty('--s', (1 + 0.42 * Math.max(0, 1 - d / 120)).toFixed(3));
    }
  });
  dock.addEventListener('pointerleave', () => items.forEach((item) => item.style.setProperty('--s', '1')));
}

/* ------------------------------------------------------------- copy email */
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
const copyBtn = $<HTMLButtonElement>('[data-copy]');
if (copyBtn) {
  const label = $('span', copyBtn);
  let original = '';
  let timer = 0;
  copyBtn.addEventListener('click', async () => {
    if (!label || !(await copyText(copyBtn.dataset.copy!))) return;
    if (!timer) original = label.textContent ?? '';
    label.textContent = copyBtn.dataset.copied!;
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      label.textContent = original;
      timer = 0;
    }, 1800);
  });
}

/* ---------------------------------------------------------------- palette */
const palette = $<HTMLDialogElement>('[data-palette]');
const input = $<HTMLInputElement>('[data-palette-input]');
if (palette && input && typeof palette.showModal === 'function') {
  const cmds = $$('[data-cmd]', palette);
  const groups = $$('.palette-group', palette);
  const empty = $('[data-palette-empty]', palette)!;
  let sel = 0;
  const visible = () => cmds.filter((c) => !c.parentElement!.hidden);
  const select = (i: number) => {
    const list = visible();
    if (!list.length) return;
    sel = (i + list.length) % list.length;
    cmds.forEach((c) => c.classList.remove('is-sel'));
    list[sel].classList.add('is-sel');
    list[sel].scrollIntoView({ block: 'nearest' });
  };
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    cmds.forEach((c) => (c.parentElement!.hidden = !!q && !c.textContent!.toLowerCase().includes(q)));
    groups.forEach((g) => (g.hidden = !!q));
    empty.hidden = visible().length > 0;
    select(0);
  };
  const open = () => {
    if (palette.open) return;
    input.value = '';
    palette.showModal();
    filter();
  };
  $$('[data-palette-open]').forEach((b) => b.addEventListener('click', open));
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.open ? palette.close() : open();
    }
  });
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), select(sel + 1));
    else if (e.key === 'ArrowUp') (e.preventDefault(), select(sel - 1));
    else if (e.key === 'Enter') (e.preventDefault(), visible()[sel]?.click());
  });
  palette.addEventListener('pointermove', (e) => {
    const cmd = (e.target as HTMLElement).closest<HTMLElement>('[data-cmd]');
    if (cmd) select(visible().indexOf(cmd));
  });
  palette.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target === palette) return palette.close(); // click on the backdrop
    const cmd = target.closest<HTMLElement>('[data-cmd]');
    if (!cmd) return;
    palette.close();
    const action = cmd.dataset.action;
    if (action === 'theme') toggleTheme();
    else if (action === 'lang') $<HTMLAnchorElement>('[data-lang]:not([aria-current])')?.click();
    else if (action === 'copy') copyText($('[data-copy]')?.dataset.copy ?? '');
  });
}

/* -------------------------------------------------------------------- fan */
// The opening windows lean toward the pointer, and their loops pause when the scene is off screen.
const fan = $('[data-fan]');
if (fan) {
  new IntersectionObserver(([e]) => fan.classList.toggle('is-idle', !e.isIntersecting)).observe(fan);
  if (finePointer && !reduced) {
    let queued = false;
    let mx = 0;
    let my = 0;
    addEventListener(
      'pointermove',
      (e) => {
        mx = (e.clientX / innerWidth) * 2 - 1;
        my = (e.clientY / innerHeight) * 2 - 1;
        if (queued || fan.classList.contains('is-idle')) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          fan.style.setProperty('--mx', mx.toFixed(3));
          fan.style.setProperty('--my', my.toFixed(3));
        });
      },
      { passive: true },
    );
  }
}

/* --------------------------------------------------------------- carousel */
// The fan is a carousel. data-pos 0 is the front card, 1 the right one, 2 the left one.
if (fan) {
  const cards = $$('[data-card]', fan);
  const labels = $$('[data-label]', fan);
  const dots = $$('[data-dot]', fan);
  const heroPin = $('.scene-hero .scene-pin');
  let front = 1;
  let timer = 0;
  let resumeAt = 0;

  const show = (next: number) => {
    next = (next + cards.length) % cards.length;
    if (next === front) return;
    const rising = cards[next];
    rising.classList.add('is-rising');
    setTimeout(() => rising.classList.remove('is-rising'), 700);
    front = next;
    cards.forEach((card, i) => (card.dataset.pos = String((i - front + cards.length) % cards.length)));
    labels.forEach((l, i) => l.classList.toggle('is-on', i === front));
    dots.forEach((d, i) => d.classList.toggle('is-on', i === front));
  };
  // Any choice by the visitor holds the autoplay back for a while.
  const choose = (next: number) => {
    resumeAt = performance.now() + 9000;
    show(next);
  };

  $$<HTMLButtonElement>('[data-fan-step]', fan).forEach((b) => b.addEventListener('click', () => choose(front + Number(b.dataset.fanStep))));
  cards.forEach((card, i) =>
    card.addEventListener('click', () => {
      if (i !== front) choose(i);
    }),
  );
  fan.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') choose(front + 1);
    else if (e.key === 'ArrowLeft') choose(front - 1);
  });

  // Swipe sideways on touch screens; vertical drags still scroll the page.
  let startX = 0;
  let startY = 0;
  fan.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  fan.addEventListener('pointerup', (e) => {
    if (e.pointerType === 'mouse') return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - startY) * 1.4) choose(front + (dx < 0 ? 1 : -1));
  });

  // The fan only takes clicks once it has risen, and only plays on its own while it is fully up.
  const tick = () => {
    const f = Number(getComputedStyle(heroPin ?? fan).getPropertyValue('--p')) || 0;
    const ready = (f - 0.12) / 0.7 > 0.85;
    fan.classList.toggle('is-ready', ready);
    if (ready && !reduced && !fan.classList.contains('is-idle') && !fan.matches(':hover') && performance.now() > resumeAt) show(front + 1);
  };
  const ready = () => fan.classList.toggle('is-ready', (Number(getComputedStyle(heroPin ?? fan).getPropertyValue('--p')) - 0.12) / 0.7 > 0.85);
  addEventListener('scroll', ready, { passive: true });
  ready();
  timer = window.setInterval(tick, 4200);
  addEventListener('pagehide', () => clearInterval(timer));
}

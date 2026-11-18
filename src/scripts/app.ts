// Every interaction on the page. No dependencies; everything degrades to plain HTML.

const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
// The scroll position and viewport height, read once per scroll/resize event while layout is clean.
// Animation frames use these instead of reading scrollY after styles were written (a forced layout).
let sy = scrollY;
let vh = innerHeight;
addEventListener('scroll', () => (sy = scrollY), { passive: true });
addEventListener('resize', () => ((sy = scrollY), (vh = innerHeight)));
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
const SYNCED = ['.skip', '.frame', 'main', '.footer'];
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

// The headline starts as soon as the script runs.
/* ---------------------------------------------------------------- plotter */
// The opening: the pen draws the frame along the screen's edge while a counter follows the real
// load (fonts and the page), the title block writes itself, then the sheet lifts off.
// Everything that animates on arrival waits for it through whenReady().
const plotter = $('[data-plotter]');
const plotting = !!plotter && !root.classList.contains('no-plot') && getComputedStyle(plotter).display !== 'none';
const waiting: (() => void)[] = [];
let plotted = !plotting;
function whenReady(cb: () => void) {
  if (plotted) cb();
  else waiting.push(cb);
}
if (plotting && plotter) runPlotter(plotter);
else plotter?.classList.add('is-gone');

function runPlotter(el: HTMLElement) {
  const svg = $<SVGSVGElement>('[data-plot-frame]', el)!;
  const rect = svg.querySelector('rect')!;
  const head = $('[data-plot-head]', el)!;
  const mark = $('[data-plot-mark]', el)!;
  const num = $('[data-plot-n]', el)!;
  const state = $('[data-plot-state]', el);
  const rows = $$('.plot-block div', el);
  const f = parseFloat(getComputedStyle(root).getPropertyValue('--frame')) || 14;
  // The frame the pen draws is the site's own frame, to the pixel.
  const W = innerWidth;
  const H = innerHeight;
  const w = W - 2 * f - 1;
  const h = H - 2 * f - 1;
  const per = 2 * (w + h);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  rect.setAttribute('x', String(f + 0.5));
  rect.setAttribute('y', String(f + 0.5));
  rect.setAttribute('width', String(w));
  rect.setAttribute('height', String(h));
  rect.style.strokeDasharray = `${per}`;
  rect.style.strokeDashoffset = `${per}`;
  // Point on the frame at a distance d along it, clockwise from the top-left corner.
  const at = (d: number): [number, number] => {
    if (d < w) return [f + d, f];
    if ((d -= w) < h) return [f + w, f + d];
    if ((d -= h) < w) return [f + w - d, f + h];
    return [f, f + h - (d - w)];
  };

  let loaded = document.readyState === 'complete';
  addEventListener('load', () => (loaded = true), { once: true });
  let fonts = false;
  document.fonts?.ready.then(() => (fonts = true));
  const MIN = 1500; // the drawing never rushes
  const MAX = 3200; // and never holds the page hostage
  const t0 = performance.now();
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  let shown = 0;
  rows.forEach((r, i) => setTimeout(() => r.classList.add('is-on'), 220 + i * 170));

  const frame = (now: number) => {
    const t = now - t0;
    const ready = (loaded && fonts) || t > MAX;
    // Time sets the pace; until the page is ready the counter stops short of the end.
    const target = Math.min(ease(Math.min(t / MIN, 1)), ready ? 1 : 0.92);
    shown += (target - shown) * 0.2;
    if (ready && t > MIN && 1 - shown < 0.004) shown = 1;
    const d = shown * per;
    rect.style.strokeDashoffset = `${per - d}`;
    const [x, y] = at(Math.min(d, per - 0.01));
    head.style.setProperty('--hx', `${x}px`);
    head.style.setProperty('--hy', `${y}px`);
    mark.style.setProperty('--fill', (shown * 100).toFixed(1));
    num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (shown < 1) return requestAnimationFrame(frame);
    finish();
  };
  requestAnimationFrame(frame);

  function finish() {
    mark.classList.add('is-solid');
    if (state) state.textContent = state.dataset.ready ?? '';
    setTimeout(() => {
      el.classList.add('is-out');
      setTimeout(() => {
        el.classList.add('is-lift');
        // The cover starts plotting in as the sheet comes off it.
        plotted = true;
        waiting.splice(0).forEach((cb) => cb());
        setTimeout(() => el.classList.add('is-gone'), 1000);
      }, 260);
    }, 320);
  }
}

/* --------------------------------------------------------------- headlines */
$$('[data-chars]').forEach((el) => {
  const enter = () => el.classList.add('is-in');
  if (reduced) enter();
  else if (el.dataset.chars === 'load') whenReady(() => setTimeout(enter, 60));
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
  if (!finePointer || reduced || el.hasAttribute('data-name')) return;
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
} else whenReady(observeReveals);

function observeReveals() {
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
  const y = sy;
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
    } else if (s.el.dataset.scene === 'strata') {
      // First fifth: the stack tilts and comes apart (--x). Then each layer takes its turn.
      const x = clamp01(p / 0.2);
      s.pin.style.setProperty('--x', (x * x * (3 - 2 * x)).toFixed(4));
      const active = p < 0.2 ? -1 : Math.min(3, Math.floor(((p - 0.2) / 0.72) * 4));
      if (active !== s.active) s.pin.dataset.active = String((s.active = active));
    }
  }
  running = moving;
  if (moving) requestAnimationFrame(frame);
}

function kick() {
  if (!running) {
    running = true;
    requestAnimationFrame(frame);
  }
}

measure();
addEventListener('scroll', kick, { passive: true });

// The cover name unplots as the cover scrolls away (see .name .ch in the CSS).
const unplotWrap = $('[data-lens]');
if (unplotWrap && !reduced) {
  let last = -1;
  let queued = false;
  // Done by the time the name's bottom edge reaches the top bar, so all of it plays in view.
  let range = 1;
  let start = 0;
  const measureRange = () => {
    const r = unplotWrap.getBoundingClientRect();
    // It starts when the name's top reaches the top bar, and is done when its bottom does.
    start = Math.max(r.top + scrollY - 70, 0);
    range = Math.max(r.bottom + scrollY - 90 - start, 1);
  };
  measureRange();
  addEventListener('resize', measureRange);
  const unplot = () => {
    queued = false;
    const out = Math.min(Math.max((sy - start) / range, 0), 1);
    if (Math.abs(out - last) < 0.001) return;
    last = out;
    unplotWrap.style.setProperty('--out', out.toFixed(3));
  };
  whenReady(() => {
    unplot();
    addEventListener(
      'scroll',
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(unplot);
      },
      { passive: true },
    );
  });
}
addEventListener('resize', () => (measure(), kick()));
addEventListener('load', () => (measure(), kick()));
new ResizeObserver(() => (measure(), kick())).observe(document.body);
kick();

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

/* ------------------------------------------------------------ the drawing */
// The name is fitted to the width of the sheet, and the dimension line above it reports that width.
const nameEl = $('[data-name]');
function fitName() {
  if (!nameEl) return;
  // The wrapper holds the name and its outline twin; the sheet's grid sets the width to fill.
  const box = nameEl.parentElement!;
  const grid = nameEl.closest('.cover-grid') as HTMLElement;
  const cs = getComputedStyle(grid);
  const avail = grid.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  // Measure a still copy: the real name may be mid-animation, drawn thinner (and narrower) than it ends.
  const probe = nameEl.cloneNode(true) as HTMLElement;
  probe.classList.remove('is-in');
  probe.removeAttribute('data-name');
  probe.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;--name-size:100px';
  box.append(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  if (!w) return;
  const size = Math.max(40, (100 * avail) / w);
  box.style.setProperty('--name-size', `${size.toFixed(2)}px`);
}
// Sheet titles keep their size unless their longest word would not fit; then they shrink just enough.
const titles = $$('.sheet-title, .contact-title');
function fitTitles() {
  for (const el of titles) {
    el.style.fontSize = '';
    const avail = el.clientWidth;
    const widest = Math.max(...$$('.word', el).map((w) => w.scrollWidth));
    if (avail && widest > avail) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * avail) / widest}px`;
  }
}
const fitAll = () => (fitName(), fitTitles());
fitAll();
document.fonts?.ready.then(fitAll);
addEventListener('resize', fitAll);

// X-ray lens over the name: the solid letters open in a circle under the pointer and the
// outline drawing of the same name shows through. The lens glides after the pointer.
const lens = $('[data-lens]');
if (lens && finePointer && !reduced) {
  const ring = document.createElement('i');
  ring.className = 'lens-ring';
  ring.setAttribute('aria-hidden', 'true');
  lens.append(ring);
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  const step = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    lens.style.setProperty('--lx', `${x.toFixed(1)}px`);
    lens.style.setProperty('--ly', `${y.toFixed(1)}px`);
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0;
  };
  const aim = (e: PointerEvent, jump = false) => {
    const r = lens.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
    if (jump) {
      x = tx;
      y = ty;
    }
    if (!raf) raf = requestAnimationFrame(step);
  };
  lens.addEventListener('pointerenter', (e) => {
    aim(e, true);
    lens.classList.remove('is-closing');
    lens.classList.add('is-lens');
  });
  lens.addEventListener('pointermove', (e) => aim(e));
  lens.addEventListener('pointerleave', () => {
    // Keep the mask on while the lens shrinks back to nothing.
    lens.classList.remove('is-lens');
    lens.classList.add('is-closing');
    setTimeout(() => lens.classList.remove('is-closing'), 500);
  });
}

// The register: a screenshot of the project follows the pointer down the rows.
const preview = $('[data-reg-preview]');
if (preview && finePointer && !reduced) {
  const img = $<HTMLImageElement>('img', preview)!;
  $$<HTMLAnchorElement>('[data-preview]').forEach((row) => {
    row.addEventListener('pointerenter', () => {
      img.src = row.dataset.preview!;
      preview.classList.add('is-on');
    });
    row.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
    row.addEventListener('pointermove', (e) => {
      const w = preview.offsetWidth;
      const h = preview.offsetHeight;
      const x = Math.min(innerWidth - w - 24, e.clientX + 28);
      preview.style.setProperty('--px', `${x}px`);
      preview.style.setProperty('--py', `${e.clientY - h / 2}px`);
    });
  });
}

// Which sheet is in view: marked in the index and counted in the frame.
const sheetNow = $('[data-sheet-now]');
const sheetLinks = $$('[data-sheet-link]');
const sheets = $$('[data-sheet]');
const frameEl = $('[data-sheet-nos]');
const sheetNos: string[] = JSON.parse(frameEl?.dataset.sheetNos ?? '[]');
const sheetIndex: number[] = JSON.parse(frameEl?.dataset.sheetIndex ?? '[]');
const ruler = $('[data-progress]');
let current = -1;
// Sheet tops are measured once (and on resize/load), not on every scroll frame.
let sheetTops: [number, number][] = [];
function measureSheets() {
  sheetTops = sheets.map((el) => [el.getBoundingClientRect().top + scrollY, Number(el.dataset.sheet)]);
  docMax = document.documentElement.scrollHeight - innerHeight;
}
let docMax = 0;
function spy() {
  const mid = sy + vh * 0.45;
  let on = 0;
  for (const [top, n] of sheetTops) if (top < mid) on = n;
  if (on !== current) {
    current = on;
    const link = sheetIndex[on] ?? on;
    const no = sheetNos[on] ?? String(on + 1).padStart(2, '0');
    sheetLinks.forEach((a) => {
      const isOn = Number(a.dataset.sheetLink) === link;
      a.classList.toggle('is-on', isOn);
      // The projects link counts which project is in view: 02.1, 02.2, 02.3.
      const n = a.querySelector<HTMLElement>('[data-index-n]');
      if (n) n.textContent = isOn ? no : n.dataset.indexN!;
    });
    if (sheetNow) sheetNow.textContent = no;
  }
  ruler?.style.setProperty('--read', (docMax > 0 ? sy / docMax : 0).toFixed(4));
}
let spyQueued = false;
addEventListener(
  'scroll',
  () => {
    if (spyQueued) return;
    spyQueued = true;
    requestAnimationFrame(() => {
      spyQueued = false;
      spy();
    });
  },
  { passive: true },
);
measureSheets();
spy();
addEventListener('resize', () => (measureSheets(), spy()));
addEventListener('load', () => (measureSheets(), spy()));

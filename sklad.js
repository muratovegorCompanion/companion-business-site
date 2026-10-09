// Інтерактивний склад (sklad.html): фотокадри складу з позначками зон.
// Клік — і кадр наїжджає на зону, а поруч відкривається картка.
// Тексти зон не дублюються: картка бере їх зі списку статей #wh-zones.
// На сторінці логістики списку немає — беремо зони й ролі з sklad.html.
if (!document.getElementById('wh-zones')) {
  const src = new DOMParser().parseFromString(await (await fetch('sklad.html')).text(), 'text/html');
  const box = document.createElement('div');
  box.hidden = true;
  box.append(src.getElementById('wh-zones'), ...src.querySelectorAll('[data-role-card]'));
  document.body.append(box);
}
const stage = document.getElementById('wh-stage');
const photo = document.getElementById('wh-photo');
const frame = document.getElementById('wh-ph-frame');
const panel = document.getElementById('wh-panel');
const panelBody = document.getElementById('wh-panel-body');
const intro = document.getElementById('wh-intro');
const tourLabel = document.getElementById('wh-tour-label');
const hint = document.getElementById('wh-hint');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 860px)');

const ZONES = ['gate','yard','truck','dock','racks','neighbor','sprinkler','engineering','operator','building'];
const zoneEl = Object.fromEntries(ZONES.map(z => [z, document.getElementById('z-' + z)]));
const zoneTitle = z => zoneEl[z].querySelector('h3').textContent;
const zoneRoles = z => zoneEl[z].dataset.roles.split(' ');
const num = z => String(ZONES.indexOf(z) + 1).padStart(2, '0');

/* ---------- Кадри: де на кожному фото стоїть зона, у відсотках ---------- */
const FRAMES = {
  obshchiy: { gate:[73,84], yard:[44,77], truck:[38,66], dock:[31,53], racks:[52,37],
    neighbor:[74,45], sprinkler:[44,29], engineering:[94,40], operator:[26,38], building:[87,30] },
  top: { gate:[85,85], yard:[56,76], truck:[49,68], dock:[39,57], racks:[44,27],
    neighbor:[72,30], sprinkler:[33,20], engineering:[85,22], operator:[22,42], building:[16,18] },
  side: { gate:[76,80], yard:[40,70], truck:[14,60], dock:[22,50], racks:[44,40],
    neighbor:[78,44], sprinkler:[56,29], engineering:[94,49], operator:[16,38], building:[88,27] },
};
/* Облёт: на «Загальному» виді склад можна тягнути — кадри відео облёту
   змінюються під пальцем. ORBIT_KEYS — позиції зон на опорних кадрах;
   між ними позиції інтерполюються, null — зону з цього ракурсу не видно. */
const ORBIT_N = 65, ORBIT_C = 16;
const ORBIT_SRC = i => `sklad-media/orbit/${String(i).padStart(2, '0')}.webp`;
const ORBIT_KEYS = {
  0: { gate:[50,84], yard:[30,75], truck:[33,62], dock:[36,52], racks:[55,37],
    neighbor:[78,46], sprinkler:[52,31], engineering:[96,52], operator:[31,37], building:[90,30] },
  8: { gate:[62,86], yard:[38,75], truck:[34,64], dock:[33,52], racks:[53,37],
    neighbor:[76,46], sprinkler:[48,30], engineering:[95,47], operator:[28,38], building:[90,30] },
  [ORBIT_C]: FRAMES.obshchiy,
  28: { gate:[68,86], yard:[38,76], truck:[35,66], dock:[28,53], racks:[52,37],
    neighbor:[72,46], sprinkler:[44,29], engineering:[92,44], operator:[24,38], building:[86,29] },
  40: { gate:[40,84], yard:[24,72], truck:[20,63], dock:[18,50], racks:[42,36],
    neighbor:[62,46], sprinkler:[38,29], engineering:[90,50], operator:[18,38], building:[86,28] },
  52: { gate:[9,82], yard:[20,66], truck:[8,58], dock:[16,45], racks:[37,35],
    neighbor:[52,45], sprinkler:[35,26], engineering:[80,48], operator:[14,35], building:[78,30] },
  64: { gate:null, yard:[35,75], truck:null, dock:null, racks:[33,30],
    neighbor:[40,45], sprinkler:[30,24], engineering:[72,50], operator:[13,32], building:[75,30] },
};
const HINT_ORBIT = 'Тягніть фото вбік, щоб покрутити склад · натисніть на позначку, щоб побачити ризики';
const HINT_CLICK = 'Натисніть на позначку, щоб побачити ризики';
const keyIdx = Object.keys(ORBIT_KEYS).map(Number).sort((a, b) => a - b);
let orbit = ORBIT_C;
const orbitSpot = (i, z) => {
  let a = keyIdx[0], b = keyIdx[keyIdx.length - 1];
  keyIdx.forEach(k => { if (k <= i) a = k; if (k >= i && b >= k) b = k; });
  const p = ORBIT_KEYS[a][z], q = ORBIT_KEYS[b][z];
  if (!p || !q) return null;
  const t = a === b ? 0 : (i - a) / (b - a);
  return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
};
const spotOf = (v, z) => v === 'obshchiy' ? orbitSpot(orbit, z) : FRAMES[v][z];

const layers = Object.fromEntries([...frame.querySelectorAll('[data-frame]')].map(l => [l.dataset.frame, l]));
const marks = {};   // marks[frame][zone] → кнопка
Object.entries(FRAMES).forEach(([f, spots]) => {
  marks[f] = {};
  const shade = document.createElement('div');   // затемнення навколо вибраної зони
  shade.className = 'wh-ph-spot'; shade.setAttribute('aria-hidden', 'true');
  layers[f].appendChild(shade);
  ZONES.forEach(z => {
    const [x, y] = spots[z];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'wh-mk' + (x > 70 ? ' is-flip' : '');
    b.style.left = x + '%'; b.style.top = y + '%';
    b.innerHTML = `<i>${num(z)}</i><span>${zoneTitle(z)}</span>`;
    b.setAttribute('aria-label', `${zoneTitle(z)}: показати ризики`);
    b.addEventListener('click', () => select(z, { fly:true }));
    layers[f].appendChild(b);
    marks[f][z] = b;
  });
});

/* ---------- Стан ---------- */
let current = null, role = 'all', tourIdx = -1, view = 'obshchiy';

const paint = () => {
  ZONES.forEach(z => {
    const on = z === current;
    const dim = !on && role !== 'all' && !zoneRoles(z).includes(role);
    Object.values(marks).forEach(m => { m[z].classList.toggle('is-on', on); m[z].classList.toggle('is-dim', dim); });
    zoneEl[z].classList.toggle('is-on', on);
  });
};

/* Наїзд на зону: кадр масштабується так, щоб зона стала в центрі вільної
   від картки частини сцени, але фото завжди закриває сцену повністю. */
const ZOOM = 1.55, ZOOM_SMALL = 1.9;
const layout = () => {
  const bw = photo.clientWidth, bh = photo.clientHeight;
  if (!bw || !bh) return;
  const r = 1147 / 2048;
  const fw = Math.max(bw, bh / r), fh = fw * r;
  const left = (bw - fw) / 2, top = (bh - fh) / 2;
  frame.style.width = fw + 'px'; frame.style.height = fh + 'px';
  frame.style.left = left + 'px'; frame.style.top = top + 'px';
  let s = 1, tx = 0, ty = 0;
  const spot = current && spotOf(view, current);
  const side = spot && !small.matches && spot[0] > 55 ? 'left' : 'right';
  stage.classList.toggle('panel-left', side === 'left');
  if (spot) {
    s = small.matches ? ZOOM_SMALL : ZOOM;
    const free = small.matches ? 0 : panel.offsetWidth + 36;
    const cx = side === 'left' ? free + (bw - free) / 2 : (bw - free) / 2, cy = bh / 2;
    tx = cx - left - s * fw * spot[0] / 100;
    ty = cy - top - s * fh * spot[1] / 100;
    tx = Math.min(-left, Math.max(bw - left - s * fw, tx));
    ty = Math.min(-top, Math.max(bh - top - s * fh, ty));
    frame.style.setProperty('--sx', spot[0] + '%');
    frame.style.setProperty('--sy', spot[1] + '%');
  }
  frame.style.setProperty('--s', s);
  frame.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
  frame.classList.toggle('is-zoom', !!spot);
};
new ResizeObserver(layout).observe(photo);
small.addEventListener('change', layout);

/* ---------- Картка ---------- */
const closeBtn = () => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'wh-panel-close'; b.setAttribute('aria-label', 'Закрити');
  b.textContent = '✕'; b.addEventListener('click', clear);
  return b;
};
const ctaBlock = () => {
  const d = document.createElement('div'); d.className = 'wh-panel-cta';
  d.innerHTML = '<a class="nh-btn nh-btn-primary" href="/#meeting">Обговорити ваш склад <span class="nh-ar" aria-hidden="true">↗</span></a>';
  return d;
};
const openCard = (el) => {
  panelBody.replaceChildren(el);
  intro.hidden = true;
  panel.scrollTop = 0;
  stage.classList.add('has-card');
};

function showZone(z) {
  const art = zoneEl[z].cloneNode(true);
  art.removeAttribute('id');
  art.classList.remove('is-on');
  const k = document.createElement('span');
  k.className = 'wh-kicker';
  k.textContent = `Зона ${num(z)} з ${ZONES.length}`;
  art.prepend(k);
  art.prepend(closeBtn());
  art.appendChild(ctaBlock());
  openCard(art);
}
function showRole(r) {
  const card = document.querySelector(`[data-role-card="${r}"]`).cloneNode(true);
  card.removeAttribute('id');
  card.prepend(closeBtn());
  const list = document.createElement('div'); list.className = 'wh-panel-zones';
  ZONES.filter(z => zoneRoles(z).includes(r)).forEach(z => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = zoneTitle(z);
    b.addEventListener('click', () => select(z, { fly:true }));
    list.appendChild(b);
  });
  const h = document.createElement('h4'); h.textContent = 'Ваші зони на складі'; h.className = 'wh-kicker'; h.style.marginTop = '18px';
  card.append(h, list, ctaBlock());
  openCard(card);
}

function select(z, { fly = false } = {}) {
  // З поточного ракурсу облёту зону не видно — повертаємось до основного кадру.
  if (view === 'obshchiy' && !orbitSpot(orbit, z)) showOrbit(ORBIT_C, { settle:true });
  current = z;
  tourIdx = ZONES.indexOf(z);
  tourLabel.innerHTML = `<b>${num(z)}/${ZONES.length}</b>${zoneTitle(z)}`;
  showZone(z);
  paint();
  layout();
  if (small.matches && fly) panel.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block:'nearest' });
}
function clear() {
  current = null;
  panelBody.replaceChildren();
  intro.hidden = false;
  stage.classList.remove('has-card');
  tourLabel.textContent = tourIdx < 0 ? 'Почати тур складом' : 'Продовжити тур';
  paint();
  layout();
}

/* ---------- Вид, роль, тур ---------- */
const setView = (v) => {
  view = v;
  stage.querySelectorAll('[data-view]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.view === v)));
  Object.entries(layers).forEach(([f, l]) => l.classList.toggle('is-on', f === v));
  hint.textContent = v === 'obshchiy' && ORBIT_N > 1 ? HINT_ORBIT : HINT_CLICK;
  layout();
};
stage.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
stage.querySelectorAll('[data-role]').forEach(b => b.addEventListener('click', () => {
  stage.querySelectorAll('[data-role]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  role = b.dataset.role;
  if (role === 'all') { if (current) paint(); else clear(); }
  else { current = null; showRole(role); paint(); layout(); }
}));
const step = (dir) => {
  const n = ZONES.length;
  const next = tourIdx < 0 ? (dir > 0 ? 0 : n - 1) : (tourIdx + dir + n) % n;
  select(ZONES[next], { fly:true });
};
document.getElementById('wh-next').addEventListener('click', () => step(1));
document.getElementById('wh-prev').addEventListener('click', () => step(-1));
tourLabel.addEventListener('click', () => current ? select(current, { fly:true }) : step(1));
document.querySelectorAll('.wh-zones .wh-show').forEach(b => b.addEventListener('click', () => {
  stage.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block:'start' });
  select(b.dataset.show, { fly:true });
}));
stage.addEventListener('keydown', e => {
  if (e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
  if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
  if (e.key === 'Escape') clear();
});

/* ---------- Облёт: тягнемо «Загальний» вид ---------- */
const orbitImg = layers.obshchiy.querySelector('img');
const photoSrc = orbitImg.currentSrc || orbitImg.src;
const placeOrbit = () => {
  ZONES.forEach(z => {
    const p = orbitSpot(orbit, z), b = marks.obshchiy[z];
    b.classList.toggle('is-gone', !p);
    if (!p) return;
    b.style.left = p[0] + '%'; b.style.top = p[1] + '%';
    b.classList.toggle('is-flip', p[0] > 70);
  });
};
const cache = [];
const loadOrbit = () => {
  if (cache.length || ORBIT_N < 2) return;
  for (let i = 0; i < ORBIT_N; i++) { const im = new Image(); im.decoding = 'async'; im.src = ORBIT_SRC(i); cache[i] = im; }
};
const showOrbit = (i, { settle = false } = {}) => {
  i = Math.max(0, Math.min(ORBIT_N - 1, Math.round(i)));
  if (i !== orbit || settle) {
    orbit = i;
    orbitImg.removeAttribute('srcset');
    // У центрі — чітке фото, на інших ракурсах — кадри облёту.
    orbitImg.src = settle && i === ORBIT_C ? photoSrc : (cache[i] && cache[i].complete ? cache[i].src : ORBIT_SRC(i));
  }
  if (settle) placeOrbit();
};
let drag = null;
photo.addEventListener('pointerdown', e => {
  if (ORBIT_N < 2 || view !== 'obshchiy' || current || e.button > 0 || e.target.closest('.wh-mk')) return;
  loadOrbit();
  drag = { x:e.clientX, i:orbit, moved:false, id:e.pointerId };
});
photo.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 6) return;
  if (!drag.moved) { drag.moved = true; photo.setPointerCapture(e.pointerId); frame.classList.add('is-drag'); }
  showOrbit(drag.i - dx * (ORBIT_N - 1) / (photo.clientWidth * .9));
});
const endDrag = () => {
  if (!drag) return;
  if (drag.moved) { frame.classList.remove('is-drag'); showOrbit(orbit, { settle:true }); }
  drag = null;
};
photo.addEventListener('pointerup', endDrag);
photo.addEventListener('pointercancel', endDrag);

// Підказка: коли сцена вперше з’являється, склад трохи «повертається» сам.
if (ORBIT_N > 1) {
  addEventListener('load', loadOrbit, { once:true });
  if (!still) new IntersectionObserver(([en], io) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    setTimeout(() => {
      if (drag || current || view !== 'obshchiy') return;
      const amp = Math.min(14, ORBIT_N - 1 - ORBIT_C), t0 = performance.now(), d = 2200;
      frame.classList.add('is-drag');
      const step = (now) => {
        const k = Math.min(1, (now - t0) / d);
        if (drag || current) { frame.classList.remove('is-drag'); return; }
        showOrbit(ORBIT_C + amp * Math.sin(k * Math.PI));
        if (k < 1) requestAnimationFrame(step);
        else { frame.classList.remove('is-drag'); showOrbit(ORBIT_C, { settle:true }); }
      };
      requestAnimationFrame(step);
    }, 900);
  }, { threshold:.5 }).observe(photo);
}

paint();
layout();

// Інтерактивний склад (sklad.html): фотокадри складу з позначками зон.
// Клік — і кадр наїжджає на зону, а поруч відкривається картка.
// Тексти зон не дублюються: картка бере їх зі списку статей #wh-zones.
const stage = document.getElementById('wh-stage');
const photo = document.getElementById('wh-photo');
const frame = document.getElementById('wh-ph-frame');
const panel = document.getElementById('wh-panel');
const panelBody = document.getElementById('wh-panel-body');
const intro = document.getElementById('wh-intro');
const tourLabel = document.getElementById('wh-tour-label');
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
  const spot = current && FRAMES[view][current];
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

paint();
layout();

// Конструктор програми ДМС.
//
// Рахує орієнтовний діапазон внеску на одну людину на рік. Усі числа —
// з наших зведених тендерів 2026-27: п'ять компаній, дев'ять програм,
// 67 пропозицій страхових. Це не тариф і не розрахунок: тариф дає тільки
// тендер, а тут показано, як рухається ціна від вибору.
//
// Без JS сторінка лишається читабельною: розмітка містить усі опції
// як звичайний список, скрипт лише оживляє її.
(function initCalculator() {
  const root = document.querySelector('[data-calc]');
  if (!root) return;

  // Рівень клінік — головний чинник ціни. Діапазони виведені з тендерів:
  // кожен рядок підтверджують щонайменше два тендери різних галузей.
  const TIERS = {
    state:   { min:  9000, max: 12000 },
    mild:    { min: 13000, max: 18000 },
    mid:     { min: 18000, max: 25000 },
    high:    { min: 28000, max: 38000 },
    premium: { min: 40000, max: 52000 },
  };

  // Знижка за чисельність — тільки на базову програму, не на опції.
  // Цифри назвала експертка: 20–50 осіб близько 2%, 50–100 — 5%, далі 7%.
  const volumeDiscount = (headcount) =>
    headcount >= 100 ? 0.07 : headcount >= 50 ? 0.05 : headcount >= 20 ? 0.02 : 0;

  // Доплати за опції — мінімум і максимум із реальних пропозицій.
  // Там, де частина страхових віддає опцію безкоштовно, мінімум — нуль.
  // Середні доплати з наших тендерів. Те, що входить у стандартну програму
  // за замовчуванням, тут не значиться — інакше людина платить двічі.
  const OPTIONS = {
    checkup:    2200,
    flu:        1550,   // GC Flu 1 400, Ваксигрип 1 700; торік 700 і 900
    vitamins:    600,   // ЦІНУ ПІДТВЕРДИТИ
    dental:     1000,   // за кожну 1 000 грн ліміту; для великих колективів ~70%
    exclusion:  1400,   // за кожну 1 000 грн ліміту
    critical:    700,   // онкологія, туберкульоз, діабет — у ліміті
    ophthalm:    900,   // ЦІНУ ПІДТВЕРДИТИ
    derma:       900,   // ЦІНУ ПІДТВЕРДИТИ
    remission:  1400,
    psy:        1100,
    pregnancy:   400,   // 1–3 ведення на колектив, ліміт розкидається на всіх
    travel:      800,   // окремий вид страхування, рідкість
    sedative:    350,
    saline:       60,
    fullcover:  1200,
    cutmassage: -900,   // відмова від масажу, який входить у стандарт
    cutclinic: -1700,
    cutonco:    -800,
  };

  const money = (value) =>
    Math.round(value / 100) * 100 === 0 ? '0' :
    (Math.round(value / 100) * 100).toLocaleString('uk-UA').replace(/ /g, ' ');

  const out       = root.querySelector('[data-calc-out]');
  const outPerson = root.querySelector('[data-calc-person]');
  const outTotal  = root.querySelector('[data-calc-total]');
  const outCount  = root.querySelector('[data-calc-count]');
  const people    = root.querySelector('[data-calc-people]');

  function recount() {
    const tierInput = root.querySelector('input[name="tier"]:checked');
    if (!tierInput) return;

    const tier = TIERS[tierInput.value];
    const headcount = Math.max(20, parseInt(people.value, 10) || 20);
    const discount = 1 - volumeDiscount(headcount);
    let min = tier.min * discount;
    let max = tier.max * discount;
    let picked = 0;

    root.querySelectorAll('input[name="opt"]:checked').forEach((box) => {
      const surcharge = OPTIONS[box.value];
      if (!surcharge) return;
      // Стоматологія і запас на непокрите рахуються за кожну 1 000 грн ліміту,
      // тож ціна множиться на обраний розмір.
      const limit = root.querySelector(`[data-lim="${box.value}"]`);
      const steps = limit ? Number(limit.value) / 1000 : 1;
      min += surcharge * steps;
      max += surcharge * steps;
      picked += 1;
    });


    min = Math.max(min, 4000);
    max = Math.max(max, min + 1000);
    outPerson.textContent = `${money(min)} – ${money(max)}`;

    const note = root.querySelector('[data-calc-discount]');
    if (note) {
      const percent = Math.round(volumeDiscount(headcount) * 100);
      note.textContent = percent
        ? `Враховано знижку за чисельність — ${percent}% на базову програму.`
        : 'Від 20 осіб страхові дають знижку на базову програму.';
    }
    outTotal.textContent = `${money(min * headcount)} – ${money(max * headcount)}`;
    outCount.textContent = headcount;

    out.hidden = false;
  }

  // Кнопка веде до форми й переносить туди зібрану конфігурацію: менеджер
  // одразу бачить, що саме людина обрала, і не починає розмову з нуля.
  const LABELS = {
    state: 'державні та відомчі', mild: 'недорогі комерційні',
    mid: 'середній рівень', high: 'високий рівень', premium: 'брендові мережі',
    checkup: 'профогляд', flu: 'щеплення від грипу', vitamins: 'вітаміни',
    dental: 'стоматологія', exclusion: 'запас на непокриті послуги',
    critical: 'критичні захворювання', ophthalm: 'офтальмологія',
    derma: 'дерматологія', remission: 'хронічні в ремісії',
    psy: 'консультації психолога', pregnancy: 'ведення вагітності',
    travel: 'поліс для відряджень', sedative: 'заспокійливі',
    saline: 'сольові розчини', fullcover: '100% брендових клінік',
    cutmassage: 'без масажу', cutclinic: 'знижене покриття брендових',
    cutonco: 'спільний ліміт на новоутворення',
  };

  // Клік по списку не має перемикати саму опцію — він усередині label.
  root.querySelectorAll('[data-lim]').forEach((select) => {
    select.addEventListener('click', (event) => event.stopPropagation());
  });

  const go = root.querySelector('[data-calc-go]');
  if (go) go.addEventListener('click', () => {
    const form = document.querySelector('.b-meeting-form');
    const note = form && form.elements.message;
    if (note && !note.value.trim()) {
      const tier = root.querySelector('input[name="tier"]:checked');
      const picked = [...root.querySelectorAll('input[name="opt"]:checked')]
        .map((box) => {
          const label = LABELS[box.value];
          if (!label) return null;
          const limit = root.querySelector(`[data-lim="${box.value}"]`);
          return limit ? `${label} на ${Number(limit.value).toLocaleString('uk-UA')} грн` : label;
        }).filter(Boolean);
      const parts = [`${people.value} осіб`, `клініки: ${LABELS[tier.value]}`];
      if (picked.length) parts.push(`опції: ${picked.join(', ')}`);
      parts.push(`орієнтир ${outPerson.textContent} грн/особу`);
      note.value = `Зібрав у конструкторі — ${parts.join('; ')}.`;
    }
    if (modal && modal.open) modal.close();
    const target = document.querySelector('#contact');
    if (target) target.scrollIntoView({behavior: 'smooth', block: 'start'});
    const name = form && form.elements.name;
    if (name) setTimeout(() => name.focus({preventScroll: true}), 600);
  });

  // Відкриття та закриття вікна. Нативний <dialog> сам дає Esc, фокус-пастку
  // й затемнення тла — свого коду для цього не треба.
  const modal = document.querySelector('#vt-modal');
  const openers = document.querySelectorAll('[data-calc-open]');
  let lastFocused = null;

  openers.forEach((button) => button.addEventListener('click', () => {
    if (!modal) return;
    lastFocused = button;
    modal.showModal();
    const first = modal.querySelector('input[name="tier"]');
    if (first) first.focus({preventScroll: true});
  }));

  const closeBtn = modal && modal.querySelector('[data-calc-close]');
  if (closeBtn) closeBtn.addEventListener('click', () => modal.close());

  // Клік повз вміст закриває вікно: звичний жест, якого від модалки чекають.
  if (modal) modal.addEventListener('click', (event) => {
    if (event.target === modal) modal.close();
  });

  if (modal) modal.addEventListener('close', () => {
    if (lastFocused) lastFocused.focus({preventScroll: true});
  });

  root.addEventListener('change', recount);
  root.addEventListener('input', (event) => {
    if (event.target === people) recount();
  });

  // Перший рівень обрано за замовчуванням, тож результат видно одразу:
  // порожній блок «оберіть щось» нікому не допомагає.
  const first = root.querySelector('input[name="tier"]');
  if (first && !root.querySelector('input[name="tier"]:checked')) first.checked = true;
  recount();
})();

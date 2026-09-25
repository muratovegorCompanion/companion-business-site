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
    city:    { min:  9000, max: 12000 },
    mid:     { min: 18000, max: 25000 },
    high:    { min: 28000, max: 38000 },
    premium: { min: 40000, max: 52000 },
  };

  // Доплати за опції — мінімум і максимум із реальних пропозицій.
  // Там, де частина страхових віддає опцію безкоштовно, мінімум — нуль.
  // Середня доплата по ринку — з наших тендерів. Показуємо одне число,
  // а не розкид: розкид цікавий у прикладах вище, а тут людині потрібен
  // орієнтир, з яким можна рахувати.
  const OPTIONS = {
    checkup:    2200,
    prophylax:  2500,
    kids:       1900,
    dental:     2100,   // ліміт 3 000 грн; доплата — близько 70% від ліміту
    exclusion:  1400,   // за кожну 1 000 грн ліміту
    combined:   1500,
    onco:        700,
    pregnancy:  1700,
    chronic:    1400,
    psy:        1100,
    physio:      800,
    second:       80,
    sedative:    350,
    saline:       60,
    refund:        0,   // у п'яти страхових із шести не впливає на вартість
    fullcover:  1200,   // повне покриття дорогих клінік замість часткового
    cutclinic: -1700,   // мінус-опція: знизити покриття брендової клініки
    cutonco:    -800,   // мінус-опція: корпоративний ліміт замість повного
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
    let min = tier.min;
    let max = tier.max;
    let picked = 0;

    root.querySelectorAll('input[name="opt"]:checked').forEach((box) => {
      const surcharge = OPTIONS[box.value];
      if (!surcharge) return;
      min += surcharge;
      max += surcharge;
      picked += 1;
    });


    min = Math.max(min, 4000);
    max = Math.max(max, min + 1000);
    outPerson.textContent = `${money(min)} – ${money(max)}`;

    const headcount = Math.max(50, parseInt(people.value, 10) || 50);
    outTotal.textContent = `${money(min * headcount)} – ${money(max * headcount)}`;
    outCount.textContent = headcount;

    out.hidden = false;
  }

  // Кнопка веде до форми й переносить туди зібрану конфігурацію: менеджер
  // одразу бачить, що саме людина обрала, і не починає розмову з нуля.
  const LABELS = {
    city: 'міські та помірного рівня', mid: 'середній рівень',
    high: 'високий рівень', premium: 'брендові мережі',
    checkup: 'профілактичний огляд', prophylax: 'масаж і мануальна терапія',
    kids: 'щеплення дітям', dental: 'стоматологія на 3 000 грн',
    exclusion: 'запас на непокриті послуги', combined: 'розширення до 10 процедур',
    onco: 'лікування серцево-судинних і онкології', pregnancy: 'спостереження вагітності',
    chronic: 'лікування хронічних хвороб', psy: 'консультації психолога',
    physio: 'фізіотерапія', second: 'друга думка лікаря',
    sedative: 'заспокійливі та снодійні', saline: 'сольові розчини',
    refund: 'компенсація власних витрат', fullcover: 'без доплат у дорогих клініках',
    cutclinic: 'знижене покриття брендової клініки', cutonco: 'спільний ліміт на новоутворення',
  };

  const go = root.querySelector('[data-calc-go]');
  if (go) go.addEventListener('click', () => {
    const form = document.querySelector('.b-meeting-form');
    const note = form && form.elements.message;
    if (note && !note.value.trim()) {
      const tier = root.querySelector('input[name="tier"]:checked');
      const picked = [...root.querySelectorAll('input[name="opt"]:checked')]
        .map((box) => LABELS[box.value]).filter(Boolean);
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

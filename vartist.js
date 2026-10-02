// Конструктор програми ДМС.
//
// Рахує орієнтовний діапазон внеску на одну людину на рік. Усі числа —
// з наших зведених тендерів: чотири тендери 2026-27 (85 пропозицій
// страхових) і, для нижньої ступені, тендер 2025-26. Тендери, що сильно
// вибиваються (Кернел, Customer Times), у розрахунок не беруться: одна
// нетипова пропозиція не повинна зсувати картину. Це не тариф і не
// розрахунок: тариф дає тільки тендер, а тут показано, як рухається ціна
// від вибору.
//
// Без JS сторінка лишається читабельною: розмітка містить усі опції
// як звичайний список, скрипт лише оживляє її.
(function initCalculator() {
  const root = document.querySelector('[data-calc]');
  if (!root) return;

  // Рівень клінік — головний чинник ціни. Це найвищий рівень, покритий на
  // 100%: державні й відомчі клініки входять до кожної програми, тож кожна
  // наступна ступінь містить усі попередні. Діапазон — середні 50% пропозицій
  // (від 25-го до 75-го відсотка), округлені до тисяч, а не одна медіана:
  // так окрема пропозиція не зсуває межі більш ніж на 1 000 грн.
  //   base    — тендер 2025-26, 5 пропозицій (7 700–10 700), нижні 10% ≈ 8 000
  //   mid     — 2026-27, 29 пропозицій (SDS, англ. зведення)
  //   high    — 2026-27, 10 пропозицій (один тендер: перевіряти при нових)
  //   premium — 2026-27, 46 пропозицій (SDS, Тевна)
  const TIERS = {
    base:    { min:  8000, max: 10000 },
    mid:     { min: 15000, max: 22000 },
    high:    { min: 24000, max: 30000 },
    premium: { min: 31000, max: 38000 },
  };

  // Знижка за чисельність — тільки на базову програму, не на опції.
  // Цифри назвала експертка: 20–50 осіб близько 2%, 50–100 — 5%, далі 7%.
  const volumeDiscount = (headcount) =>
    headcount >= 100 ? 0.07 : headcount >= 50 ? 0.05 : headcount >= 20 ? 0.02 : 0;

  // Доплати за опції — медіани пропозицій страхових у обычних тендерах 2026-27
  // (англійське зведення, друге коло; Тевна), без Кернела і Customer Times.
  // Те, що входить у стандартну програму за замовчуванням, тут не значиться —
  // інакше людина платить двічі.
  const OPTIONS = {
    checkup:    1000,   // 3 консультації або діагностики; медіана 1 030
    checkup5:   1800,   // 5 консультацій або діагностик; медіана 1 784
    flu:         600,   // медіана 581
    vitamins:    350,   // тендер 2024-25, один тендер — підтвердити свіжою ціною
    dental:      800,   // за кожну 1 000 грн ліміту, планова й невідкладна (медіана 848)
    exclusion:   900,   // за кожну 1 000 грн запасу; особистий ліміт, медіана 860
    derma:       500,   // медіана 495
    psy:         900,   // медіана 938
    psy5:       1200,   // ліміт консультацій з 2 до 5 на рік; Тевна, медіана 1 200
    telemed:     800,   // «Сімейний» Добродок+ для тих, хто за кордоном; Тевна, медіана 770
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
    base: 'державні та недорогі приватні', mid: 'до середнього рівня',
    high: 'до високого рівня', premium: 'включно з брендовими мережами',
    checkup: 'профогляд (3 консультації)', checkup5: 'профогляд (5 консультацій)',
    flu: 'щеплення від грипу', vitamins: 'вітаміни',
    dental: 'стоматологія', exclusion: 'запас на непокриті послуги',
    derma: 'дерматологія', psy: 'консультації психолога',
    psy5: 'психолог: ліміт 5 консультацій', telemed: 'телемедицина за кордоном',
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

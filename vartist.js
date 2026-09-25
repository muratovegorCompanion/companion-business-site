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
  const OPTIONS = {
    checkup3:  { min:  250, max: 3500 },
    checkup5:  { min:  360, max: 4500 },
    dental:    { min: 1300, max: 2600 },
    exclusion: { min: 1256, max: 2022 },
    psy:       { min:    0, max: 2256 },
    physio:    { min:    0, max: 1901 },
    pregnancy: { min: 1400, max: 2000 },
    kids:      { min: 1750, max: 2100 },
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
      const option = OPTIONS[box.value];
      if (!option) return;
      min += option.min;
      max += option.max;
      picked += 1;
    });

    // Профогляд на п'ять консультацій включає в себе обсяг трьох:
    // рахувати обидві опції разом було б подвійним нарахуванням.
    const three = root.querySelector('input[value="checkup3"]');
    const five  = root.querySelector('input[value="checkup5"]');
    if (three && five && three.checked && five.checked) {
      min -= OPTIONS.checkup3.min;
      max -= OPTIONS.checkup3.max;
      picked -= 1;
    }

    outPerson.textContent = `${money(min)} – ${money(max)}`;

    const headcount = Math.max(50, parseInt(people.value, 10) || 50);
    outTotal.textContent = `${money(min * headcount)} – ${money(max * headcount)}`;
    outCount.textContent = headcount;

    out.hidden = false;
  }

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

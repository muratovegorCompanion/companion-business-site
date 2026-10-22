// Тег Google Ads. Потрібен рівно для одного: порахувати заявки, які
// прийшли з реклами, щоб було видно, які запити приводять клієнтів,
// а які просто з'їдають бюджет. Більше нічого ми тут не міряємо.
//
// Розширене відстеження конверсій в акаунті вимкнено навмисно: пошта
// й телефон, які лишає клієнт у формі, не їдуть до Google — до них
// доступ має лише наш воркер.
(function initCompanionAds() {
  var ID = 'AW-18471963426';
  var LEAD = 'AW-18471963426/ttaqCNfV0YMdEKKWj-hE';

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(tag);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ID);

  // Викликають обробники форми (script.js на головній, form.js на решті)
  // після того, як воркер підтвердив, що заявку прийнято. Тобто рахуємо
  // надіслані заявки, а не натискання кнопки.
  window.companionLead = function trackLead() {
    gtag('event', 'conversion', { send_to: LEAD });
  };
})();

// Звідки прийшла людина: мітки реклами (utm_*, gclid) і сайт, з якого
// перейшли. Запам'ятовуємо на першій сторінці візиту, бо до форми людина
// часто доходить через кілька переходів, а мітки є лише в першій адресі.
// Нові мітки з реклами перезаписують старі; без міток старі живуть 30 днів.
(function initLeadSource() {
  var KEY = 'companion:lead-source';
  var DAY = 864e5;
  var params = new URLSearchParams(location.search);
  var tags = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'].forEach(function (k) {
    var v = params.get(k);
    if (v) tags[k] = v.slice(0, 150);
  });
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (stored && Date.now() - stored.at > 30 * DAY) stored = null;

  var ref = '';
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) ref = new URL(document.referrer).host;
  } catch (e) {}

  if (Object.keys(tags).length || !stored) {
    stored = { at: Date.now(), tags: tags, ref: ref, landing: location.pathname };
    try { localStorage.setItem(KEY, JSON.stringify(stored)); } catch (e) {}
  }

  // Рядок для заявки. Викликають обробники форми (script.js, form.js).
  window.companionLeadSource = function () {
    if (!stored) return '';
    var t = stored.tags || {};
    var parts = [];
    if (t.gclid || t.utm_source) {
      parts.push('реклама' + (t.utm_source ? ' ' + t.utm_source : ' Google Ads') + (t.utm_medium ? ' / ' + t.utm_medium : ''));
      if (t.utm_campaign) parts.push('кампанія: ' + t.utm_campaign);
      if (t.utm_term) parts.push('ключове слово: ' + t.utm_term);
      if (t.utm_content) parts.push('оголошення: ' + t.utm_content);
      if (t.gclid && !t.utm_source) parts.push('gclid');
    } else {
      parts.push(stored.ref ? 'перехід з ' + stored.ref : 'прямий захід або закладка');
    }
    parts.push('перша сторінка: ' + (stored.landing || '/'));
    return parts.join('; ');
  };
})();

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

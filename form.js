// Обробник заявок для сторінок поза головною. На головній ту саму роботу
// робить script.js, який сюди не підключається: він ще й збирає розмітку
// сторінки. Логіка довіри до приймача тут така сама — адресу беремо з
// data-meeting-endpoint, приймаємо лише наш воркер і лише https.
// Уточнення з форми (поля з data-detail) і джерело візиту воркер окремо
// не приймає, тож складаємо їх у текст задачі — так вони доїдуть до
// Telegram без зміни воркера. Приховані поля (інший напрямок) пропускаємо.
function companionLeadBody(form){
  const data=Object.fromEntries(new FormData(form));
  const details={};
  form.querySelectorAll('[data-detail]').forEach(el=>{
    if(el.closest('[hidden]'))return;
    const v=el.type==='checkbox'?(el.checked?el.value:''):el.value.trim();
    if(v)(details[el.dataset.detail]=details[el.dataset.detail]||[]).push(v);
  });
  const lines=Object.entries(details).map(([k,v])=>`${k}: ${v.join(', ')}`);
  Object.keys(data).forEach(k=>{if(k.startsWith('d_'))delete data[k];});
  const source=window.companionLeadSource?window.companionLeadSource():'';
  if(source)lines.push(`Джерело: ${source}`);
  if(lines.length)data.message=[lines.join('\n'),data.message].filter(Boolean).join('\n\n').slice(0,2000);
  return data;
}

(function initCompanionForms() {
  const isOurWorker = (origin) =>
    /^https:\/\/companion-meeting-form\.[a-z0-9-]+\.workers\.dev$/.test(origin);
  const endpoint = document.documentElement.dataset.meetingEndpoint;

  document.querySelectorAll('form.b-meeting-form').forEach((form) => {
    const status = form.querySelector('.b-form-status');
    const button = form.querySelector('button[type="submit"]');
    const contact = form.elements.contact;

    if (!endpoint) {
      button.disabled = true;
      if (status) {
        status.textContent =
          'Онлайн-запис ще не відкрито. Щоб погодити зустріч, зателефонуйте: +38 (050) 145 2605.';
      }
    }

    contact?.addEventListener('input', () => contact.setCustomValidity(''));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (contact) {
        const value = contact.value.trim();
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const digits = value.replace(/\D/g, '');
        const phone =
          /^\+?[\d\s().-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
        contact.setCustomValidity(
          email || phone ? '' : 'Вкажіть коректний email або номер телефону з кодом країни.',
        );
      }
      if (!form.reportValidity()) return;

      if (!endpoint) {
        if (status) {
          status.textContent =
            'Заявку не надіслано. Щоб погодити зустріч, зателефонуйте: +38 (050) 145 2605.';
        }
        return;
      }

      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      if (status) status.textContent = 'Надсилаємо ваш запит…';

      try {
        const target = new URL(endpoint, location.href);
        if (!isOurWorker(target.origin) || target.protocol !== 'https:') {
          throw new Error('Untrusted endpoint');
        }
        const response = await fetch(target, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(companionLeadBody(form)),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('Delivery failed');
        const result = await response.json();
        if (result.accepted !== true) throw new Error('Delivery not confirmed');
        if (status) {
          status.textContent = 'Дякуємо! Ми отримали ваш запит і зв’яжемося з вами.';
        }
        // Заявка дійсно доїхала до воркера — тільки тепер рахуємо її
        // як конверсію в Google Ads (див. analytics.js).
        if (window.companionLead) window.companionLead();
        form.reset();
      } catch {
        if (status) {
          status.textContent =
            'Не вдалося надіслати запит. Ваші дані залишилися у формі. Спробуйте ще раз або зателефонуйте: +38 (050) 145 2605.';
        }
      } finally {
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });
})();

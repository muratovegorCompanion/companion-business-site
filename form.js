// Обробник заявок для сторінок поза головною. На головній ту саму роботу
// робить script.js, який сюди не підключається: він ще й збирає розмітку
// сторінки. Логіка довіри до приймача тут така сама — адресу беремо з
// data-meeting-endpoint, приймаємо лише наш воркер і лише https.
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
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('Delivery failed');
        const result = await response.json();
        if (result.accepted !== true) throw new Error('Delivery not confirmed');
        if (status) {
          status.textContent = 'Дякуємо! Ми отримали ваш запит і зв’яжемося з вами.';
        }
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

/* Підвал згортається у смужку з телефоном і розгортається назад.
   Стан пам'ятається, щоб не згортати його на кожній сторінці заново. */
(function () {
  const footer = document.querySelector('.site-footer');
  if (!footer || self !== top) return;          // у вбудованій копії підвал зайвий
  const body = footer.querySelector('.footer-body');
  const toggle = footer.querySelector('.footer-toggle');
  const label = footer.querySelector('.footer-toggle-label');
  if (!body || !toggle) return;

  const KEY = 'companion:footer-collapsed';
  // Розгорнутий підвал з'їдає 126 px і на ноутбуці 1366×768 закривав
  // кнопку «Домовитися про зустріч» на першому екрані, тож за замовчуванням
  // всюди смужка з телефоном. Вибір користувача важливіший.
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}
  const collapsed = stored === null ? true : stored === '1';

  // Висоту тримаємо в пікселях: анімувати height:auto не можна.
  const fit = () => {
    body.style.height = footer.classList.contains('is-collapsed') ? '0px' : body.scrollHeight + 'px';
    document.body.style.paddingBottom = footer.offsetHeight + 'px';
  };

  const apply = (state, remember) => {
    footer.classList.toggle('is-collapsed', state);
    toggle.setAttribute('aria-expanded', String(!state));
    // Підпис — дієслово в обидва боки, щоб було ясно, що станеться
    if (label) label.textContent = state ? 'Розгорнути' : 'Згорнути';
    toggle.title = state ? 'Показати контакти' : 'Згорнути контакти';
    fit();
    if (remember) { try { localStorage.setItem(KEY, state ? '1' : '0'); } catch (e) {} }
  };

  apply(collapsed, false);
  toggle.addEventListener('click', () => apply(!footer.classList.contains('is-collapsed'), true));
  addEventListener('resize', fit);
  body.addEventListener('transitionend', (e) => {
    if (e.propertyName === 'height') document.body.style.paddingBottom = footer.offsetHeight + 'px';
  });
})();

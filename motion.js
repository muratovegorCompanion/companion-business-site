// Дрібні інтеракції для всіх сторінок. Стилі — у motion.css. Тут лише те,
// що не вміє CSS: спостерігач появи, тінь шапки при прокрутці, плавна висота
// акордеонів. Клас html.js вмикає стани спокою «до появи» — без скрипта
// сторінка виглядає як завжди, нічого не сховано.
(function(){
  var html = document.documentElement;
  html.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

  // Тінь шапки: тільки клас, решта в CSS.
  var scrolled = false;
  function onScroll(){
    var s = scrollY > 24;
    if (s !== scrolled){ scrolled = s; html.classList.toggle('m-scrolled', s); }
  }
  addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Поява секцій. Головну не чіпаємо (у хіро своя анімація), решту секцій
  // і кілька списків позначаємо і відпускаємо, щойно вони входять в екран.
  if ('IntersectionObserver' in window && !reduce){
    var targets = [].slice.call(document.querySelectorAll(
      'main > section:not(.b-hero):not(:first-of-type), .b-solution, .b-proof-item, .b-insight, .b-voice, .about-fact, .partner-card'));
    // Перший екран сторінки ніколи не ховаємо — це те, що людина бачить одразу.
    // І секцію, вищу за екран, теж: у неї частка перетину мала, поріг не
    // спрацьовує, і вона лишалася б напівпрозорою (так було з хіро на ДМС).
    targets = targets.filter(function(el){
      return el.getBoundingClientRect().top > innerHeight * .6 && el.offsetHeight < innerHeight * .9;
    });
    targets.forEach(function(el, i){
      el.classList.add('m-rv');
      // Сусіди в одній сітці йдуть з невеликою затримкою один за одним
      var sib = el.parentElement ? [].slice.call(el.parentElement.children).indexOf(el) : 0;
      if (!el.matches('section')) el.style.transitionDelay = Math.min(sib, 8) * 60 + 'ms';
    });
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('m-in'); io.unobserve(e.target); } });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0});
    targets.forEach(function(el){ io.observe(el); });

    // Кроки процесу: лінія прочерчується, коли список видно
    var steps = [].slice.call(document.querySelectorAll('.b-steps li'));
    if (steps.length){
      var io2 = new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting){ steps.forEach(function(li){ li.classList.add('m-in'); }); io2.disconnect(); } });
      }, {threshold:.3});
      io2.observe(steps[0].parentElement);
    }
  } else {
    // Без спостерігача або зі «зменшити рух» — усе одразу на місці
    [].forEach.call(document.querySelectorAll('.b-steps li'), function(li){ li.classList.add('m-in'); });
  }

  // Акордеони: <details> відкривається стрибком, бо браузер не анімує
  // висоту. Ведемо її самі через Web Animations, а сам open ставимо
  // після закриття, щоб згортання теж було плавним.
  if (!reduce && 'animate' in Element.prototype){
    [].forEach.call(document.querySelectorAll('details'), function(d){
      var sum = d.querySelector('summary');
      var body = sum && sum.nextElementSibling;
      if (!sum || !body) return;
      d.classList.add('m-acc');
      var busy = false;
      sum.addEventListener('click', function(ev){
        ev.preventDefault();
        if (busy) return; busy = true;
        if (d.open){
          var h0 = body.offsetHeight;
          body.animate([{height:h0+'px', opacity:1},{height:'0px', opacity:0}], {duration:260, easing:'cubic-bezier(.2,.8,.2,1)'})
            .onfinish = function(){ d.open = false; busy = false; };
        } else {
          d.open = true;
          var h1 = body.offsetHeight;
          body.animate([{height:'0px', opacity:0},{height:h1+'px', opacity:1}], {duration:320, easing:'cubic-bezier(.2,.8,.2,1)'})
            .onfinish = function(){ busy = false; };
        }
      });
    });
  }
})();

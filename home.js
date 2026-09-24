/* Головна, вересень 2026 («спокій у русі»). Порядок: напрями → цикл роботи → щоденний сервіс і застосунок → продовження → FAQ → зустріч.
   Стилі — nh.css, поведінка — nh.js. FAQ лишається в розмітці b-insight: з неї build.mjs збирає FAQPage. */
window.CompanionHome = {
  render() {
    return `<div class="nh">
<section class="nh-hero" aria-labelledby="hero-heading">
  <div class="nh-hero-media" aria-hidden="true"><video id="nh-hero-video" autoplay muted loop playsinline preload="metadata" poster="presentation-assets/home/hero.jpg"><source src="presentation-assets/home/hero.mp4" type="video/mp4"></video></div>
  <div class="nh-wrap">
    <span class="nh-eyebrow nh-rv">Страхове бюро «Компаньйон»</span>
    <h1 id="hero-heading" class="nh-rv nh-d1">Страхування, яке допомагає бізнесу рухатися <em class="nh-s">впевнено.</em></h1>
    <p class="nh-lead nh-rv nh-d2">Організовуємо тендер, пояснюємо ринок і залишаємося поруч після вибору. Ви бачите варіанти та самі обираєте страхову компанію.</p>
    <div class="nh-hero-cta nh-rv nh-d3"><a class="nh-btn nh-btn-primary" href="#meeting">Домовитися про зустріч <span class="nh-ar" aria-hidden="true">↗</span></a><a class="nh-btn nh-btn-ghost" href="#solutions">Знайти своє рішення <span aria-hidden="true">↓</span></a></div>
    <p class="nh-hero-note nh-rv nh-d3">Безоплатна перша зустріч · Онлайн або особисто в Києві</p>
    <div class="nh-stats" aria-label="Компаньйон у цифрах">
      <div class="nh-stat"><b data-count="11">11</b><span>років на ринку</span></div>
      <div class="nh-stat"><b data-count="97" data-suffix="%">97%</b><span>договорів продовжуються</span></div>
      <div class="nh-stat"><b data-count="15678">15 678</b><span>застрахованих людей</span></div>
      <div class="nh-stat"><b data-count="70" data-suffix="+">70+</b><span>компаній-клієнтів</span></div>
    </div>
    <p class="nh-stats-note">Партнерство, яке триває після підписання.</p>
  </div>
</section>
<section class="nh-clients" aria-label="Клієнти">
  <div class="nh-wrap"><span class="nh-eyebrow">Серед клієнтів бюро</span></div>
  <div class="nh-fade-x"><div class="nh-marquee"><img src="presentation-assets/clients/nova-poshta.jpg" alt="Nova Poshta International" loading="lazy"><img src="presentation-assets/clients/royal-canin.jpg" alt="Royal Canin" loading="lazy"><img src="presentation-assets/clients/meest.jpg" alt="Meest Express" loading="lazy"><img src="presentation-assets/clients/djangostars.jpg" alt="Djangostars" loading="lazy"><img src="presentation-assets/clients/asnova.jpg" alt="Аснова Холдинг" loading="lazy"><img src="presentation-assets/clients/sav-service.jpg" alt="SAV Service" loading="lazy"><img src="presentation-assets/clients/smart.jpg" alt="Smart" loading="lazy"><img src="presentation-assets/clients/upeco.jpg" alt="UPECO" loading="lazy"><img src="presentation-assets/clients/mlp.jpg" alt="Multinational Logistics Partnership" loading="lazy"><img src="presentation-assets/clients/logistic-plus.jpg" alt="Logistic Plus" loading="lazy"><img src="presentation-assets/clients/ecovice.jpg" alt="Ecovice Logistics" loading="lazy"><img src="presentation-assets/clients/vist-group.jpg" alt="Вист Групп" loading="lazy"><img src="presentation-assets/clients/smile-development.jpg" alt="Smile Development" loading="lazy"><img src="presentation-assets/clients/ctdev.jpg" alt="CTDEV" loading="lazy"><img src="presentation-assets/clients/lizard-soft.jpg" alt="Lizard Soft" loading="lazy"><img src="presentation-assets/clients/nova-poshta.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/royal-canin.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/meest.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/djangostars.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/asnova.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/sav-service.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/smart.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/upeco.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/mlp.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/logistic-plus.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/ecovice.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/vist-group.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/smile-development.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/ctdev.jpg" alt="" aria-hidden="true" loading="lazy"><img src="presentation-assets/clients/lizard-soft.jpg" alt="" aria-hidden="true" loading="lazy"></div></div>
</section>
<section class="nh-reviews nh-sec" aria-labelledby="voices-heading">
  <div class="nh-wrap nh-head">
    <div><span class="nh-eyebrow nh-rv">Відгуки</span><h2 id="voices-heading" class="nh-rv nh-d1" style="margin-top:18px">Що написали <em class="nh-s">клієнти</em></h2></div>
    <div class="nh-rv-ctrl nh-rv nh-d2"><span class="nh-cnt" id="nh-cnt">1 / 7</span><button type="button" data-dir="-1" aria-label="Попередній відгук">←</button><button type="button" data-dir="1" aria-label="Наступний відгук">→</button></div>
  </div>
  <div class="nh-track" id="nh-track"><article class="nh-quote"><p>Ми звернулися з вельми складним проєктом, який не мав аналогів на ринку. Компанія впоралася з поставленою метою: не лише створила таку програму, а й вигідно для нас розмістила її на ринку страхових компаній.</p><footer><b>Галаєв Н.А.</b>виконавчий директор<i>ДПД УКРАЇНА</i></footer></article><article class="nh-quote"><p>Одна з умов успішного ведення бізнесу — взаємодія з надійними партнерами, які завдяки професіоналізму та прагненню до високих результатів допомагають розв'язувати найскладніші задачі. Таким партнером для нас є страхове бюро «Компаньйон».</p><footer><b>Терадзима Кодзи</b>генеральний директор<i>PANASONIC УКРАЇНА</i></footer></article><article class="nh-quote"><p>Строки проведення тендеру було чітко дотримано. Співробітники бюро грамотно й кваліфіковано підготували нам пропозиції від страхових компаній.</p><footer><b>Клишня В.С.</b>глава представництва<i>OLYMPUS</i></footer></article><article class="nh-quote"><p>Як наш брокер із добровільного медичного страхування, «Компаньйон» завжди відстоює інтереси наших застрахованих і допомагає позитивно вирішувати спірні питання при обслуговуванні. Пропонує найкращі умови в надійній страховій компанії, не виходячи за межі страхового бюджету.</p><footer><b>Коваленко В.В.</b>директор<i>САБРІЗ</i></footer></article><article class="nh-quote"><p>Разом ми реалізували дуже складний і великий проєкт. Це компанія, яка дбає про інтереси клієнта та економію його коштів, активний учасник страхового ринку й генератор нових ідей.</p><footer><b>Кащенко В.В.</b>генеральний директор<i>МЛП-ЧАЙКА</i></footer></article><article class="nh-quote"><p>Готовність реалізувати саме ті рішення, які забезпечать потреби клієнта. Готовність працювати в нестандартному режимі — поза межами робочого часу і до отримання бажаного результату.</p><footer><b>Гергель Н.Н.</b>директор<i>РЕМТОЧМЕХАНІКА</i></footer></article><article class="nh-quote"><p>Хочемо відзначити успішний досвід співпраці наших співробітників зі страховим бюро «Компаньйон». Рекомендуємо скористатися послугами бюро, щоб на власному досвіді переконатися в перевагах роботи з командою професіоналів.</p><footer><b>Дронюк А.М.</b>в.о. генерального директора<i>ІНТЕЛЕКТУАЛЬНІ КОМУНІКАЦІЇ</i></footer></article></div>
  <div class="nh-wrap nh-more"><a class="nh-link" href="rekomendatsii.html">Усі відгуки ↗</a></div>
</section>
<section class="nh-sec" style="padding-bottom:0" aria-labelledby="proof-heading">
  <div class="nh-wrap">
    <div class="nh-head"><h2 id="proof-heading" class="nh-rv">Що можна <em class="nh-s">перевірити</em> про Бюро</h2></div>
    <div class="nh-trust">
      <article class="nh-tcard nh-rv"><span class="nh-seal" aria-hidden="true"></span><span class="nh-k">Реєстр НБУ</span><span class="nh-v">№ 00002449</span><p>ЄДРПОУ 39337363. Запис у Реєстрі страхових посередників від 20.03.2025 — після того, як НБУ замінив ним колишній реєстр брокерів.</p><a class="nh-link" href="https://kis.bank.gov.ua/search-fu" target="_blank" rel="noopener">Перевірити в реєстрі ↗</a></article>
      <article class="nh-tcard nh-rv nh-d1"><span class="nh-k">Відповідальність застрахована</span><span class="nh-v">1 500 000 грн</span><p>На кожен страховий випадок. СК «Колоннейд Україна», договір № LBT0076943, чинний до 10.06.2027.</p><a class="nh-link" href="regulatory.html">Умови договору ↗</a></article>
      <article class="nh-tcard nh-rv nh-d2"><span class="nh-k">Професійна спільнота</span><span class="nh-v">Учасник ФСПУ</span><p>Федерація страхових посередників України — об’єднання брокерів і агентів ринку.</p><a class="nh-link" href="http://fspu.com.ua/chlen_fspu/36" target="_blank" rel="noopener">Сторінка у федерації ↗</a></article>
    </div>
  </div>
</section>
<section class="nh-sec" id="solutions" aria-labelledby="solutions-heading">
  <div class="nh-wrap">
    <div class="nh-head">
      <div><span class="nh-num nh-rv">01 / Напрями</span><h2 id="solutions-heading" class="nh-rv nh-d1">Захищаємо те, на чому <em class="nh-s">тримається</em> бізнес.</h2></div>
      <p class="nh-lead nh-rv nh-d2">Від здоров’я команди до вантажу в дорозі. Для кожного завдання підбираємо програму та організовуємо супровід.</p>
    </div>
    <div class="nh-dirs">
      <article class="nh-dir nh-rv"><img src="presentation-assets/home/people.jpg" alt="" loading="lazy" width="1168" height="880"><div class="nh-dir-top"><span>01</span><span class="nh-tag">Люди</span></div><div class="nh-dir-body"><h3>Корпоративне медичне страхування</h3><p>Для команд від 50 людей. Беремо на себе тендер і допомагаємо працівникам користуватися програмою, знімаючи зайве навантаження з HR.</p><a class="nh-link" href="dms.html">Детальніше про медичне страхування ↗</a></div></article>
      <article class="nh-dir nh-rv nh-d1"><img src="presentation-assets/home/logistics.jpg" alt="" loading="lazy" width="1168" height="880"><div class="nh-dir-top"><span>02</span><span class="nh-tag">Рух</span></div><div class="nh-dir-body"><h3>Логістика</h3><p>Наше давнє профільне спрямування. Страхування вантажів, відповідальності перевізника та складів з урахуванням вашої роботи.</p><a class="nh-link" href="logistyka.html">Детальніше про логістику ↗</a></div></article>
      <article class="nh-dir nh-rv"><img src="presentation-assets/home/property.jpg" alt="" loading="lazy" width="1168" height="880"><div class="nh-dir-top"><span>03</span><span class="nh-tag">Активи</span></div><div class="nh-dir-body"><h3>Майно бізнесу</h3><p>Визначаємо, які ризики важливі для ваших об’єктів, і порівнюємо покриття, ліміти та винятки.</p><a class="nh-link" href="#meeting">Обговорити захист майна ↗</a></div></article>
      <article class="nh-dir nh-rv nh-d1"><img src="presentation-assets/home/liability.jpg" alt="" loading="lazy" width="1168" height="880"><div class="nh-dir-top"><span>04</span><span class="nh-tag">Зобов’язання</span></div><div class="nh-dir-body"><h3>Відповідальність бізнесу</h3><p>Допомагаємо підібрати страхування відповідальності перед третіми особами під вашу діяльність та умови договорів.</p><a class="nh-link" href="#meeting">Обговорити відповідальність ↗</a></div></article>
    </div>
    <div class="nh-family nh-rv"><span>Потрібне страхування для себе чи родини?</span><a class="nh-link" href="services.html">Переглянути всі сервіси ↗</a></div>
  </div>
</section>
<section class="nh-sec nh-process" id="process" aria-labelledby="process-heading">
  <div class="nh-wrap">
    <div class="nh-head">
      <div><span class="nh-num nh-rv">02 / Як працюємо</span><h2 id="process-heading" class="nh-rv nh-d1">Показуємо ринок. Рішення <em class="nh-s">завжди за вами.</em></h2></div>
      <p class="nh-lead nh-rv nh-d2">А після вибору лишаємося поруч увесь рік — і до наступного продовження приходимо вже з досвідом цього.</p>
    </div>
    <span class="nh-phase nh-rv">До вибору</span>
    <div class="nh-steps" id="nh-steps">
      <div class="nh-rail" aria-hidden="true"><i></i></div>
      <div class="nh-step nh-rv"><span class="nh-dot" aria-hidden="true"></span><b>01</b><h3>Розуміємо задачу</h3><p>Команда, міста, бюджет, чинні договори — і що саме не влаштовує зараз. Критерії вибору погоджуємо до виходу на ринок.</p></div>
      <div class="nh-step nh-rv nh-d1"><span class="nh-dot" aria-hidden="true"></span><b>02</b><h3>Показуємо ринок</h3><p>Для великого тендеру залучаємо 10–15 страхових компаній. Зводимо пропозиції поруч і пояснюємо різницю в покритті, винятках, клініках і сервісі.</p></div>
      <div class="nh-step nh-rv nh-d2"><span class="nh-dot" aria-hidden="true"></span><b>03</b><h3>Ви обираєте</h3><p>Даємо рекомендацію з аргументами, а рішення ухвалюєте ви — так, щоб його можна було пояснити керівництву й команді.</p></div>
    </div>
    <span class="nh-phase nh-rv">Після вибору</span>
    <div class="nh-steps">
      <div class="nh-rail" aria-hidden="true"><i></i></div>
      <div class="nh-step nh-rv"><span class="nh-dot" aria-hidden="true"></span><b>04</b><h3>Запускаємо</h3><p>Супроводжуємо договір і списки застрахованих. У медичному страхуванні працівники отримують застосунок зі своєю програмою.</p></div>
      <div class="nh-step nh-rv nh-d1"><span class="nh-dot" aria-hidden="true"></span><b>05</b><h3>Супроводжуємо щодня</h3><p>Закріплена команда веде зміни в програмі, питання працівників і складні звернення — зокрема відмови у виплаті.</p></div>
      <div class="nh-step nh-rv nh-d2"><span class="nh-dot" aria-hidden="true"></span><b>06</b><h3>Готуємо наступний рік</h3><p>Дивимося на доступну статистику звернень і зворотний зв’язок працівників. З цим приходимо до продовження.</p></div>
    </div>
    <p class="nh-loop nh-rv"><span aria-hidden="true">↻</span>Наступний тендер починається не з нуля, а з досвіду року.</p>
  </div>
</section>
<section class="nh-sec nh-support" id="support" aria-labelledby="support-heading">
  <div class="nh-wrap nh-sup">
    <div class="nh-sup-l">
      <span class="nh-num nh-rv">03 / Щоденний сервіс</span>
      <h2 id="support-heading" class="nh-rv nh-d1">Після вибору не залишаємо вас <em class="nh-s" style="color:var(--nh-lime)">сам на сам.</em></h2>
      <p class="nh-lead nh-rv nh-d2">За кожною компанією закріплена команда супроводу. Документи, списки, зміни в програмі й складні звернення беремо на себе — HR лишається точкою погодження, а не оператором.</p>
      <a class="nh-link nh-rv" href="about.html" style="align-self:flex-start">Познайомитися з командою ↗</a>
      <div class="nh-rv"><span class="nh-eyebrow">Ваш формат супроводу</span><div class="nh-fmt"><div><b>Команда</b><p>веде страхові питання та координує потрібні наступні кроки. Для медичного страхування — керівник напряму або його заступник.</p></div><div><b>Зв’язок</b><p>телефон, месенджери, email і застосунок — там, де зручно вам і команді.</p></div></div></div>
      <p class="nh-fine nh-rv">Строки та порядок відповіді для конкретної програми погоджуємо до початку роботи.</p>
      <div class="nh-rv"><p style="font-weight:600">Спілкуємося там, де вам зручно</p><div class="nh-channels"><span>Телефон</span><span>Telegram</span><span>Viber</span><span>WhatsApp</span><span>Email</span><span>Застосунок Компаньйон</span></div></div>
    </div>
    <article class="nh-appcard nh-rv nh-d1"><img src="presentation-assets/home/app.jpg" alt="" loading="lazy" width="880" height="1168"><div class="nh-appcard-in"><span class="nh-k">Застосунок для медичного страхування</span><h3>Своя програма — у телефоні кожного працівника.</h3><p>Покриття й винятки, клініки на карті, контакти асистансу, родичі. І ШІ-помічник, який відповідає за документами саме вашої програми.</p><a class="nh-link" href="app.html">Детальніше про застосунок ↗</a></div></article>
  </div>
</section>
<section style="padding:clamp(80px,11vw,150px) 0" aria-labelledby="renewal-heading">
  <div class="nh-wrap"><div class="nh-renew nh-rv">
    <div class="nh-renew-img"><img src="presentation-assets/home/renewal.jpg" alt="" loading="lazy" width="1168" height="880"></div>
    <div class="nh-renew-txt">
      <span class="nh-eyebrow">Момент продовження</span>
      <h2 id="renewal-heading">Договір добігає <em class="nh-s">кінця?</em></h2>
      <p>Найкращий час переглянути програму — за місяць до кінця договору: вже є з чим порівнювати і ще вистачає часу вийти на ринок. Ми розбираємо чинні умови, доступну статистику звернень і зворотний зв’язок працівників — і показуємо, що варто змінити. Якщо змінювати нічого, скажемо це так само прямо.</p>
      <div class="nh-chips"><span class="nh-chip"><b></b>Повний тендер — близько місяця</span><span class="nh-chip nh-l"><b></b>Терміновий запуск — від двох тижнів</span></div>
      <div class="nh-acts"><a class="nh-btn nh-btn-primary" href="#meeting">Обговорити продовження <span class="nh-ar" aria-hidden="true">↗</span></a><a class="nh-link" href="perevirka-dms.html">Спершу пройти чек-лист самостійно ↗</a></div>
    </div>
  </div></div>
</section>
<section class="nh-sec" id="faq" style="padding-top:0" aria-labelledby="faq-heading">
  <div class="nh-wrap">
    <div class="nh-head">
      <div><span class="nh-num nh-rv">04 / Часті питання</span><h2 id="faq-heading" class="nh-rv nh-d1">Що зазвичай питають на <em class="nh-s">першій зустрічі.</em></h2></div>
      <p class="nh-lead nh-rv nh-d2">Коротко відповідаємо на те, з чого починають розмову керівники, HR і операційні команди.</p>
    </div>
    <div class="nh-faq"><div class="nh-faq-col"><details class="b-insight"><summary><small>Медичне страхування</small><h3>У нас вже є ДМС. Чи є сенс щось міняти?</h3></summary><div class="b-insight-body"><p>Аналізуємо чинну програму, доступну статистику звернень і зворотний зв’язок працівників — і показуємо, що варто переглянути перед продовженням договору.</p><a href="dms.html">Як влаштоване медичне страхування ↗</a><a href="perevirka-dms.html">Чек-лист: що перевірити перед продовженням ↗</a></div></details><details class="b-insight"><summary><small>Відповідальність Бюро</small><h3>А якщо помилитеся ви?</h3></summary><div class="b-insight-body"><p>Наша професійна відповідальність застрахована: договір № LBT0076943 у СК «Колоннейд Україна», ліміт 1 500 000 грн на кожен випадок, чинний до 10 червня 2027 року. Якщо через нашу помилку ваша компанія зазнає збитку, його відшкодовує страхова компанія.</p><a href="regulatory.html">Регуляторна інформація ↗</a></div></details><details class="b-insight"><summary><small>Виплати</small><h3>Що буде, якщо страхова відмовить у виплаті?</h3></summary><div class="b-insight-body"><p>З’ясовуємо підставу відмови, допомагаємо зібрати документи та сформулювати аргументовану позицію, ведемо діалог зі страховою компанією і ініціюємо повторний розгляд, коли є на чому. Рішення ухвалює страхова компанія — ми представляємо ваші інтереси в цьому діалозі.</p><a href="vidmova-u-vyplati.html">Що робити, якщо відмовили ↗</a></div></details><details class="b-insight"><summary><small>Розмір компанії</small><h3>Від скількох людей це має сенс?</h3></summary><div class="b-insight-body"><p>Корпоративні програми медичного страхування ведемо для команд від 50 людей. Для майна, відповідальності та логістики обмежень за розміром компанії немає.</p></div></details></div><div class="nh-faq-col"><details class="b-insight"><summary><small>Вартість</small><h3>Скільки коштують ваші послуги?</h3></summary><div class="b-insight-body"><p>Розмір комісії на нашу рекомендацію не впливає — критерії вибору ми узгоджуємо з вами до старту тендеру. За замовчуванням нашу роботу оплачує страхова компанія комісією за укладений договір, тож окремої оплати з вашого боку немає. Друга модель — гонорар від вас; тоді комісію у страхової компанії ми обнуляємо. Модель обираєте ви, до того як побачите пропозиції.</p></div></details><details class="b-insight"><summary><small>Незалежність</small><h3>Ви ж однаково приведете «свою» страхову?</h3></summary><div class="b-insight-body"><p>Ми не володіємо частками у страхових компаніях, і вони не володіють часткою в нас. Для великого тендеру залучаємо 10–15 страхових компаній, показуємо пропозиції поруч і пояснюємо відмінності. Остаточний вибір за вами.</p></div></details><details class="b-insight"><summary><small>Навантаження</small><h3>Скільки часу це забере у нашого HR?</h3></summary><div class="b-insight-body"><p>Тендер, комунікацію зі страховою компанією, списки застрахованих і складні звернення беремо на себе. HR лишається точкою погодження, а не оператором. Створювати окремий страховий відділ не потрібно.</p></div></details><details class="b-insight"><summary><small>Географія</small><h3>Ви ж у Києві, а наші люди по всій Україні?</h3></summary><div class="b-insight-body"><p>Команда Бюро працює з Києва — тут же головні офіси страхових компаній. Спірні питання вирішуємо напряму з тими, хто ухвалює рішення, а не через регіональні представництва. Саме покриття діє по всій Україні та за її межами: територія, перелік клінік і порядок звернення визначаються обраною програмою.</p></div></details></div></div>
  </div>
</section>
<section class="nh-sec" id="meeting" aria-labelledby="meeting-heading">
  <div class="nh-wrap nh-contact">
    <div>
      <span class="nh-eyebrow nh-rv">Почнемо зі знайомства</span>
      <h2 id="meeting-heading" class="nh-rv nh-d1">Розкажіть, що важливо <em class="nh-s">вашій компанії.</em></h2>
      <p class="nh-lead nh-rv nh-d2">Залиште контакти, і ми погодимо зручний час зустрічі. Обговоримо вашу ситуацію, потрібну інформацію та наступні кроки.</p>
      <ul class="nh-perks nh-rv nh-d3"><li>Безоплатна перша зустріч</li><li>Онлайн або особисто в Києві</li><li>Для ДМС — з керівником напряму або його заступником</li></ul>
      <p class="nh-soft nh-rv nh-d3">Ще не готові до зустрічі? <a class="nh-link" href="perevirka-dms.html">Почніть із чек-листа перед продовженням ДМС ↗</a></p>
    </div>
    <form class="b-meeting-form nh-form nh-rv nh-d1" id="meeting-form">
      <div class="nh-row">
        <div class="nh-f"><label for="meeting-name">Ваше ім’я *</label><input id="meeting-name" name="name" type="text" autocomplete="name" required maxlength="100" placeholder="Як до вас звертатися"></div>
        <div class="nh-f"><label for="meeting-company">Компанія *</label><input id="meeting-company" name="company" type="text" autocomplete="organization" required maxlength="160" placeholder="Назва компанії"></div>
      </div>
      <div class="nh-f"><label for="meeting-contact">Телефон або email *</label><input id="meeting-contact" name="contact" type="text" required maxlength="180" placeholder="Зручний контакт для відповіді" aria-describedby="contact-hint"><small id="contact-hint">Номер з кодом країни або email.</small></div>
      <div class="nh-f"><label for="meeting-topic">Що хочете обговорити?</label><select id="meeting-topic" name="interest"><option>Корпоративне медичне страхування</option><option>Логістика</option><option>Майно бізнесу</option><option>Відповідальність бізнесу</option><option>Інше</option></select></div>
      <div class="nh-f"><label for="meeting-message">Кілька слів про задачу <span class="nh-opt">необов’язково</span></label><textarea id="meeting-message" name="message" rows="3" maxlength="2000" placeholder="Наприклад, плануємо продовжити програму для 150 працівників"></textarea></div>
      <label class="nh-consent"><input name="consent" type="checkbox" required><span>Погоджуюся на обробку цих контактів для відповіді на мій запит.</span></label>
      <div class="b-honeypot" aria-hidden="true"><label for="meeting-website">Ваш сайт</label><input id="meeting-website" name="website" tabindex="-1" autocomplete="off"></div>
      <button class="nh-btn nh-btn-primary" type="submit">Домовитися про зустріч <span class="nh-ar" aria-hidden="true">↗</span></button>
      <p class="b-form-status" id="meeting-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>
</div>`;
  }
};

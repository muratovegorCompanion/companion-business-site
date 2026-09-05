const WIX="https://static.wixstatic.com/media/";
const images={
  hero:"4d8e25_1bf66842362048ab9d0e8d161122e531~mv2.jpg/v1/fill/w_1556,h_2000,al_b,q_90,enc_avif,quality_auto/4d8e25_1bf66842362048ab9d0e8d161122e531~mv2.jpg",
  medical:"4d8e25_078aaaef9846412e93e07337442c7456~mv2.jpg/v1/crop/x_316,y_0,w_2368,h_2000/fill/w_487,h_411,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Medical%2520Record%2520Analysis_edited.jpg",
  logistics:"4d8e25_8b1fd12fa0124f66a6d17f89ea975b3b~mv2.jpg/v1/crop/x_430,y_0,w_2141,h_1809/fill/w_487,h_411,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Truck%2520Car%2520Park_edited.jpg",
  people:"f1a82a9de8b64749be3336c0ce0ccdb5.jpg/v1/crop/x_202,y_0,w_1517,h_1280/fill/w_487,h_411,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D0%A7%D0%B5%D0%BB%D0%BE%D0%B2%D0%B5%D0%BA%20%D0%92%D0%BE%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B2%20%D0%B0%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D0%B5.jpg",
  casco:"11062b_03a09d40775d4772a4f191ad5c7f6ac9~mv2.jpg/v1/crop/x_525,y_0,w_3949,h_3333/fill/w_487,h_411,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/%D0%90%D0%B2%D1%82%D0%BE%D0%BC%D0%BE%D0%B1%D0%B8%D0%BB%D1%8C%20%D0%BA%D0%BB%D0%BE%D0%BF.jpg",
  founder:"3433f0_ded1d57e655e4e3aade7279b65ad2a7f~mv2.jpg/v1/fill/w_769,h_1236,al_c,q_85,enc_avif,quality_auto/3433f0_ded1d57e655e4e3aade7279b65ad2a7f~mv2.jpg",
  olga:"3433f0_21d4095e93ca4c09a5a316fa0f56e2bf~mv2.jpg/v1/fill/w_96,h_139,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/3433f0_21d4095e93ca4c09a5a316fa0f56e2bf~mv2.jpg",
  oksana:"3433f0_ada7ad6e02d7462e8f93a0d9688cc5d2~mv2.jpg/v1/fill/w_96,h_139,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/3433f0_ada7ad6e02d7462e8f93a0d9688cc5d2~mv2.jpg",
  pavel:"3433f0_fba121c703d645cab31b8a8c35613d92~mv2.jpg/v1/fill/w_96,h_105,al_c,q_80,usm_0.66_1.00_0.01,blur_2,enc_avif,quality_auto/3433f0_fba121c703d645cab31b8a8c35613d92~mv2.jpg"
};
const img=k=>WIX+images[k];
const partnerLogos=[
  ["PZU","3433f0_be60f9cac1d548d7b9707cda9af35892~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/pzunew2.jpg","https://www.pzu.com.ua/"],
  ["PZU Life","3433f0_62b886ba6c2a4924bf2cf36e77d2d51f~mv2.png/v1/fill/w_316,h_237,al_c,lg_1,q_85,enc_avif,quality_auto/pzulife-logo.png","https://www.pzu.com.ua/individual/life.html"],
  ["ІНГО","3433f0_c45bd23914084d958c93500825129116~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/ingonew_edited.jpg","https://ingo.ua/publichna-ta-finansova-informacziya"],
  ["ARX","3433f0_dfdcca469b024342a4da03aab6917016~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/arxnew.jpg","https://arx.com.ua/publichna-ta-finansova-informatsiya"],
  ["УСГ","3433f0_78a2aab7b14e40308e22abf3552f35fc~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/10-usg.jpg","https://www.usg.ua/about/"],
  ["Colonnade","3433f0_e68ecc37c6944f4689d115419dbc500f~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/14-colonnade-logo.jpg","https://colonnade.com.ua/"],
  ["Перша","3433f0_e88757c514c94be18ca7d4660e08378d~mv2.png/v1/fill/w_316,h_237,al_c,lg_1,q_85,enc_avif,quality_auto/persha-logo.png","https://persha.ua/dlja-vas/"],
  ["EAS","3433f0_aa574feedab94f5d8f60a8192f4c1c7e~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/19-eas.jpg","https://eia.com.ua/"],
  ["TAS Life","3433f0_f8a6b9a1eb1c4e8caee503325f553301~mv2.png/v1/fill/w_316,h_237,al_c,lg_1,q_85,enc_avif,quality_auto/logo-tas-1.png","https://taslife.com.ua/"],
  ["Універсальна","3433f0_1a297e55de4d4077acdcf4a53d5a3ba5~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/15-universalna.jpg","https://universalna.com/"],
  ["Країна","3433f0_71a0eaf40c16456b9ac196ae81bc33d2~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/12-kraina.jpg","https://krayina.com/"],
  ["VUSO","3433f0_666e60aa1c804985a887e2cbbd49a2a4~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/16-vuso-logo.jpg","https://vuso.ua/"],
  ["Княжа","3433f0_004a179cc66740089e36e9330f88df47~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/11-knyaza.jpg","https://kniazha.ua/"],
  ["Арсенал","3433f0_143f5cbf01ee4aafb8747b27d4dcd887~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/3-arsenal.jpg","https://arsenal-ic.ua/"],
  ["Allianz","3433f0_83964f2f02c94354ab36ceb6fa4d58c5~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/5-alianz.jpg","https://www.allianz.ua/"],
  ["TAS","3433f0_45b7db669e684c2b9f363b85388ca960~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/9-tas.jpg","https://sgtas.ua/company/"],
  ["UNIQA","3433f0_39c82be9c7774f739824072ceec6e962~mv2.jpg/v1/fill/w_316,h_237,al_c,lg_1,q_80,enc_avif,quality_auto/1-uniqa.jpg","https://uniqa.ua/"]
];
const serviceCards=[
  ["КОРПОРАТИВНЕ МЕДИЧНЕ СТРАХУВАННЯ","Ви турбуєтесь про здоров'я своєї команди, а ми потурбуємось про найкращі умови від страхових компаній для вас та ваших працівників.","medical"],
  ["ЛОГІСТИКА І КОМЕРЦІЙНА НЕРУХОМІСТЬ","Допомагаємо оцінити ризики операційної діяльності та оптимізувати витрати на їх страхування.","logistics"],
  ["СТРАХУВАННЯ ФІЗИЧНИХ ОСІБ","Розберемося у підводних каменях договорів і проконсультуємо у разі настання страхового випадку.","people"],
  ["КАСКО","Захист від незвичайних і несподіваних подій, які не покриваються базовим договором автоцивілки.","casco"]
];
const shell=(content,kicker="")=>`<section class="section"><div class="shell">${kicker?`<p class="section-kicker">${kicker}</p>`:""}${content}</div></section>`;
const serviceMarkup=serviceCards.map(([title,text,key])=>`<article class="service-card"><img src="${img(key)}" alt=""><h3>${title}</h3><p>${text}</p><a class="text-link" href="index.html?page=contacts">ЗАМОВИТИ КОНСУЛЬТАЦІЮ →</a></article>`).join("");
function home(){return `<section class="hero"><div class="shell hero-inner"><div class="hero-copy"><p class="eyebrow">Страховий брокер</p><h1>МИ РОБИМО СТРАХУВАННЯ ЗРОЗУМІЛИМ.</h1><p>Супровід корпоративних програм страхування та рішення для приватних клієнтів.</p><a class="btn btn-blue" href="index.html?page=contacts">ЗАМОВИТИ КОНСУЛЬТАЦІЮ</a><a class="btn btn-outline" href="index.html?page=services">НАШІ СЕРВІСИ</a></div><div class="hero-art"><img src="${img("hero")}" alt="Страховий брокер Компаньйон"></div></div></section>${shell(`<div class="intro"><div class="intro-copy"><p>Те, на чому ми в команді тримаємо фокус — створювати нові рішення на ринку страхування.</p><p>Ми впевнені, що інструменти страхування ризиків працюють, якщо найбільш точно відповідають очікуванням клієнта.</p></div><div><p class="lead">Над цим ми і працюємо — робимо ефективним і зрозумілим страхування, якого потребує ваш бізнес.</p><p class="signature">ЄГОР МУРАТОВ<small>Керуючий партнер</small></p></div></div>`)}${shell(`<p class="section-kicker">Наші рішення</p><h2 class="section-title">МИ ПРОПОНУЄМО РІШЕННЯ<br>У СФЕРІ СТРАХУВАННЯ</h2><div class="services-grid">${serviceMarkup}</div>`)}<section class="cta-band"><div class="shell cta-band-inner"><h2>Потрібна консультація?</h2><a class="btn" href="index.html?page=contacts">ЗВ'ЯЗАТИСЯ З НАМИ</a></div></section>${shell(`<p class="section-kicker">Реєстр</p><h2 class="section-title">МИ ПИШАЄМОСЬ<br>НАШИМИ КЛІЄНТАМИ</h2><p class="lead">Страхове бюро Компаньйон входить до реєстру страхових брокерів України за номером 35. Номер свідоцтва — 21/25-рк від 15.01.2024.</p><a class="btn btn-blue" href="https://bank.gov.ua/ua/supervision/nonbanks/registers-lists" target="_blank" rel="noreferrer">ПЕРЕЙТИ ДО НБУ</a>`)}`}
function presentation(file,title){return `<iframe class="presentation-frame" src="${file}" title="${title}"></iframe>`}
function services(){return presentation("services.html","Сервіси Компаньйон")}
function dms(){return presentation("dms.html","Медичне страхування для бізнесу")}
function partners(){return `${shell(`<h1 class="section-title">Наші партнери</h1><p class="lead">Страхове бюро Компаньйон не володіє прямо або опосередковано частками чи акціями у статутному капіталі перелічених партнерів зі страхування та перестрахування. Також жоден із перелічених партнерів не володіє частками у статутному капіталі СБ Компаньйон.</p><div class="partner-grid">${partnerLogos.map(([name,src,url])=>`<article class="partner-card"><img src="${WIX+src}" alt="${name}"><a href="${url}" target="_blank" rel="noreferrer">ІНФОРМАЦІЯ ПРО СТРАХОВУ КОМПАНІЮ ↗</a></article>`).join("")}</div>`)}`}
const people=[
  ["ЄГОР МУРАТОВ","Засновник, керуючий партнер","Мій досвід роботи дозволяє бути впевненим, що інструмент страхування в Україні працює. Я вірю, що страхові брокери, представляючи частину страхового ринку, несуть відповідальність за ефективність використання цього інструменту.","УНІВЕРСИТЕТ TECHNION, ХАЙФА · Project Management<br>ІНСТИТУТ ПІСЛЯДИПЛОМНОЇ ОСВІТИ ТА БІЗНЕСУ · Курс організації діяльності страхових та перестрахових брокерів №7963 від 09.04.2014","founder"],
  ["АНАТОЛІЙ АРТЮШЕНКО","Старший партнер, директор з особистих видів страхування","Страхування в українських реаліях — це не просто інструмент управління ризиками. Ми покращуємо або знаходимо нові рішення на стику раціональності та інновацій, не забуваючи, що сервіс — це додаток до грамотно проаналізованого та застрахованого ризику.","НАЦІОНАЛЬНИЙ МЕДИЧНИЙ УНІВЕРСИТЕТ ІМЕНІ А.А. БОГОМОЛЬЦЯ · лікар невідкладних станів, лікар загального профілю","founder"],
  ["ОЛЬГА ЖИГЛИНСЬКА","Старший партнер","Вірю, що не людина вибирає страхування, а страхування вибирає людину, щоб вчасно надати їй фінансовий захист. Ефективне використання інструменту страхування дозволяє зменшити неприємні наслідки у непередбачуваних ситуаціях.","ДОНЕЦЬКИЙ НАЦІОНАЛЬНИЙ УНІВЕРСИТЕТ · математичний факультет, кафедра теорії ймовірності та статистики. Магістр страхування.","olga"],
  ["ОКСАНА КУЗЬМИНСЬКА","Директор з корпоративного страхування","Я вірю, що тільки ми несемо відповідальність за своє життя та свій бізнес. З полісом страхування негативний вплив стає контрольованим. А що може бути краще для топменеджера, ніж можливість контролювати ризики?","ХАРКІВСЬКИЙ НАЦІОНАЛЬНИЙ ТЕХНІЧНИЙ УНІВЕРСИТЕТ · економіка підприємств","oksana"],
  ["ПАВЕЛ БРАДУЛОВ","Департамент страхування фізичних осіб","Як страховий брокер, я завжди поруч із клієнтом, у тому числі коли йому найбільше потрібна підтримка. Допомагаю вибудувати правильний порядок дій клієнта, страхової компанії і сторонніх чинників, щоб страхування спрацювало.","ДонНТУ · спеціальність «Інформаційні технології машинобудівництва»","pavel"]
];
function about(){return `${shell(`<h1 class="section-title">ХТО МИ?</h1><p class="lead">Команда експертів у сфері страхування з досвідом роботи більше 10-ти років. Ми створили бюро максимально комфортних сервісів для компаній, які турбуються про зменшення ризиків власного бізнесу. Працюємо, щоб робити зрозумілим та ефективним страхування, яке вам потрібно.</p><div class="people">${people.map(([name,role,text,edu,key])=>`<article class="person"><img src="${img(key)}" alt="${name}"><div><h3>${name}</h3><p class="role">${role}</p><p>${text}</p><p class="education">СЕРТИФІКАТИ І ОСВІТА:<br>${edu}</p></div></article>`).join("")}</div>`)}`}
function contacts(){return `${shell(`<div class="contact-layout"><div class="contact-details"><p class="section-kicker">Контакти</p><h1 class="section-title">КОНТАКТИ</h1><strong>Страхове бюро «Компаньйон»</strong><p>04050 Україна, Київ<br>вул. Юрія Іллєнка, 81, офіс 302<br>тел.: <a href="tel:+380501452605">+38 (050) 145 2605</a></p></div><form class="contact-form" id="contact-form"><h2>ЗАМОВТЕ БЕЗОПЛАТНУ КОНСУЛЬТАЦІЮ ФАХІВЦЯ</h2><div class="field"><label for="name">Ім'я</label><input id="name" name="name" required></div><div class="field"><label for="email">Email *</label><input id="email" name="email" type="email" required></div><div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel"></div><div class="field"><label for="message">Повідомлення</label><textarea id="message" name="message"></textarea></div><button class="btn btn-blue" type="submit">НАДІСЛАТИ</button><p class="form-message" aria-live="polite"></p></form></div>`)}`}
function app(){return `<iframe class="app-frame" src="app.html" title="Презентація застосунку Компаньйон"></iframe>`}
const params=new URLSearchParams(location.search); const page=params.get("page")||"home"; const embed=params.get("embed")==="1"; const main=document.querySelector("main");
const homePage=()=>window.CompanionHome?.render()||home();
const pages={home:homePage,services,dms,partners,about,contacts,app};
main.innerHTML=(pages[page]||homePage)();
window.CompanionHome?.mount();
const siteNav=document.querySelector('.site-nav');
const aboutNav=siteNav?.querySelector('a[data-page="about"]');
if(page==='about' && aboutNav){
  aboutNav.setAttribute('aria-current','page');
  aboutNav.classList.add('nav-active');
  aboutNav.style.setProperty('transform','translateY(-4px)','important');
  aboutNav.style.setProperty('color','#245dce','important');
  aboutNav.style.setProperty('border-bottom','2px solid #245dce','important');
}
const directionsNav=siteNav?.querySelector('a[data-section="solutions"]');
const syncDirections=()=>{
  if(!directionsNav)return;
  const active=page==='home' && location.hash==='#solutions';
  directionsNav.classList.toggle('nav-active',active);
  if(active){directionsNav.setAttribute('aria-current','page');directionsNav.style.setProperty('transform','translateY(-4px)','important');directionsNav.style.setProperty('color','#245dce','important');directionsNav.style.setProperty('border-bottom','2px solid #245dce','important')}
  else{directionsNav.removeAttribute('aria-current');directionsNav.style.removeProperty('transform');directionsNav.style.removeProperty('color');directionsNav.style.removeProperty('border-bottom')}
};
syncDirections();
window.addEventListener('hashchange',syncDirections);
document.title={home:"Страхове бюро «Компаньйон» — страхування для бізнесу",services:"Сервіси — Компаньйон",dms:"Медичне страхування — Компаньйон",partners:"Страхові компанії — Компаньйон",about:"Про нас — Компаньйон",contacts:"Контакти — Компаньйон",app:"Застосунок — Компаньйон"}[page]||document.title;
if(embed){document.body.classList.add("embed-mode");document.querySelector(".site-header")?.remove();document.querySelector(".site-footer")?.remove()}
const toggle=document.querySelector(".menu-toggle"), nav=document.querySelector(".site-nav"); toggle?.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",open)}); nav?.addEventListener("click",e=>{if(e.target.closest("a")){nav.classList.remove("is-open");toggle?.setAttribute("aria-expanded","false")}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('is-open')){nav.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');toggle?.focus()}});
document.querySelector("#contact-form")?.addEventListener("submit",e=>{e.preventDefault();e.currentTarget.querySelector(".form-message").textContent="Заявку не надіслано. Щоб домовитися про зустріч, зателефонуйте: +38 (050) 145 2605."});

const presentationFrame=document.querySelector(".presentation-frame");
if(presentationFrame){
  let observer;
  const sizeFrame=()=>{
    observer?.disconnect();
    try{
      const doc=presentationFrame.contentDocument;
      if(!doc?.body)return;
      const update=()=>{
        const height=Math.ceil(doc.body.getBoundingClientRect().height);
        if(height>0)presentationFrame.style.height=height+"px";
      };
      observer=new ResizeObserver(update);
      observer.observe(doc.body);
      update();
    }catch(error){/* Cross-origin destinations retain normal iframe scrolling. */}
  };
  presentationFrame.addEventListener("load",sizeFrame);
  sizeFrame();
}
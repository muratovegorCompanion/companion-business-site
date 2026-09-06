const partnerLogos=[
  ["PZU","presentation-assets/insurers/pzu.jpg","https://www.pzu.com.ua/"],
  ["PZU Life","presentation-assets/insurers/pzu-life.png","https://www.pzu.com.ua/individual/life.html"],
  ["ІНГО","presentation-assets/insurers/ingo.jpg","https://ingo.ua/publichna-ta-finansova-informacziya"],
  ["ARX","presentation-assets/insurers/arx.jpg","https://arx.com.ua/publichna-ta-finansova-informatsiya"],
  ["УСГ","presentation-assets/insurers/usg.jpg","https://www.usg.ua/about/"],
  ["Colonnade","presentation-assets/insurers/colonnade.jpg","https://colonnade.com.ua/"],
  ["Перша","presentation-assets/insurers/persha.png","https://persha.ua/dlja-vas/"],
  ["EAS","presentation-assets/insurers/esa.jpg","https://eia.com.ua/"],
  ["TAS Life","presentation-assets/insurers/tas-life.png","https://taslife.com.ua/"],
  ["Універсальна","presentation-assets/insurers/universalna.jpg","https://universalna.com/"],
  ["Країна","presentation-assets/insurers/kraina.jpg","https://krayina.com/"],
  ["VUSO","presentation-assets/insurers/vuso.jpg","https://vuso.ua/"],
  ["Княжа","presentation-assets/insurers/knyazha.jpg","https://kniazha.ua/"],
  ["Арсенал","presentation-assets/insurers/arsenal.jpg","https://arsenal-ic.ua/"],
  ["Allianz","presentation-assets/insurers/allianz.jpg","https://www.allianz.ua/"],
  ["TAS","presentation-assets/insurers/tas.jpg","https://sgtas.ua/company/"],
  ["UNIQA","presentation-assets/insurers/uniqa.jpg","https://uniqa.ua/"],
  ["Євроінс","presentation-assets/insurers/euroins.png","https://euroins.com.ua/"]
];
const shell=(content,kicker="")=>`<section class="section"><div class="shell">${kicker?`<p class="section-kicker">${kicker}</p>`:""}${content}</div></section>`;
function presentation(file,title){return `<iframe class="presentation-frame" src="${file}" title="${title}"></iframe>`}
function services(){return presentation("services.html","Сервіси Компаньйон")}
function dms(){return presentation("dms.html","Медичне страхування для бізнесу")}
function partners(){return `${shell(`<h1 class="section-title">Наші партнери</h1><p class="lead">Страхове бюро Компаньйон не володіє прямо або опосередковано частками чи акціями у статутному капіталі перелічених партнерів зі страхування та перестрахування. Також жоден із перелічених партнерів не володіє частками у статутному капіталі СБ Компаньйон.</p><div class="partner-grid">${partnerLogos.map(([name,src,url])=>`<article class="partner-card"><img src="${src}" alt="${name}"><a href="${url}" target="_blank" rel="noreferrer">ІНФОРМАЦІЯ ПРО СТРАХОВУ КОМПАНІЮ ↗</a></article>`).join("")}</div>`)}`}
function app(){return `<iframe class="app-frame" src="app.html" title="Презентація застосунку Компаньйон"></iframe>`}
const params=new URLSearchParams(location.search);
const movedPages={about:"about.html",contacts:"contacts.html"};
const requested=params.get("page")||"home";
if(movedPages[requested])location.replace(movedPages[requested]);
const page=movedPages[requested]?"home":requested; const embed=params.get("embed")==="1"; const main=document.querySelector("main");
const homePage=()=>window.CompanionHome?.render()||"";
const pages={home:homePage,services,dms,partners,app};
// about.html і contacts.html мають власну розмітку — скрипт заповнює лише порожній слот.
const isRenderSlot=params.has("page")||main.children.length===0;
if(isRenderSlot)main.innerHTML=(pages[page]||homePage)();
window.CompanionHome?.mount();
const siteNav=document.querySelector('.site-nav');
// Активний пункт меню: раніше стан ставився вручну тільки для «Про нас»,
// через що «Послуги» ніколи не підсвічувались і не піднімались.
const setNavActive=(link,active)=>{
  if(!link)return;
  link.classList.toggle('nav-active',active);
  if(active){
    link.setAttribute('aria-current','page');
    link.style.setProperty('transform','translateY(-4px)','important');
    link.style.setProperty('color','#245dce','important');
    link.style.setProperty('border-bottom','2px solid #245dce','important');
  }else{
    link.removeAttribute('aria-current');
    link.style.removeProperty('transform');
    link.style.removeProperty('color');
    link.style.removeProperty('border-bottom');
  }
};
const syncNav=()=>{
  siteNav?.querySelectorAll('a[data-page]').forEach(link=>setNavActive(link,link.dataset.page===page));
  setNavActive(siteNav?.querySelector('a[data-section="solutions"]'),page==='home'&&location.hash==='#solutions');
};
syncNav();
window.addEventListener('hashchange',syncNav);
if(isRenderSlot)document.title={home:"Страхове бюро «Компаньйон» — страхування для бізнесу",services:"Сервіси — Компаньйон",dms:"Медичне страхування — Компаньйон",partners:"Страхові компанії — Компаньйон",about:"Про нас — Компаньйон",contacts:"Контакти — Компаньйон",app:"Застосунок — Компаньйон"}[page]||document.title;
if(embed){document.body.classList.add("embed-mode");document.querySelector(".site-header")?.remove();document.querySelector(".site-footer")?.remove()}
const toggle=document.querySelector(".menu-toggle"), nav=document.querySelector(".site-nav"); toggle?.addEventListener("click",()=>{const open=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",open)}); nav?.addEventListener("click",e=>{if(e.target.closest("a")){nav.classList.remove("is-open");toggle?.setAttribute("aria-expanded","false")}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('is-open')){nav.classList.remove('is-open');toggle?.setAttribute('aria-expanded','false');toggle?.focus()}});

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
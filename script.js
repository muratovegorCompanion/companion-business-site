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

// Заявки: один обробник на всі форми сайту. Форма позначається класом
// .b-meeting-form і несе приховане поле source, щоб у заявці було видно,
// звідки вона прийшла.
(function initCompanionForms(){
  const ALLOWED=['https://form.sb-companion.com'];
  // Домен сайту не на Cloudflare, тож воркер живе на *.workers.dev.
  // Приймаємо тільки наш воркер за іменем, а не будь-що на цьому хості.
  const isOurWorker=o=>/^https:\/\/companion-meeting-form\.[a-z0-9-]+\.workers\.dev$/.test(o);
  const endpoint=document.documentElement.dataset.meetingEndpoint;
  document.querySelectorAll('form.b-meeting-form').forEach(form=>{
    const status=form.querySelector('.b-form-status');
    const button=form.querySelector('button[type="submit"]');
    const contact=form.elements.contact;
    if(!endpoint){
      button.disabled=true;
      if(status)status.textContent='Онлайн-запис ще не відкрито. Щоб погодити зустріч, зателефонуйте: +38 (050) 145 2605.';
    }
    contact?.addEventListener('input',()=>contact.setCustomValidity(''));
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(contact){
        const v=contact.value.trim();
        const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        const digits=v.replace(/\D/g,'');
        const phone=/^\+?[\d\s().-]+$/.test(v)&&digits.length>=10&&digits.length<=15;
        contact.setCustomValidity(email||phone?'':'Вкажіть коректний email або номер телефону з кодом країни.');
      }
      if(!form.reportValidity())return;
      if(!endpoint){
        if(status)status.textContent='Заявку не надіслано. Щоб погодити зустріч, зателефонуйте: +38 (050) 145 2605.';
        return;
      }
      button.disabled=true; form.setAttribute('aria-busy','true');
      if(status)status.textContent='Надсилаємо ваш запит…';
      try{
        const target=new URL(endpoint,location.href);
        const trusted=target.origin===location.origin||ALLOWED.includes(target.origin)||isOurWorker(target.origin);
        if(!trusted||target.protocol!=='https:')throw new Error('Untrusted endpoint');
        const response=await fetch(target,{method:'POST',headers:{'Content-Type':'application/json'},
          body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:AbortSignal.timeout(15000)});
        if(!response.ok)throw new Error('Delivery failed');
        const result=await response.json();
        if(result.accepted!==true)throw new Error('Delivery not confirmed');
        if(status)status.textContent='Дякуємо! Ми отримали ваш запит і зв’яжемося з вами.';
        form.reset();
      }catch{
        if(status)status.textContent='Не вдалося надіслати запит. Ваші дані залишилися у формі. Спробуйте ще раз або зателефонуйте: +38 (050) 145 2605.';
      }finally{ button.disabled=false; form.removeAttribute('aria-busy'); }
    });
  });
})();

// Цифри «розкручуються» з нуля, коли блок з'являється на екрані.
// Справжнє число лежить у розмітці: якщо скрипт не спрацює або людина
// просила менше руху, вона побачить значення, а не нуль.
(function initCounters(){
  const nodes=[...document.querySelectorAll('[data-count]')];
  if(!nodes.length) return;
  const fmt=new Intl.NumberFormat('uk-UA');
  const paint=(el,v)=>{
    const suffix=el.dataset.suffix||'';
    el.textContent=fmt.format(v);
    if(suffix){ const sp=document.createElement('span'); sp.textContent=suffix; el.append(sp); }
  };
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(still||!('IntersectionObserver' in window)) return;
  const run=el=>{
    const to=Number(el.dataset.count); if(!Number.isFinite(to)) return;
    const dur=Math.min(1100, 380+Math.log10(Math.max(to,1))*260);
    const t0=performance.now();
    const tick=now=>{
      const k=Math.min((now-t0)/dur,1);
      paint(el, Math.round(to*(1-Math.pow(1-k,3))));
      if(k<1) requestAnimationFrame(tick);
    };
    paint(el,0); requestAnimationFrame(tick);
  };
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ run(e.target); io.unobserve(e.target); }
  }),{threshold:.4});
  nodes.forEach(n=>io.observe(n));
})();

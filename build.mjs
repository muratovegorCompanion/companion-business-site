import { readFile, mkdir, copyFile, cp, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, 'dist');
await mkdir(output, {recursive:true});
const sandbox = {window:{}};
vm.runInNewContext(await readFile(join(root, 'home.js'), 'utf8'), sandbox);
const home = sandbox.window.CompanionHome.render();
let index = await readFile(join(root, 'index.html'), 'utf8');
if (!index.includes('<main id="content"></main>')) throw new Error('Missing homepage render slot');
index = index.replace('<main id="content"></main>', `<main id="content">${home}</main>`);

// Один підвал і одне меню на весь сайт: раніше підвал існував у шести різних
// версіях, а на dms.html і services.html його не було зовсім.
const siteFooter = index.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
// Одне меню на весь сайт. Раніше воно існувало у трьох варіантах: дев'ять
// пунктів на головній, вісім без «Головної» на dms/app/partners і три
// на службових сторінках. Тепер список тут один, а шапки лише вдягають
// його у свої класи.
const NAV = [
  {href:'index.html', label:'Головна'},
  {href:'services.html', label:'Послуги'},
  {href:'dms.html', label:'Медичне страхування'},
  {href:'logistyka.html', label:'Логістика'},
  {href:'yak-my-pratsyuyemo.html', label:'Як працюємо'},
  {href:'about.html', label:'Про нас', page:'about'},
  {href:'partners.html', label:'Страхові компанії'},
  {href:'app.html', label:'Застосунок'},
];
const MEETING_HREF = 'index.html#meeting';
const MEETING_LABEL = 'Домовитися про зустріч ↗';

const navLinks = (file, {meetingClass='header-meeting', activeAs='aria'}={}) =>
  NAV.map(item => {
    let attrs = item.page ? ` data-page="${item.page}"` : '';
    if (item.href === file) attrs += activeAs === 'aria' ? ' aria-current="page"' : ' class="active"';
    return `<a${attrs} href="${item.href}">${item.label}</a>`;
  }).join('') + `<a class="${meetingClass}" href="${MEETING_HREF}">${MEETING_LABEL}</a>`;

const sharedNav = file =>
  `<nav id="site-nav" class="site-nav" aria-label="Сайт">${navLinks(file)}</nav>`;

const standaloneNav = (prefix, file) =>
  `<nav class="${prefix}-top-nav" id="${prefix}-top-nav" aria-label="Сайт">` +
  `${navLinks(file, {meetingClass:`${prefix}-top-meeting`, activeAs:'class'})}</nav>`;
// Картка для месенджерів і соцмереж. Тёплий трафік приходить пересланим
// посиланням, а без цих тегів воно розгортається голою адресою.
const SITE_URL = 'https://sb-companion.com';
const OG_IMAGE = `${SITE_URL}/presentation-assets/og-companion.jpg`;
const esc = (value) => value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const openGraph = (html, file) => {
  if (/property="og:/.test(html)) return html;
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [,''])[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [,''])[1].trim();
  const url = `${SITE_URL}/${file === 'index.html' ? '' : file}`;
  const tags = [
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Страхове бюро «Компаньйон»">`,
    `<meta property="og:locale" content="uk_UA">`,
    `<meta property="og:url" content="${url}">`,
    title && `<meta property="og:title" content="${esc(title)}">`,
    desc && `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta name="twitter:card" content="summary_large_image">`,
  ].filter(Boolean).join('');
  return html.replace('</head>', `${tags}</head>`);
};

// Пошуковикам не було з чого починати обхід: ні robots.txt, ні sitemap,
// ні canonical. Тепер усе це генерується разом зі сторінками.
const PAGES = ['index.html','dms.html','logistyka.html','yak-my-pratsyuyemo.html',
  'services.html','perevirka-dms.html','about.html','contacts.html','partners.html',
  'app.html','rekomendatsii.html','regulatory.html','insurance-products.html','privacy.html'];
const PRIORITY = {'index.html':'1.0','dms.html':'0.9','logistyka.html':'0.9',
  'perevirka-dms.html':'0.8','yak-my-pratsyuyemo.html':'0.8','services.html':'0.7'};
const pageUrl = (file) => `${SITE_URL}/${file === 'index.html' ? '' : file}`;

const canonical = (html, file) =>
  /rel="canonical"/.test(html) ? html
    : html.replace('</head>', `<link rel="canonical" href="${pageUrl(file)}"></head>`);

const orgJsonLd = JSON.stringify({
  '@context':'https://schema.org',
  '@type':'InsuranceAgency',
  name:'Страхове бюро «Компаньйон»',
  legalName:'ТОВ «СТРАХОВЕ БЮРО «КОМПАНЬЙОН»',
  url:SITE_URL,
  logo:`${SITE_URL}/presentation-assets/companion-logo.png`,
  image:OG_IMAGE,
  telephone:'+380501452605',
  email:'egor_m@icompanion.com.ua',
  address:{'@type':'PostalAddress',streetAddress:'вул. Юрія Іллєнка, 81, офіс 302',
    addressLocality:'Київ',postalCode:'04050',addressCountry:'UA'},
  areaServed:{'@type':'Country',name:'Україна'},
  openingHours:'Mo-Fr 09:00-18:00',
  foundingDate:'2014',
  identifier:'39337363',
  sameAs:['https://www.facebook.com/insurancebureaucompanion'],
  description:'Страховий брокер для бізнесу: організація тендерів, корпоративне медичне страхування, страхування вантажів і відповідальності, супровід після укладення договору.',
});

// Питання з головної — вже видимі на сторінці, тож розмітка їх лише
// пояснює машині. Це ж формат, який цитують мовні моделі.
const faqJsonLd = (homeHtml) => {
  const items = [...homeHtml.matchAll(/<details class="b-insight">[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<div class="b-insight-body"><p>([\s\S]*?)<\/p>/g)]
    .map(([, q, a]) => ({'@type':'Question', name: strip(q),
      acceptedAnswer:{'@type':'Answer', text: strip(a)}}));
  if (!items.length) return '';
  return JSON.stringify({'@context':'https://schema.org','@type':'FAQPage',mainEntity:items});
};
const strip = (value) => value.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const jsonLdTag = (data) => `<script type="application/ld+json">${data.replace(/</g,'\\u003c')}<\/script>`;

const shareShell = (html, file) => {
  // Службові сторінки мали власний куций <nav class="site-nav"> без id —
  // ловимо обидві форми, інакше меню там лишалося з трьох пунктів.
  if (/<nav[^>]*class="site-nav"/.test(html)) {
    html = html.replace(/<nav[^>]*class="site-nav"[^>]*>[\s\S]*?<\/nav>/, sharedNav(file));
    // Без цієї кнопки дев'ять пунктів на телефоні нікуди не розгорнути.
    if (!html.includes('class="menu-toggle"'))
      html = html.replace('<nav id="site-nav"',
        '<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Меню</button><nav id="site-nav"');
  }
  html = /<footer class="site-footer">/.test(html)
    ? html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, siteFooter)
    : html.replace('</body>', `${siteFooter}\n</body>`);
  if (!html.includes('tokens.css'))
    html = html.replace(/<head>/, '<head><link rel="stylesheet" href="tokens.css?v=6">');
  if (!html.includes('application/ld+json'))
    html = html.replace('</head>', `${jsonLdTag(orgJsonLd)}</head>`);
  if (!html.includes('site-footer.css'))
    html = html.replace('</head>', '<link rel="stylesheet" href="site-footer.css?v=8"></head>');
  // Кнопка «Меню» була лише на головній: розмітка з нею вклеювалась усюди,
  // а обробник лишався в script.js, який підключений тільки на index.
  if (html.includes('class="menu-toggle"') && !html.includes('nav.js'))
    html = html.replace('</head>', '<script src="nav.js?v=1" defer></script></head>');
  // services.html і app.html відкриваються ще й усередині iframe на ?page=…
  // Там свій підвал зайвий — зовнішня сторінка вже має власний.
  // styles.css і home.css підключені без версії — без цього браузер
  // повертаного відвідувача віддає їх із кешу.
  html = html.replace(/companion-logo\.png(\?[^"']*)?/g, 'companion-logo.png?v=2');
  // Іконка вкладки: логотип-простирадло 2172x724 на 304 КБ браузер стискав
  // у нечитабельну смужку. Тепер квадратний знак.
  html = html.replace(/<link rel="icon"[^>]*>/g, '')
             .replace('</head>',
               '<link rel="icon" type="image/png" sizes="64x64" href="presentation-assets/icon-64.png">'
             + '<link rel="apple-touch-icon" href="presentation-assets/icon-180.png"></head>');
  html = html.replace(/href="styles\.css(\?[^"]*)?"/g, 'href="styles.css?v=6"')
             .replace(/href="home\.css(\?[^"]*)?"/g, 'href="home.css?v=16"');
  // Підвал згортається у смужку з телефоном; логіка — у footer.js,
  // він же прибирає підвал у вбудованій копії (iframe).
  if (!html.includes('footer.js'))
    html = html.replace('</head>', '<script src="footer.js?v=3" defer></script></head>');
  return openGraph(canonical(html, file), file);
};

index = index.replace('</head>', `${jsonLdTag(orgJsonLd)}${jsonLdTag(faqJsonLd(index))}</head>`);
await writeFile(join(output, 'index.html'), shareShell(index, 'index.html'));

// Standalone headers use the exact same desktop geometry as the homepage header.
const standaloneGeometry = (prefix) => `
    .${prefix}-top{height:88px!important;min-height:88px!important;background:var(--c-white);color:var(--c-ink);display:block!important;position:relative;z-index:20;border-bottom:1px solid var(--c-line);font-family:var(--c-font)!important;line-height:1.5!important}
    .${prefix}-top-inner{width:min(1240px,calc(100% - 56px))!important;height:88px!important;min-height:88px!important;margin-inline:auto!important;padding:0!important;display:flex!important;align-items:center!important;gap:24px!important}
    .${prefix}-top-logo{display:flex!important;align-items:center!important;gap:10px!important;min-width:160px!important;width:auto!important;margin:0!important;padding:0!important}
    .${prefix}-top-logo img{display:block!important;width:160px!important;height:auto!important;margin:0!important}
    .${prefix}-top-nav{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:14px!important;row-gap:2px!important;flex-wrap:nowrap!important;margin-left:auto!important;margin-right:0!important;padding:0!important;font-family:var(--c-font)!important;font-size:14px!important;font-weight:600!important;letter-spacing:0!important;line-height:1.5!important;white-space:normal!important}
    .${prefix}-top-nav a{display:inline-block!important;color:var(--c-ink)!important;text-decoration:none!important;padding:10px 0!important;white-space:nowrap!important;border:0!important;border-bottom:2px solid transparent!important;border-radius:0!important;background:transparent!important;font:inherit!important;line-height:1.5!important}
    .${prefix}-top-nav a{transition:transform .16s ease,color .16s ease,border-color .16s ease!important}
    .${prefix}-top-nav a:hover{color:var(--c-blue)!important;border-bottom-color:var(--c-blue)!important;transform:translateY(-4px)!important}
    @media(prefers-reduced-motion:reduce){.${prefix}-top-nav a{transition:none!important}}
    .${prefix}-top-nav a.active{color:var(--c-blue)!important;border-bottom-color:var(--c-blue)!important;transform:translateY(-4px)!important}
    .${prefix}-top-nav .${prefix}-top-meeting{padding:10px 15px!important;background:var(--c-ink)!important;color:#fff!important;border:0!important;border-bottom:2px solid transparent!important;border-radius:7px!important;transform:none!important}
    .${prefix}-top-menu{display:none!important;background:none!important;border:1px solid var(--c-line)!important;color:var(--c-ink)!important;border-radius:8px!important;padding:8px 11px!important;font:inherit!important;min-height:44px!important}
    @media(max-width:1420px){.${prefix}-top-inner{gap:15px!important}.${prefix}-top-logo{min-width:190px!important}.${prefix}-top-logo img{width:135px!important}.${prefix}-top-nav{gap:12px!important}}
    @media(max-width:1279px){.${prefix}-top{height:auto!important;min-height:74px!important}.${prefix}-top-inner{width:min(100% - 36px,1240px)!important;height:auto!important;min-height:74px!important;flex-wrap:wrap!important}.${prefix}-top-logo{flex:1!important;min-width:0!important}.${prefix}-top-logo img{width:125px!important}.${prefix}-top-menu{display:block!important}.${prefix}-top-nav{display:none!important;order:4!important;width:100%!important;padding:14px 0 20px!important;flex-wrap:wrap!important;flex-direction:column!important;align-items:flex-start!important;gap:7px!important;margin-left:0!important;font-size:1rem!important}.${prefix}-top-nav a{padding:10px!important}.${prefix}-top-nav.open{display:flex!important}.${prefix}-top-nav a.active{transform:translateY(-3px)!important}.${prefix}-top-nav .${prefix}-top-meeting{display:inline-block!important}}
`;

let dms = await readFile(join(root, 'dms.html'), 'utf8');
const dmsHeader = `<header class="dms-top"><div class="dms-top-inner"><a class="dms-top-logo" href="index.html" aria-label="Компаньйон — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a><button class="dms-top-menu" type="button" aria-expanded="false" aria-controls="dms-top-nav">Меню</button>${standaloneNav('dms','dms.html')}</div></header>`;
dms = dms.replace('</style>', `${standaloneGeometry('dms')}  </style>`);
if (!dms.includes('class="dms-top"')) dms = dms.replace('<body>', `<body>\n  ${dmsHeader}`);
if (!dms.includes("querySelector('.dms-top-menu')")) dms = dms.replace('</body>', `  <script>const dmsMenu=document.querySelector('.dms-top-menu'),dmsNav=document.querySelector('#dms-top-nav');if(dmsMenu&&dmsNav){dmsMenu.addEventListener('click',()=>{const open=dmsNav.classList.toggle('open');dmsMenu.setAttribute('aria-expanded',String(open));});}</script>\n</body>`);
await writeFile(join(output, 'dms.html'), shareShell(dms, 'dms.html'));

let services = await readFile(join(root, 'services.html'), 'utf8');
const servicesHeader = `<header class="services-top"><div class="services-top-inner">`
  + `<a class="services-top-logo" href="index.html" aria-label="Компаньйон — на головну">`
  + `<img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a>`
  + `<button class="services-top-menu" type="button" aria-expanded="false" aria-controls="services-top-nav">Меню</button>`
  + `${standaloneNav('services','services.html')}</div></header>`;
services = services.replace('</style>', `${standaloneGeometry('services')}  </style>`);
if (!services.includes('class="services-top"')) services = services.replace('<body>', `<body>\n  ${servicesHeader}`);
if (!services.includes("querySelector('.services-top-menu')"))
  services = services.replace('</body>', `  <script>const sMenu=document.querySelector('.services-top-menu'),sNav=document.querySelector('#services-top-nav');if(sMenu&&sNav){sMenu.addEventListener('click',()=>{const open=sNav.classList.toggle('open');sMenu.setAttribute('aria-expanded',String(open));});}<\/script>\n</body>`);
await writeFile(join(output, 'services.html'), shareShell(services, 'services.html'));

for (const [file,prefix] of [['app.html','app'],['partners.html','partners']]) {
  let page = await readFile(join(root, file), 'utf8');
  page = page.replace(new RegExp(`<nav class="${prefix}-top-nav"[\\s\\S]*?</nav>`), standaloneNav(prefix, file));
  page = page.replace('</style>', `${standaloneGeometry(prefix)}  </style>`);
  await writeFile(join(output, file), shareShell(page, file));
}

// Файл підтвердження Google Search Console копіюємо як є: сторінкою він
// не є, шапку й підвал у нього вклеювати не можна — Google читає його вміст.
for (const file of ['styles.css','home.css','site-footer.css','tokens.css','home.js','script.js','nav.js','footer.js','android-download.js','CNAME','google3dbd541ddd703421.html']) {
  await copyFile(join(root, file), join(output, file));
}
for (const file of ['logistyka.html','yak-my-pratsyuyemo.html',
  'about.html','contacts.html','rekomendatsii.html','perevirka-dms.html','404.html','regulatory.html','privacy.html','insurance-products.html']) {
  await writeFile(join(output, file), shareShell(await readFile(join(root, file), 'utf8'), file));
}
await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
await cp(join(root, 'fonts'), join(output, 'fonts'), {recursive:true});
console.log('Built static Companion site with homepage-exact isolated header geometry.');

// robots.txt і карта сайту: без них пошуковику нема з чого почати обхід.
const today = new Date().toISOString().slice(0, 10);
await writeFile(join(output, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
await writeFile(join(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + PAGES.map((file) =>
      `  <url><loc>${pageUrl(file)}</loc><lastmod>${today}</lastmod>`
      + `<priority>${PRIORITY[file] || '0.5'}</priority></url>`).join('\n')
  + `\n</urlset>\n`);

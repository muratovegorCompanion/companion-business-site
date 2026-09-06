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
const siteNav = index.match(/<nav id="site-nav"[\s\S]*?<\/nav>/)[0];
const shareShell = (html, file) => {
  if (/<nav id="site-nav"/.test(html)) {
    const pageNav = siteNav.replace(`href="${file}"`, `href="${file}" aria-current="page"`);
    html = html.replace(/<nav id="site-nav"[\s\S]*?<\/nav>/, pageNav);
  }
  html = /<footer class="site-footer">/.test(html)
    ? html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, siteFooter)
    : html.replace('</body>', `${siteFooter}\n</body>`);
  if (!html.includes('tokens.css'))
    html = html.replace(/<head>/, '<head><link rel="stylesheet" href="tokens.css?v=2">');
  if (!html.includes('site-footer.css'))
    html = html.replace('</head>', '<link rel="stylesheet" href="site-footer.css?v=4"></head>');
  // services.html і app.html відкриваються ще й усередині iframe на ?page=…
  // Там свій підвал зайвий — зовнішня сторінка вже має власний.
  // styles.css і home.css підключені без версії — без цього браузер
  // повертаного відвідувача віддає їх із кешу.
  html = html.replace(/href="styles\.css(\?[^"]*)?"/g, 'href="styles.css?v=2"')
             .replace(/href="home\.css(\?[^"]*)?"/g, 'href="home.css?v=2"');
  // Підвал виїжджає на паузі скролу; у вбудованій копії його прибираємо.
  if (!html.includes('data-embedded-footer'))
    html = html.replace('</body>',
      '<script data-embedded-footer>(function(){var f=document.querySelector(".site-footer");if(!f)return;if(self!==top){f.remove();return}var t,shown=false;function size(){var h=Math.min(f.offsetHeight,Math.round(innerHeight*0.78));document.body.style.setProperty("--footer-reveal-height",h+"px")}function reveal(){shown=true;f.classList.add("is-revealed")}function schedule(){if(shown){shown=false;f.classList.remove("is-revealed")}clearTimeout(t);t=setTimeout(reveal,450)}f.classList.add("is-sliding");document.body.classList.add("has-sliding-footer");size();addEventListener("scroll",schedule,{passive:true});addEventListener("resize",function(){size();schedule()});f.addEventListener("focusin",reveal);t=setTimeout(function(){size();reveal()},700);})()<\/script>\n</body>');
  return html;
};

await writeFile(join(output, 'index.html'), shareShell(index, 'index.html'));

// Standalone headers use the exact same desktop geometry as the homepage header.
const standaloneGeometry = (prefix) => `
    .${prefix}-top{height:88px!important;min-height:88px!important;background:var(--c-white);color:var(--c-ink);display:block!important;position:relative;z-index:20;border-bottom:1px solid var(--c-line);font-family:var(--c-font)!important;line-height:1.5!important}
    .${prefix}-top-inner{width:min(1240px,calc(100% - 56px))!important;height:88px!important;min-height:88px!important;margin-inline:auto!important;padding:0!important;display:flex!important;align-items:center!important;gap:30px!important}
    .${prefix}-top-logo{display:flex!important;align-items:center!important;gap:10px!important;min-width:180px!important;width:auto!important;margin:0!important;padding:0!important}
    .${prefix}-top-logo img{display:block!important;width:180px!important;height:auto!important;margin:0!important}
    .${prefix}-top-nav{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:22px!important;row-gap:2px!important;flex-wrap:wrap!important;margin-left:auto!important;margin-right:0!important;padding:0!important;font-family:var(--c-font)!important;font-size:14px!important;font-weight:600!important;letter-spacing:0!important;line-height:1.5!important;white-space:normal!important}
    .${prefix}-top-nav a{display:inline-block!important;color:var(--c-ink)!important;text-decoration:none!important;padding:10px 0!important;border:0!important;border-bottom:2px solid transparent!important;border-radius:0!important;background:transparent!important;font:inherit!important;line-height:1.5!important}
    .${prefix}-top-nav a{transition:transform .16s ease,color .16s ease,border-color .16s ease!important}
    .${prefix}-top-nav a:hover{color:var(--c-blue)!important;border-bottom-color:var(--c-blue)!important;transform:translateY(-4px)!important}
    @media(prefers-reduced-motion:reduce){.${prefix}-top-nav a{transition:none!important}}
    .${prefix}-top-nav a.active{color:var(--c-blue)!important;border-bottom-color:var(--c-blue)!important;transform:translateY(-4px)!important}
    .${prefix}-top-nav .${prefix}-top-meeting{padding:13px 18px!important;background:var(--c-ink)!important;color:#fff!important;border:0!important;border-radius:7px!important;transform:none!important}
    .${prefix}-top-menu{display:none!important;background:none!important;border:1px solid var(--c-line)!important;color:var(--c-ink)!important;border-radius:8px!important;padding:8px 11px!important;font:inherit!important;min-height:44px!important}
    @media(max-width:950px){.${prefix}-top-inner{gap:15px!important}.${prefix}-top-logo{min-width:190px!important}.${prefix}-top-logo img{width:135px!important}.${prefix}-top-nav{gap:12px!important;font-size:11px!important}}
    @media(max-width:1000px){.${prefix}-top{height:auto!important;min-height:74px!important}.${prefix}-top-inner{width:min(100% - 36px,1240px)!important;height:auto!important;min-height:74px!important;flex-wrap:wrap!important}.${prefix}-top-logo{flex:1!important;min-width:0!important}.${prefix}-top-logo img{width:125px!important}.${prefix}-top-menu{display:block!important}.${prefix}-top-nav{display:none!important;order:4!important;width:100%!important;padding:14px 0 20px!important;flex-direction:column!important;align-items:flex-start!important;gap:10px!important;margin-left:0!important}.${prefix}-top-nav.open{display:flex!important}.${prefix}-top-nav a.active{transform:translateY(-3px)!important}.${prefix}-top-nav .${prefix}-top-meeting{display:inline-block!important}}
`;

let dms = await readFile(join(root, 'dms.html'), 'utf8');
const dmsHeader = `<header class="dms-top"><div class="dms-top-inner"><a class="dms-top-logo" href="index.html" aria-label="Компаньйон — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a><button class="dms-top-menu" type="button" aria-expanded="false" aria-controls="dms-top-nav">Меню</button><nav class="dms-top-nav" id="dms-top-nav" aria-label="Сайт"><a href="index.html?page=services">Послуги</a><a class="active" href="dms.html">Медичне страхування</a><a href="logistyka.html">Логістика</a><a href="yak-my-pratsyuyemo.html">Як працюємо</a><a href="about.html">Про нас</a><a href="partners.html">Страхові компанії</a><a href="app.html">Застосунок</a><a class="dms-top-meeting" href="index.html#meeting">Домовитися про зустріч ↗</a></nav></div></header>`;
dms = dms.replace('</style>', `${standaloneGeometry('dms')}  </style>`);
if (!dms.includes('class="dms-top"')) dms = dms.replace('<body>', `<body>\n  ${dmsHeader}`);
if (!dms.includes("querySelector('.dms-top-menu')")) dms = dms.replace('</body>', `  <script>const dmsMenu=document.querySelector('.dms-top-menu'),dmsNav=document.querySelector('#dms-top-nav');if(dmsMenu&&dmsNav){dmsMenu.addEventListener('click',()=>{const open=dmsNav.classList.toggle('open');dmsMenu.setAttribute('aria-expanded',String(open));});}</script>\n</body>`);
await writeFile(join(output, 'dms.html'), shareShell(dms, 'dms.html'));

for (const [file,prefix] of [['app.html','app'],['partners.html','partners']]) {
  let page = await readFile(join(root, file), 'utf8');
  page = page.replace(/>Напрями<\/a>/g, '>Послуги</a>');
  page = page.replace(/href="index\.html#solutions"/g, 'href="index.html?page=services"');
  page = page.replace('<a href="dms.html">Медичне страхування</a>',
    '<a href="dms.html">Медичне страхування</a><a href="logistyka.html">Логістика</a><a href="yak-my-pratsyuyemo.html">Як працюємо</a>');
  page = page.replace('</style>', `${standaloneGeometry(prefix)}  </style>`);
  await writeFile(join(output, file), shareShell(page, file));
}

for (const file of ['styles.css','home.css','site-footer.css','tokens.css','home.js','script.js','android-download.js','CNAME']) {
  await copyFile(join(root, file), join(output, file));
}
for (const file of ['services.html','logistyka.html','yak-my-pratsyuyemo.html',
  'about.html','contacts.html','regulatory.html','privacy.html','insurance-products.html']) {
  await writeFile(join(output, file), shareShell(await readFile(join(root, file), 'utf8'), file));
}
await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
await cp(join(root, 'fonts'), join(output, 'fonts'), {recursive:true});
console.log('Built static Companion site with homepage-exact isolated header geometry.');

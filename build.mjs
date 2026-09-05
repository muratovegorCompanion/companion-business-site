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
await writeFile(join(output, 'index.html'), index);

// Exact desktop geometry of the homepage header, using isolated classes on standalone pages.
const standaloneGeometry = (prefix) => `
    .${prefix}-top{height:auto;min-height:88px;background:#fff;color:#142a46;display:flex;align-items:center;position:relative;z-index:20;border-bottom:1px solid #dce3eb}
    .${prefix}-top-inner{width:min(1240px,calc(100% - 56px));min-height:88px;margin-inline:auto;display:flex;align-items:center;gap:30px}
    .${prefix}-top-logo{display:flex;align-items:center;min-width:180px;margin-right:0}
    .${prefix}-top-logo img{display:block;width:180px;height:auto}
    .${prefix}-top-nav{display:flex;align-items:center;gap:28px;margin-left:auto;font-size:14px;font-weight:600;white-space:nowrap}
    .${prefix}-top-nav a{color:#142a46;text-decoration:none;padding:10px 0;border-bottom:2px solid transparent}
    .${prefix}-top-nav a:hover,.${prefix}-top-nav a.active{color:#245dce;border-color:#245dce}
    .${prefix}-top-meeting{background:#142a46!important;color:#fff!important;padding:13px 18px!important;border:0!important;border-radius:7px}
    .${prefix}-top-menu{display:none;background:none;border:1px solid #dce3eb;color:#142a46;border-radius:8px;padding:8px 11px;font:inherit;min-height:44px}
    @media(max-width:950px){.${prefix}-top-inner{gap:15px}.${prefix}-top-logo{min-width:190px}.${prefix}-top-logo img{width:135px}.${prefix}-top-nav{gap:12px;font-size:11px}}
    @media(max-width:700px){.${prefix}-top-inner{width:min(100% - 36px,1240px);min-height:74px;flex-wrap:wrap}.${prefix}-top-logo{flex:1;min-width:0}.${prefix}-top-logo img{width:125px}.${prefix}-top-menu{display:block}.${prefix}-top-nav{display:none;order:4;width:100%;padding:14px 0 20px;flex-direction:column;align-items:flex-start;gap:10px;margin-left:0}.${prefix}-top-nav.open{display:flex}.${prefix}-top-nav a.active{padding-bottom:10px}.${prefix}-top-meeting{display:inline-block}}
`;

// DMS remains visually independent; only its isolated header is injected into the build.
let dms = await readFile(join(root, 'dms.html'), 'utf8');
const dmsHeaderStyles = standaloneGeometry('dms');
const dmsHeader = `<header class="dms-top"><div class="dms-top-inner"><a class="dms-top-logo" href="index.html" aria-label="Компаньйон — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a><button class="dms-top-menu" type="button" aria-expanded="false" aria-controls="dms-top-nav">Меню</button><nav class="dms-top-nav" id="dms-top-nav" aria-label="Сайт"><a href="index.html#solutions">Напрями</a><a class="active" href="dms.html">Медичне страхування</a><a href="index.html?page=about">Про нас</a><a href="partners.html">Страхові компанії</a><a href="app.html">Застосунок</a><a class="dms-top-meeting" href="index.html#meeting">Домовитися про зустріч ↗</a></nav></div></header>`;
dms = dms.replace('</style>', `${dmsHeaderStyles}  </style>`);
if (!dms.includes('class="dms-top"')) dms = dms.replace('<body>', `<body>\n  ${dmsHeader}`);
if (!dms.includes("querySelector('.dms-top-menu')")) dms = dms.replace('</body>', `  <script>const dmsMenu=document.querySelector('.dms-top-menu'),dmsNav=document.querySelector('#dms-top-nav');if(dmsMenu&&dmsNav){dmsMenu.addEventListener('click',()=>{const open=dmsNav.classList.toggle('open');dmsMenu.setAttribute('aria-expanded',String(open));});}</script>\n</body>`);
await writeFile(join(output, 'dms.html'), dms);

// App and partners keep their own designs; only override isolated header geometry at build time.
for (const [file,prefix] of [['app.html','app'],['partners.html','partners']]) {
  let page = await readFile(join(root, file), 'utf8');
  page = page.replace('</style>', `${standaloneGeometry(prefix)}  </style>`);
  await writeFile(join(output, file), page);
}

for (const file of [
  'styles.css','home.css','home.js','script.js','services.html','logistyka.html',
  'yak-my-pratsyuyemo.html','android-download.js','regulatory.html',
  'privacy.html','insurance-products.html','CNAME'
]) {
  await copyFile(join(root, file), join(output, file));
}
await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
console.log('Built static Companion site with aligned isolated navigation on standalone pages.');

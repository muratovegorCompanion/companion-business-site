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

// Exact shared desktop geometry for standalone headers. Every visual variable that can
// change text width (font family, weight, line height, spacing) is fixed explicitly.
const standaloneGeometry = (prefix) => `
    .${prefix}-top{height:88px!important;min-height:88px!important;background:#fff;color:#142a46;display:flex!important;align-items:center!important;position:relative;z-index:20;border-bottom:1px solid #dce3eb;font-family:Arial,Helvetica,sans-serif!important}
    .${prefix}-top *{box-sizing:border-box}
    .${prefix}-top-inner{width:min(1240px,calc(100% - 56px))!important;height:88px!important;min-height:88px!important;margin:0 auto!important;padding:0!important;display:grid!important;grid-template-columns:180px minmax(0,1fr)!important;align-items:center!important;column-gap:30px!important}
    .${prefix}-top-logo{display:flex!important;align-items:center!important;width:180px!important;min-width:180px!important;height:88px!important;margin:0!important;padding:0!important}
    .${prefix}-top-logo img{display:block!important;width:180px!important;height:auto!important;margin:0!important;padding:0!important}
    .${prefix}-top-nav{display:grid!important;grid-template-columns:max-content max-content max-content max-content max-content max-content!important;align-items:center!important;justify-content:end!important;column-gap:28px!important;margin:0!important;padding:0!important;font-family:Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:600!important;font-style:normal!important;letter-spacing:0!important;white-space:nowrap!important;line-height:20px!important}
    .${prefix}-top-nav a{display:block!important;color:#142a46;text-decoration:none!important;margin:0!important;padding:10px 0!important;border:0!important;border-bottom:2px solid transparent!important;font:inherit!important;letter-spacing:0!important;line-height:20px!important}
    .${prefix}-top-nav a:hover{color:#245dce!important;border-bottom-color:#245dce!important}
    .${prefix}-top-nav a.active{color:#245dce!important;border-bottom-color:#245dce!important;transform:translateY(-4px)!important}
    .${prefix}-top-nav .${prefix}-top-meeting{background:#142a46!important;color:#fff!important;padding:13px 18px!important;border:0!important;border-radius:7px!important;transform:none!important;line-height:20px!important}
    .${prefix}-top-menu{display:none;border:1px solid #dce3eb;background:#fff;color:#142a46;border-radius:8px;padding:8px 11px;font-family:Arial,Helvetica,sans-serif!important;font-size:14px!important;font-weight:600!important;min-height:44px}
    @media(max-width:1050px){.${prefix}-top{height:auto!important;min-height:74px!important}.${prefix}-top-inner{width:calc(100% - 36px)!important;height:auto!important;min-height:74px!important;grid-template-columns:1fr auto!important;column-gap:14px!important}.${prefix}-top-logo{width:auto!important;min-width:0!important;height:74px!important}.${prefix}-top-logo img{width:150px!important}.${prefix}-top-menu{display:block}.${prefix}-top-nav{display:none!important;grid-column:1/-1!important;width:100%!important;grid-template-columns:1fr!important;justify-content:start!important;align-items:start!important;row-gap:10px!important;column-gap:0!important;padding:12px 0 18px!important}.${prefix}-top-nav.open{display:grid!important}.${prefix}-top-nav a.active{transform:translateY(-3px)!important}.${prefix}-top-meeting{display:inline-block!important}}
`;

let dms = await readFile(join(root, 'dms.html'), 'utf8');
const dmsHeader = `<header class="dms-top"><div class="dms-top-inner"><a class="dms-top-logo" href="index.html" aria-label="Компаньйон — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a><button class="dms-top-menu" type="button" aria-expanded="false" aria-controls="dms-top-nav">Меню</button><nav class="dms-top-nav" id="dms-top-nav" aria-label="Сайт"><a href="index.html#solutions">Напрями</a><a class="active" href="dms.html">Медичне страхування</a><a href="index.html?page=about">Про нас</a><a href="partners.html">Страхові компанії</a><a href="app.html">Застосунок</a><a class="dms-top-meeting" href="index.html#meeting">Домовитися про зустріч ↗</a></nav></div></header>`;
dms = dms.replace('</style>', `${standaloneGeometry('dms')}  </style>`);
if (!dms.includes('class="dms-top"')) dms = dms.replace('<body>', `<body>\n  ${dmsHeader}`);
if (!dms.includes("querySelector('.dms-top-menu')")) dms = dms.replace('</body>', `  <script>const dmsMenu=document.querySelector('.dms-top-menu'),dmsNav=document.querySelector('#dms-top-nav');if(dmsMenu&&dmsNav){dmsMenu.addEventListener('click',()=>{const open=dmsNav.classList.toggle('open');dmsMenu.setAttribute('aria-expanded',String(open));});}</script>\n</body>`);
await writeFile(join(output, 'dms.html'), dms);

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
console.log('Built static Companion site with pixel-locked standalone header typography and coordinates.');

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

// Keep DMS visually independent: inject only its own isolated navigation classes.
let dms = await readFile(join(root, 'dms.html'), 'utf8');
const dmsHeaderStyles = `
    .dms-top{height:100px;background:#fff;color:#142a46;display:flex;align-items:center;position:relative;z-index:20}
    .dms-top-inner{width:min(1280px,calc(100% - 48px));margin:auto;display:flex;align-items:center;gap:32px}
    .dms-top-logo{display:flex;align-items:center;margin-right:auto}
    .dms-top-logo img{display:block;width:180px;height:auto}
    .dms-top-nav{display:flex;align-items:center;gap:30px;font-size:15px;font-weight:700;white-space:nowrap}
    .dms-top-nav a{color:#142a46;text-decoration:none}
    .dms-top-nav a.active{color:#2868e8;border-bottom:2px solid #2868e8;padding-bottom:14px}
    .dms-top-meeting{background:#142a46;color:#fff!important;padding:16px 20px;border-radius:8px}
    .dms-top-menu{display:none;border:1px solid #dbe3ee;background:#fff;color:#142a46;border-radius:8px;padding:10px 14px;font-weight:700}
    @media(max-width:1050px){.dms-top{height:auto;min-height:78px}.dms-top-inner{width:calc(100% - 32px);padding:14px 0;flex-wrap:wrap}.dms-top-logo img{width:150px}.dms-top-menu{display:block}.dms-top-nav{display:none;width:100%;flex-direction:column;align-items:flex-start;gap:16px;padding:12px 0}.dms-top-nav.open{display:flex}.dms-top-nav a.active{padding-bottom:4px}.dms-top-meeting{display:inline-block}}
`;
const dmsHeader = `<header class="dms-top"><div class="dms-top-inner"><a class="dms-top-logo" href="index.html" aria-label="Компаньйон — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро Компаньйон"></a><button class="dms-top-menu" type="button" aria-expanded="false" aria-controls="dms-top-nav">Меню</button><nav class="dms-top-nav" id="dms-top-nav" aria-label="Сайт"><a href="index.html#solutions">Напрями</a><a class="active" href="dms.html">Медичне страхування</a><a href="index.html?page=about">Про нас</a><a href="partners.html">Страхові компанії</a><a href="app.html">Застосунок</a><a class="dms-top-meeting" href="index.html#meeting">Домовитися про зустріч ↗</a></nav></div></header>`;
if (!dms.includes('.dms-top{')) dms = dms.replace('</style>', `${dmsHeaderStyles}  </style>`);
if (!dms.includes('class="dms-top"')) dms = dms.replace('<body>', `<body>\n  ${dmsHeader}`);
if (!dms.includes("querySelector('.dms-top-menu')")) dms = dms.replace('</body>', `  <script>const dmsMenu=document.querySelector('.dms-top-menu'),dmsNav=document.querySelector('#dms-top-nav');if(dmsMenu&&dmsNav){dmsMenu.addEventListener('click',()=>{const open=dmsNav.classList.toggle('open');dmsMenu.setAttribute('aria-expanded',String(open));});}</script>\n</body>`);
await writeFile(join(output, 'dms.html'), dms);

for (const file of [
  'styles.css','home.css','home.js','script.js','services.html','app.html','logistyka.html',
  'yak-my-pratsyuyemo.html','android-download.js','partners.html','regulatory.html',
  'privacy.html','insurance-products.html','CNAME'
]) {
  await copyFile(join(root, file), join(output, file));
}
await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
console.log('Built static Companion site with pre-rendered homepage and isolated standalone navigation.');

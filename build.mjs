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

// Keep the same global site navigation on the standalone DMS page.
let dms = await readFile(join(root, 'dms.html'), 'utf8');
if (!dms.includes('href="home.css"')) {
  dms = dms.replace(
    '<link rel="icon" type="image/png" href="presentation-assets/companion-logo.png">',
    '<link rel="icon" type="image/png" href="presentation-assets/companion-logo.png">\n  <link rel="stylesheet" href="home.css">'
  );
}
const dmsHeader = `<header class="site-header"><div class="shell header-inner"><a class="brand" href="index.html" aria-label="Страхове бюро «Компаньйон» — на головну"><img src="presentation-assets/companion-logo.png" alt="Страхове бюро «Компаньйон»"></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Меню</button><nav id="site-nav" class="site-nav" aria-label="Сайт"><a href="index.html#solutions">Напрями</a><a href="dms.html" aria-current="page">Медичне страхування</a><a data-page="about" href="index.html?page=about">Про нас</a><a href="partners.html">Страхові компанії</a><a href="app.html">Застосунок</a><a class="header-meeting" href="index.html#meeting">Домовитися про зустріч ↗</a></nav></div></header>`;
if (!dms.includes('class="site-header"')) {
  dms = dms.replace('<body>\n  <main>', `<body>\n  ${dmsHeader}\n  <main>`);
}
if (!dms.includes('script.js?v=4')) {
  dms = dms.replace('</body>', '  <script src="script.js?v=4"></script>\n</body>');
}
await writeFile(join(output, 'dms.html'), dms);

// Files that must be present in the published GitHub Pages artifact.
for (const file of [
  'styles.css','home.css','home.js','script.js','services.html','app.html','logistyka.html',
  'yak-my-pratsyuyemo.html','android-download.js','partners.html','regulatory.html',
  'privacy.html','insurance-products.html','CNAME'
]) {
  await copyFile(join(root, file), join(output, file));
}

await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
console.log('Built static Companion site with pre-rendered homepage, standalone pages and shared navigation.');

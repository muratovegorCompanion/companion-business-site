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
for (const file of ['styles.css','home.css','home.js','script.js','services.html','dms.html','app.html','logistyka.html','yak-my-pratsyuyemo.html','android-download.js']) {
  await copyFile(join(root, file), join(output, file));
}
await cp(join(root, 'presentation-assets'), join(output, 'presentation-assets'), {recursive:true});
console.log('Built static Companion site with pre-rendered homepage.');

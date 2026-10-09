// 3D-модель складу для sklad.html. Вантажиться лише тоді, коли людина
// натиснула «Покрутити в 3D»: фото-режим і картки зон живуть у sklad.js.
// Модуль сам малює сцену й позначки, а про клік по зоні повідомляє подією
// wh:pick на #wh-stage; sklad.js у відповідь кличе setState() і focus().
import * as THREE from 'three';
import { OrbitControls } from './vendor/three/OrbitControls.js';
import { GLTFLoader } from './vendor/three/loaders/GLTFLoader.js';

const stage = document.getElementById('wh-stage');
const host = document.getElementById('wh-canvas');
const markersEl = document.getElementById('wh-markers');
const panel = document.getElementById('wh-panel');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 860px)');

const ZONES = ['gate','yard','truck','dock','racks','neighbor','sprinkler','engineering','operator','building'];
const zoneEl = Object.fromEntries(ZONES.map(z => [z, document.getElementById('z-' + z)]));
const zoneTitle = z => zoneEl[z].querySelector('h3').textContent;
const zoneRoles = z => zoneEl[z].dataset.roles.split(' ');
const pickZone = (zone, fly) => stage.dispatchEvent(new CustomEvent('wh:pick', { detail:{ zone, fly } }));

// Без WebGL модуль не запускається — sklad.js лишає фото.
const gl = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
if (!gl) throw new Error('WebGL unavailable');

/* ---------- Сцена ---------- */
const C = {
  navy:0x0b1934, floor:0x13284a, slab:0x1a3358, steel:0x3a5f96, beam:0x2968e5, lime:0xc4f06b,
  box:0xb89666, box2:0x6f8fc4, glass:0x9fc3ff, white:0xdfe6ef, red:0xe2574c, dark:0x0f1f3a, edge:0x5d86c9,
};
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, small.matches ? 1.5 : 2));
renderer.shadowMap.enabled = !small.matches;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0b1934, 90, 190);
const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);

scene.add(new THREE.HemisphereLight(0xbcd4ff, 0x0b1934, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(30, 50, 26);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left:-50, right:50, top:50, bottom:-50, near:1, far:140 });
sun.shadow.bias = -0.0004;
scene.add(sun);
const rim = new THREE.DirectionalLight(0xc4f06b, 0.35);
rim.position.set(-40, 20, -30);
scene.add(rim);

// Матеріали — окремі на кожну зону, щоб підсвічувати й приглушувати зону цілком.
const zoneMats = Object.fromEntries(ZONES.map(z => [z, []]));
const zoneMeshes = Object.fromEntries(ZONES.map(z => [z, []]));
const mat = (zone, color, opts = {}) => {
  const m = new THREE.MeshStandardMaterial({ color, roughness:.7, metalness:.15, ...opts });
  m.userData.baseOpacity = m.opacity;
  m.userData.baseTransparent = m.transparent;
  if (zone) zoneMats[zone].push(m);
  return m;
};
// Прості форми кожного об’єкта збираються в окрему групу: коли
// підвантажиться детальна модель, групу ховаємо. Не підвантажилась —
// лишаються прості форми, і сцена все одно працює.
let sink = null;
const add = o => (sink || scene).add(o);
const collect = (fn) => {
  const g = new THREE.Group(); scene.add(g);
  const prev = sink; sink = g; fn(); sink = prev;
  return g;
};
const tag = (zone, mesh) => {
  mesh.userData.zone = zone;
  if (zone) zoneMeshes[zone].push(mesh);
  return mesh;
};
const box = (zone, material, w, h, d, x, y, z, { shadow = true } = {}) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = shadow; m.receiveShadow = true;
  add(tag(zone, m));
  return m;
};
const cyl = (zone, material, r, h, x, y, z, rot = null, seg = 16) => {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), material);
  m.position.set(x, y, z);
  if (rot) m.rotation.set(...rot);
  m.castShadow = true;
  add(tag(zone, m));
  return m;
};
const edges = (mesh, color = C.edge, opacity = .55) => {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity }));
  l.position.copy(mesh.position); l.rotation.copy(mesh.rotation);
  l.userData.zone = mesh.userData.zone; l.raycast = () => {};
  add(l);
  return l;
};
const people = [];
const person = (zone, x, z, color = C.white, rotY = 0) => {
  const g = new THREE.Group();
  const m = mat(zone, color);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.32, .9, 4, 10), m); body.position.y = .95;
  const head = new THREE.Mesh(new THREE.SphereGeometry(.24, 14, 10), m); head.position.y = 1.85;
  const vest = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, .45, 12), mat(zone, C.lime, { emissive:C.lime, emissiveIntensity:.15 }));
  vest.position.y = 1.15;
  [body, head, vest].forEach(p => { p.castShadow = true; tag(zone, p); g.add(p); });
  g.position.set(x, 0, z); g.rotation.y = rotY;
  add(g);
  people.push({ zone, g, x, z, rotY });
  return g;
};

/* Земля і сітка */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshStandardMaterial({ color:C.navy, roughness:1 }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.raycast = () => {};
scene.add(ground);
const grid = new THREE.GridHelper(160, 80, 0x1f3d6b, 0x15294a);
grid.position.y = .01; grid.material.transparent = true; grid.material.opacity = .55;
scene.add(grid);

/* 10. Будівля: напівпрозорі стіни з контуром, ферми даху, підлога */
const W = 48, D = 28, H = 10, BX = 0, BZ = -2;   // будівля x∈[-24,24], z∈[-16,12]
const bFloor = mat('building', C.slab);
bFloor.userData.flat = true;
box('building', bFloor, W, .4, D, BX, .2, BZ, { shadow:false });
const wallMat = mat('building', C.glass, { transparent:true, opacity:.10, depthWrite:false, roughness:.2, metalness:.1, side:THREE.DoubleSide });
const walls = [
  [W, H, .3, BX, H/2 + .4, BZ - D/2],        // задня
  [.3, H, D, BX - W/2, H/2 + .4, BZ],        // ліва
  [.3, H, D, BX + W/2, H/2 + .4, BZ],        // права
];
walls.forEach(w => { const m = box('building', wallMat, ...w, { shadow:false }); m.castShadow = false; edges(m, C.edge, .7); });
// Фасад із рампою: стіна над воротами і простінки між ними
const front = BZ + D/2;
const frontMat = mat('building', C.glass, { transparent:true, opacity:.14, depthWrite:false, side:THREE.DoubleSide });
[[-24,-13],[-7,-5],[1,3],[9,24]].forEach(([a,b]) => { const m = box('building', frontMat, b - a, H, .3, (a + b) / 2, H/2 + .4, front, { shadow:false }); edges(m, C.edge, .7); });
const lintel = box('building', frontMat, 22, H - 5, .3, -2, 5 + .4 + (H - 5) / 2, front, { shadow:false }); edges(lintel, C.edge, .7);
// Ворота рампи — світлі смуги, щоб читалися з будь-якого боку
[-10, -2, 6].forEach(x => {
  const g = box('dock', mat('dock', C.lime, { emissive:C.lime, emissiveIntensity:.25, transparent:true, opacity:.35 }), 4, .12, .4, x, 5.3, front + .1, { shadow:false });
  g.castShadow = false;
});
// Дах: ферми і прогони
const trussMat = mat('building', C.steel, { metalness:.5, roughness:.4 });
for (let x = -24; x <= 24; x += 6) box('building', trussMat, .25, .5, D, x, H + .6, BZ, { shadow:false });
[-1, 1].forEach(s => box('building', trussMat, W, .3, .3, 0, H + .9, BZ + s * D / 2, { shadow:false }));
box('building', trussMat, W, .4, .3, 0, H + 1.4, BZ, { shadow:false });
// Перегородка між зоною оператора і сусіднім орендарем
const partMat = mat('neighbor', C.glass, { transparent:true, opacity:.16, depthWrite:false, side:THREE.DoubleSide });
edges(box('neighbor', partMat, .2, 6, D - 2, 13, 3.4, BZ - 1, { shadow:false }), C.lime, .5);

/* 05. Стелажі з товаром */
const rackMat = mat('racks', C.steel, { metalness:.55, roughness:.35 });
const beamMat = mat('racks', C.beam, { metalness:.4, roughness:.4 });
const goodsMat = mat('racks', C.box, { roughness:.9 });
const rackRows = [-12.5, -6.5, -0.5];
const rackX0 = -14, rackX1 = 10, levels = [0.6, 2.5, 4.4, 6.3];
const primRacks = collect(() => {
  const posts = [], beams = [], goods = [];
  const rand = (i) => { const s = Math.sin(i * 91.7) * 43758.5; return s - Math.floor(s); };
  let n = 0;
  rackRows.forEach(z => {
    for (let x = rackX0; x <= rackX1; x += 3) [-1, 1].forEach(s => posts.push([x, z + s * 1.1]));
    levels.forEach(y => [-1, 1].forEach(s => beams.push([y, z + s * 1.1])));
    for (let x = rackX0 + 1.5; x < rackX1; x += 3) levels.forEach(y => {
      if (rand(++n) < .14) return;
      const h = 1.1 + rand(n + 7) * .6;
      goods.push([x, y + .15 + h / 2, z, h, rand(n + 3)]);
    });
  });
  const dummy = new THREE.Object3D();
  const inst = (geo, material, list, place) => {
    const m = new THREE.InstancedMesh(geo, material, list.length);
    list.forEach((p, i) => { place(dummy, p); dummy.updateMatrix(); m.setMatrixAt(i, dummy.matrix); });
    m.castShadow = true; m.receiveShadow = true;
    add(tag('racks', m));
    return m;
  };
  inst(new THREE.BoxGeometry(.18, 8, .18), rackMat, posts, (d, [x, z]) => { d.position.set(x, 4.4, z); d.scale.set(1,1,1); });
  inst(new THREE.BoxGeometry(rackX1 - rackX0, .16, .14), beamMat, beams, (d, [y, z]) => { d.position.set((rackX0 + rackX1) / 2, y + .4, z); });
  inst(new THREE.BoxGeometry(2.4, 1, 1.8), goodsMat, goods, (d, [x, y, z, h, r]) => {
    d.position.set(x + (r - .5) * .2, y + .4, z); d.scale.set(1 - r * .15, h, 1);
  });
});

/* 07. Спринклери: червоні труби під дахом */
const pipeMat = mat('sprinkler', C.red, { emissive:C.red, emissiveIntensity:.2, metalness:.3 });
rackRows.forEach(z => {
  cyl('sprinkler', pipeMat, .11, 34, -6, H - .4, z, [0, 0, Math.PI / 2], 8);
  for (let x = -20; x <= 10; x += 3) cyl('sprinkler', pipeMat, .09, .5, x, H - .7, z, null, 6);
});
cyl('sprinkler', pipeMat, .14, D - 4, -21, H - .4, BZ - 1, [Math.PI / 2, 0, 0], 8);
// Вузол керування спринклерами біля стіни
box('sprinkler', pipeMat, .9, 2.2, .9, -22.6, 1.5, -13.5);

/* 06. Сусідній орендар: палети на підлозі за перегородкою */
const nGoods = mat('neighbor', C.box2, { roughness:.85 });
const palMat = mat('neighbor', 0x8a6a45);
const pallets = [];
const primPallets = collect(() => {
  for (let x = 15; x <= 22; x += 2.6) for (let z = -13; z <= 6; z += 2.6) {
    const k = Math.abs(Math.sin(x * 3.1 + z));
    if (k < .2) continue;
    pallets.push([x, z, k]);
    box('neighbor', palMat, 2, .2, 2, x, .5, z);
    box('neighbor', nGoods, 1.8, 1 + k * 2.2, 1.8, x, .6 + (1 + k * 2.2) / 2, z);
  }
});

/* 09. Оператор складу: скляний офіс і люди */
const offMat = mat('operator', C.glass, { transparent:true, opacity:.22, depthWrite:false, side:THREE.DoubleSide });
const off = box('operator', offMat, 7, 3.2, 6, -20, 2, 8.4, { shadow:false });
edges(off, C.lime, .8);
const primDesk = collect(() => {
  box('operator', mat('operator', C.white), 2.4, .1, 1.2, -20.5, 1.3, 8.6);
  box('operator', mat('operator', C.dark), .9, .6, .1, -20.5, 1.7, 8.1);
});
person('operator', -19, 9.6, C.white, Math.PI);
person('operator', -16, 3.5, C.white, -.6);
// Табличка оператора
const sign = box('operator', mat('operator', C.lime, { emissive:C.lime, emissiveIntensity:.5 }), 3.4, .5, .1, -20, 3.9, 11.45, { shadow:false });
sign.castShadow = false;

/* 04. Рампа і навантажувач */
const dockMat = mat('dock', 0x2a4470);
dockMat.userData.flat = true;
box('dock', dockMat, 22, 1.2, 3, -2, .6, front + 1.5);
[-10, -2, 6].forEach(x => box('dock', mat('dock', C.dark), 3.8, .1, 2.6, x, 1.25, front + 1.5));
const primForklift = collect(() => {
  const fl = new THREE.Group();
  const body = mat('dock', C.lime, { roughness:.45, metalness:.2 });
  const darkM = mat('dock', C.dark);
  const parts = [
    [new THREE.BoxGeometry(1.4, .9, 2.2), body, 0, .85, 0],
    [new THREE.BoxGeometry(1.3, .1, 1.1), darkM, 0, 2.6, .25],
    [new THREE.BoxGeometry(.12, 2.2, .12), darkM, .55, 1.95, .7],
    [new THREE.BoxGeometry(.12, 2.2, .12), darkM, -.55, 1.95, .7],
    [new THREE.BoxGeometry(.12, 3, .12), darkM, .45, 1.9, -1.15],
    [new THREE.BoxGeometry(.12, 3, .12), darkM, -.45, 1.9, -1.15],
    [new THREE.BoxGeometry(.15, .08, 1.5), darkM, .3, .5, -1.9],
    [new THREE.BoxGeometry(.15, .08, 1.5), darkM, -.3, .5, -1.9],
    [new THREE.BoxGeometry(1.2, .9, 1.1), mat('dock', C.box), 0, 1.0, -1.95],
  ];
  parts.forEach(([g, m, x, y, z]) => { const p = new THREE.Mesh(g, m); p.position.set(x, y, z); p.castShadow = true; fl.add(tag('dock', p)); });
  [[.75, .9], [-.75, .9], [.75, -.7], [-.75, -.7]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.38, .38, .3, 14), darkM);
    w.rotation.z = Math.PI / 2; w.position.set(x, .38, z); fl.add(tag('dock', w));
  });
  fl.position.set(-3, .4, 6.5); fl.rotation.y = .35;
  add(fl);
});
person('dock', 2, 8, C.white, 2.4);

/* 03. Вантажівка біля рампи */
const tz = front + 3 + 7.5;
const primTruck = collect(() => {
  const trailer = box('truck', mat('truck', C.white, { roughness:.5 }), 3.2, 3.6, 13, -2, 3, tz);
  edges(trailer, 0x9fb6d8, .4);
  box('truck', mat('truck', 0x2968e5, { roughness:.35, metalness:.3 }), 3.2, 3, 3, -2, 2.4, tz + 8.4);
  box('truck', mat('truck', C.dark, { roughness:.1, metalness:.6 }), 2.8, 1.1, .1, -2, 3.1, tz + 9.95);
  const tyre = mat('truck', 0x0a1222);
  [[-5.5], [-3.8], [4.8], [8.6]].forEach(([dz]) => [-1.45, 1.45].forEach(dx =>
    cyl('truck', tyre, .55, .45, -2 + dx, .6, tz + dz, [0, 0, Math.PI / 2], 14)));
  // Груз у відкритих дверях напівпричепа
  box('truck', mat('truck', C.box), 1.2, 1.1, 1.2, -2.6, 1.8, tz - 5.6);
});

/* 02. Двір: розмітка, чуже авто, водій */
const yardMat = mat('yard', 0x1b3254);
yardMat.userData.flat = true;
box('yard', yardMat, 46, .06, 18, 2, .03, 23, { shadow:false });
const lineMat = mat('yard', C.white, { emissive:C.white, emissiveIntensity:.2 });
for (let x = 10; x <= 22; x += 3.2) box('yard', lineMat, .12, .08, 5, x, .08, 27, { shadow:false });
const primCar = collect(() => {
  box('yard', mat('yard', 0x7d93b8, { roughness:.4, metalness:.4 }), 2, 1.1, 4.2, 14.8, .85, 27);
  box('yard', mat('yard', C.dark, { roughness:.1, metalness:.6 }), 1.8, .7, 2.2, 14.8, 1.75, 26.9);
});
person('yard', 9, 19, C.white, .8);
// Ковзка зона біля рампи — блакитна пляма «ожеледиці»
const ice = new THREE.Mesh(new THREE.CircleGeometry(2.2, 28), mat('yard', 0x9fd2ff, { transparent:true, opacity:.35, emissive:0x9fd2ff, emissiveIntensity:.3 }));
ice.rotation.x = -Math.PI / 2; ice.position.set(9, .1, 17.5); add(tag('yard', ice));

/* 01. В’їзд і охорона: огорожа, КПП, шлагбаум */
const fenceMat = mat('gate', C.steel, { metalness:.5 });
const fence = [[-34, -26, -34, 34], [34, -26, 34, 34], [-34, -26, 34, -26], [-34, 34, 14, 34], [24, 34, 34, 34]];
fence.forEach(([x1, z1, x2, z2]) => {
  const len = Math.hypot(x2 - x1, z2 - z1), steps = Math.round(len / 4);
  for (let i = 0; i <= steps; i++) cyl('gate', fenceMat, .08, 2.2, x1 + (x2 - x1) * i / steps, 1.1, z1 + (z2 - z1) * i / steps, null, 6);
  const rail = box('gate', fenceMat, x1 === x2 ? .06 : len, .06, z1 === z2 ? .06 : len, (x1 + x2) / 2, 2.1, (z1 + z2) / 2, { shadow:false });
  rail.castShadow = false;
});
const primBooth = collect(() => {
const booth = box('gate', mat('gate', 0x2a4470), 2.6, 2.8, 2.6, 26, 1.4, 36.5);
edges(booth, C.lime, .6);
box('gate', mat('gate', C.glass, { transparent:true, opacity:.5 }), 2.7, .9, 2.7, 26, 2, 36.5);
box('gate', mat('gate', C.dark), 2.9, .2, 2.9, 26, 2.9, 36.5);
cyl('gate', mat('gate', C.dark), .25, 1.1, 14.4, .55, 34);
const armMat = mat('gate', C.red, { emissive:C.red, emissiveIntensity:.25 });
const arm = box('gate', armMat, 9.2, .18, .18, 19, 1.05, 34);
for (let i = 0; i < 4; i++) box('gate', mat('gate', C.white), .9, .2, .2, 15.8 + i * 2.2, 1.05, 34, { shadow:false });
});
// Камера на стовпі
cyl('gate', fenceMat, .1, 5, 24, 2.5, 33.6, null, 8);
box('gate', mat('gate', C.white), .7, .4, .4, 24, 5, 33.2);

/* 08. Інженерія: холодильні агрегати і щитова біля правої стіни */
const engMat = mat('engineering', 0x4a6a9a, { metalness:.5, roughness:.4 });
const fanMat = mat('engineering', C.dark);
const primCond = collect(() => [-12, -6].forEach(z => {
  const u = box('engineering', engMat, 3, 2.2, 4.2, 27.4, 1.1, z);
  edges(u, C.edge, .6);
  [-1, 1].forEach(s => cyl('engineering', fanMat, .8, .1, 27.4, 2.25, z + s * 1, null, 20));
}));
const panelBox = box('engineering', mat('engineering', 0x3a5480), 1.6, 2.6, .9, 27, 1.3, 1.5);
box('engineering', mat('engineering', 0xffd33d, { emissive:0xffd33d, emissiveIntensity:.4 }), .5, .5, .05, 27, 1.8, 2);
edges(panelBox, C.edge, .6);
// Кабель-канал до будівлі
box('engineering', mat('engineering', C.dark), 2.5, .2, .2, 25.3, 2.4, 1.5, { shadow:false });


/* ---------- Детальні моделі (згенеровані в Higgsfield) ----------
   Вантажаться після першого кадру. Кожна замінює свою групу простих форм;
   якщо файл не прийшов, прості форми лишаються на місці. */
const retire = (obj) => {
  obj.visible = false;
  obj.traverse(o => {
    const a = o.userData.zone && zoneMeshes[o.userData.zone];
    const i = a ? a.indexOf(o) : -1;
    if (i >= 0) a.splice(i, 1);
  });
};
const zoneMatCache = new Map();
const zoneMaterial = (zone, m) => {
  const key = zone + m.uuid;
  if (!zoneMatCache.has(key)) {
    const c = m.clone();
    c.userData.baseOpacity = c.opacity;
    c.userData.baseTransparent = c.transparent;
    zoneMats[zone].push(c);
    zoneMatCache.set(key, c);
  }
  return zoneMatCache.get(key);
};
// Модель стає на землю, центр — у нулі, довга сторона — уздовж X,
// масштаб — за довгою стороною або за висотою.
const prep = (src, zone, { size, by = 'long' }) => {
  const root = src.clone(true);
  let b = new THREE.Box3().setFromObject(root);
  let s = b.getSize(new THREE.Vector3());
  if (s.z > s.x) root.rotation.y = Math.PI / 2;
  const wrap = new THREE.Group(); wrap.add(root);
  b = new THREE.Box3().setFromObject(wrap); s = b.getSize(new THREE.Vector3());
  const k = size / (by === 'height' ? s.y : Math.max(s.x, s.z));
  const c = b.getCenter(new THREE.Vector3());
  root.position.set(-c.x, -b.min.y, -c.z);
  wrap.scale.setScalar(k);
  root.traverse(o => {
    if (!o.isMesh) return;
    o.material = Array.isArray(o.material) ? o.material.map(m => zoneMaterial(zone, m)) : zoneMaterial(zone, o.material);
    o.castShadow = true; o.receiveShadow = true;
    tag(zone, o);
  });
  return { obj:wrap, len:s.x * k, depth:s.z * k, height:s.y * k };
};
const place = (src, zone, opts, x, y, z, ry = 0) => {
  const p = prep(src, zone, opts);
  p.obj.position.set(x, y, z); p.obj.rotation.y = ry;
  scene.add(p.obj);
  return p;
};
const MODELS = {
  truck: (g) => { place(g, 'truck', { size:17 }, -2, 0, tz + 1.5, Math.PI / 2); retire(primTruck); },
  forklift: (g) => { place(g, 'dock', { size:3.4 }, -3, .4, 6.5, .35 + Math.PI / 2); retire(primForklift); },
  rack: (g) => {
    const probe = prep(g, 'racks', { size:7.6, by:'height' });
    const n = Math.max(1, Math.round((rackX1 - rackX0) / probe.len));
    const step = (rackX1 - rackX0) / n;
    rackRows.forEach(z => { for (let i = 0; i < n; i++) {
      const p = prep(g, 'racks', { size:7.6, by:'height' });
      p.obj.scale.x *= step / p.len;
      p.obj.position.set(rackX0 + step * (i + .5), .4, z);
      scene.add(p.obj);
    } });
    retire(primRacks);
  },
  booth: (g) => { place(g, 'gate', { size:3.6 }, 26, 0, 36.5, -Math.PI / 2); primBooth.children.filter(o => Math.abs(o.position.x - 26) < .1).forEach(retire); },
  condenser: (g) => { [-12, -6].forEach(z => place(g, 'engineering', { size:4.2 }, 27.4, 0, z, Math.PI / 2)); retire(primCond); },
  worker: (g) => { people.forEach(p => { place(g, p.zone, { size:1.8, by:'height' }, p.x, p.zone === 'yard' ? 0 : .4, p.z, p.rotY); retire(p.g); }); },
  pallet: (g) => { pallets.forEach(([x, z, k], i) => place(g, 'neighbor', { size:1.2 + k * 2, by:'height' }, x, .4, z, (i % 4) * Math.PI / 2)); retire(primPallets); },
  car: (g) => { place(g, 'yard', { size:4.4 }, 14.8, 0, 27, Math.PI / 2); retire(primCar); },
  office: (g) => { place(g, 'operator', { size:3.3, by:'height' }, -20, .4, 8.4); retire(primDesk); retire(off); },
};
// Файли лежать у сховищі Higgsfield (CDN з CORS і вічним кешем). Коли
// їх перенесуть у репозиторій, досить поміняти MODEL_BASE і імена.
const MODEL_BASE = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Iw0kgM5PzAToGgsDMeaBRFqvuE/';
const MODEL_FILES = {
  truck:'d35d7479-293d-4a57-a899-a8760660babc', forklift:'bf93dcea-6aa1-43a1-81c1-e61a94db0ab0',
  rack:'85bf9f1a-cfaf-476c-91dc-a7a47dd1fe8a', booth:'1586fc7c-9fe9-48d9-923e-b02514951203',
  worker:'443b075f-ed78-4354-893e-a1b02971a399', car:'aef54383-141b-4f4c-a4f5-70ae6e68b2b8',
  condenser:'13b9b4f1-7108-4ac2-bcaa-add0dacc204b', pallet:'619a6761-ddaa-4925-a285-16e585359b01',
  office:'4eebe5c5-3ff3-4c91-9a38-babf84561fb4',
};
const loadModels = () => {
  const loader = new GLTFLoader();
  Object.entries(MODELS).forEach(([name, build]) =>
    loader.loadAsync(MODEL_BASE + MODEL_FILES[name] + '.glb')
      .then(gltf => { build(gltf.scene); paint(); })
      .catch(e => console.warn('model', name, e)));
};

/* ---------- Позначки зон і кадри камери ---------- */
// anchor — де стоїть позначка; cam/target — куди летить камера в турі.
const SPOTS = {
  gate:        { a:[20, 4.5, 35],  cam:[42, 18, 58],  t:[20, 1, 33] },
  yard:        { a:[11, 3.2, 21],  cam:[30, 16, 46],  t:[10, 1, 22] },
  truck:       { a:[-2, 6.2, 20],  cam:[-22, 14, 40], t:[-2, 2, 20] },
  dock:        { a:[-3, 4.4, 9],   cam:[10, 12, 28],  t:[-3, 1.5, 8] },
  racks:       { a:[-2, 9.4, -6],  cam:[16, 20, 22],  t:[-2, 3, -6] },
  neighbor:    { a:[18, 5.5, -3],  cam:[38, 22, 18],  t:[18, 1.5, -3] },
  sprinkler:   { a:[-10, 10.6, -12.5], cam:[-30, 20, 18], t:[-8, 8, -6] },
  engineering: { a:[27.4, 4, -9],  cam:[46, 14, 6],   t:[27, 1.5, -6] },
  operator:    { a:[-20, 5, 8.4],  cam:[-38, 14, 26], t:[-19, 1.5, 7] },
  building:    { a:[-12, 13, -15], cam:[-50, 34, -40], t:[0, 4, -2] },
};
const VIEWS = {
  '3d': { cam:[44, 34, 56], t:[0, 1, 4] },
  top:  { cam:[0, 92, 6],   t:[0, 0, 5] },
  side: { cam:[0, 7, 78],   t:[0, 5, 5] },
};
const markers = {};
ZONES.forEach((z, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'wh-mk';
  b.innerHTML = `<i>${String(i + 1).padStart(2, '0')}</i><span>${zoneTitle(z)}</span>`;
  b.setAttribute('aria-label', `${zoneTitle(z)}: показати ризики`);
  b.addEventListener('click', () => pickZone(z, true));
  markersEl.appendChild(b);
  markers[z] = { el:b, pos:new THREE.Vector3(...SPOTS[z].a) };
});

/* ---------- Камера ---------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = .08;
controls.maxPolarAngle = Math.PI * .49; controls.minDistance = 12; controls.maxDistance = 150;
controls.screenSpacePanning = false;
const PAN_LIMIT = 45;
controls.addEventListener('change', () => {
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, -PAN_LIMIT, PAN_LIMIT);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, -PAN_LIMIT, PAN_LIMIT);
  controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0, 12);
});
// На вузькому екрані сцена не влазить у кадр — відсуваємо камеру.
let visAspect = 1.6;
const fit = (cam, t) => {
  const a = visAspect;
  const k = a < 1 ? 1.5 + (1 - a) * .9 : a < 1.4 ? 1.15 + (1.4 - a) * .5 : 1;
  return cam.map((v, i) => t[i] + (v - t[i]) * k);
};
let fly = null;
const flyTo = (cam, t) => {
  const to = new THREE.Vector3(...fit(cam, t)), tt = new THREE.Vector3(...t);
  if (still) { camera.position.copy(to); controls.target.copy(tt); controls.update(); return; }
  fly = { p0:camera.position.clone(), t0:controls.target.clone(), p1:to, t1:tt, s:performance.now(), d:1300 };
};
const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
controls.addEventListener('start', () => { fly = null; stopIdle(); });
/* ---------- Стан приходить із sklad.js ---------- */
let current = null, role = 'all';
const HL = new THREE.Color(C.lime);

const paint = () => {
  ZONES.forEach(z => {
    const on = z === current;
    const relevant = role === 'all' || zoneRoles(z).includes(role);
    zoneMats[z].forEach(m => {
      if (!m.userData.baseEmissive) m.userData.baseEmissive = { c:m.emissive.clone(), i:m.emissiveIntensity };
      const base = m.userData.baseEmissive;
      m.emissive.copy(on ? HL : base.c);
      m.emissiveIntensity = on ? (m.userData.flat ? .06 : .22) : base.i;
      const dim = !relevant && !on;
      m.transparent = dim || m.userData.baseTransparent;
      m.opacity = dim ? m.userData.baseOpacity * .22 : m.userData.baseOpacity;
      m.depthWrite = !m.transparent;
      m.needsUpdate = true;
    });
    markers[z].el.classList.toggle('is-on', on);
    markers[z].el.classList.toggle('is-dim', !relevant && !on);
  });
};
export function setState(z, r) { current = z; role = r; paint(); }
export function focus(z) { stopIdle(); flyTo(SPOTS[z].cam, SPOTS[z].t); }
export function view(name) { stopIdle(); flyTo(VIEWS[name].cam, VIEWS[name].t); }
/* Клік по об’єкту. Стіни будівлі прозорі й стоять перед усім іншим,
   тому будівля вибирається лише тоді, коли під курсором нічого іншого. */
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
const pick = (e) => {
  const r = renderer.domElement.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(ZONES.flatMap(z => zoneMeshes[z]), false).filter(h => h.object.userData.zone);
  const visible = hits.filter(h => role === 'all' || zoneRoles(h.object.userData.zone).includes(role) || h.object.userData.zone === current);
  const hit = visible.find(h => h.object.userData.zone !== 'building') || visible[0];
  return hit ? hit.object.userData.zone : null;
};
let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY }; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const z = pick(e);
  if (z) pickZone(z, false);
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons) return;
  host.classList.toggle('is-hover', !!pick(e));
});

/* Повільний оберт, поки людина нічого не торкалась */
let idle = !still;
function stopIdle() { idle = false; }

/* ---------- Цикл ---------- */
const v = new THREE.Vector3();
const resize = () => {
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  // На широкому екрані праворуч лежить картка — зсуваємо центр кадру вліво,
  // щоб склад не ховався під нею.
  const shift = small.matches ? 0 : Math.round(panel.offsetWidth / 2);
  camera.aspect = (w + shift * 2) / h;
  visAspect = (w - shift * 2) / h;
  if (shift) camera.setViewOffset(w + shift * 2, h, shift * 2, 0, w, h); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
};
new ResizeObserver(resize).observe(host);
resize();
{ const s = fit(VIEWS['3d'].cam, VIEWS['3d'].t); camera.position.set(...s); controls.target.set(...VIEWS['3d'].t); controls.update(); }

let visibleOnScreen = true;
new IntersectionObserver(([e]) => { visibleOnScreen = e.isIntersecting; }).observe(host);

const tick = (now) => {
  requestAnimationFrame(tick);
  if (!visibleOnScreen) return;
  if (fly) {
    const k = Math.min(1, (now - fly.s) / fly.d), e = ease(k);
    camera.position.lerpVectors(fly.p0, fly.p1, e);
    controls.target.lerpVectors(fly.t0, fly.t1, e);
    if (k >= 1) fly = null;
  } else if (idle) {
    const a = .0009, x = camera.position.x - controls.target.x, z = camera.position.z - controls.target.z;
    camera.position.x = controls.target.x + x * Math.cos(a) - z * Math.sin(a);
    camera.position.z = controls.target.z + x * Math.sin(a) + z * Math.cos(a);
  }
  controls.update();
  renderer.render(scene, camera);
  // Позначки стежать за своїми точками; ті, що позаду камери, ховаємо.
  const w = host.clientWidth, h = host.clientHeight;
  ZONES.forEach(z => {
    const m = markers[z];
    v.copy(m.pos).project(camera);
    const hidden = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
    m.el.classList.toggle('is-hidden', hidden);
    if (!hidden) m.el.style.transform = `translate(${(v.x * .5 + .5) * w - 14}px,${(-v.y * .5 + .5) * h - 14}px)`;
  });
};
requestAnimationFrame(tick);
requestAnimationFrame(() => setTimeout(loadModels, 0));

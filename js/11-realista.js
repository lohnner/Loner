// Terreno com gráficos 3D de verdade (WebGL, biblioteca Three.js): luz do sol, sombras, grama, água e animais arredondados.
// Os corpos saem dos voxels de 09-voxel.js, alisados por Surface Nets. Mesma simulação e câmera do 10-terreno3d.js.
// Sem WebGL ou sem a biblioteca, desenhaRealista devolve false e o terreno em voxels continua funcionando.
'use strict';

let R3 = null; // null = ainda não tentou; false = não dá; objeto = pronto
const geoCache = {};

function linearDe(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
function ruido(x, y){
  const i = Math.floor(x), j = Math.floor(y), f = x - i, g = y - j;
  const h = (a, b) => hashV(a, b, 9) / 15, u = f * f * (3 - 2 * f), v = g * g * (3 - 2 * g);
  return (h(i, j) * (1 - u) + h(i + 1, j) * u) * (1 - v) + (h(i, j + 1) * (1 - u) + h(i + 1, j + 1) * u) * v;
}
const fbm = (x, y) => ruido(x, y) * .55 + ruido(x * 2.3 + 7, y * 2.3 + 3) * .3 + ruido(x * 5.1 + 2, y * 5.1 + 9) * .15;

/* ---------- MODELOS ---------- */
// Voxels → malha lisa. O grid tem 2 células por voxel; densidade e cor são suavizadas e a superfície sai em iso = .3.
function geometriaDe(id){
  if(geoCache[id]) return geoCache[id];
  const vox = listaDe(id), RES = 2, PAD = 3, ISO = .3;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, z1 = 0, topoPerna = 0;
  for(const v of vox){
    x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); z1 = Math.max(z1, v.z);
    if(v.g) topoPerna = Math.max(topoPerna, v.z + 1);
  }
  const nx = (x1 - x0 + 1) * RES + PAD * 2, ny = (y1 - y0 + 1) * RES + PAD * 2, nz = (z1 + 1) * RES + PAD * 2, n = nx * ny * nz;
  const I = (a, b, c) => a + b * nx + c * nx * ny;
  let d = new Float32Array(n), cr = new Float32Array(n), cg = new Float32Array(n), cb = new Float32Array(n);
  const gr = new Int8Array(n);
  for(const v of vox){
    const c = linearDe(v.c);
    for(let a = 0; a < RES; a++) for(let b = 0; b < RES; b++) for(let e = 0; e < RES; e++){
      const k = I((v.x - x0) * RES + a + PAD, (v.y - y0) * RES + b + PAD, v.z * RES + e + PAD);
      d[k] = 1; cr[k] = c.r; cg[k] = c.g; cb[k] = c.b; gr[k] = v.g;
    }
  }
  const borra = (src, passo) => {
    const out = new Float32Array(n);
    for(let c = 1; c < nz - 1; c++) for(let b = 1; b < ny - 1; b++) for(let a = 1; a < nx - 1; a++){
      const k = I(a, b, c);
      out[k] = (src[k - passo] + 2 * src[k] + src[k + passo]) / 4;
    }
    return out;
  };
  const eixos = [1, nx, nx * ny];
  for(let it = 0; it < 2; it++) for(const p of eixos){ d = borra(d, p); cr = borra(cr, p); cg = borra(cg, p); cb = borra(cb, p); }
  // Surface Nets: um vértice por célula cortada pela superfície
  const idx = new Int32Array(n).fill(-1), pos = [], cor = [], mor = [];
  const P = (a, b, c) => [(a - PAD) / RES + x0, (c - PAD) / RES, (b - PAD) / RES + y0]; // voxel (x, y, z) → cena (x, z, y)
  const CANTOS = [[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]];
  const ARESTAS = [[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
  const v = new Float32Array(8);
  for(let c = 0; c < nz - 1; c++) for(let b = 0; b < ny - 1; b++) for(let a = 0; a < nx - 1; a++){
    let tem = 0;
    for(let q = 0; q < 8; q++){ v[q] = d[I(a + CANTOS[q][0], b + CANTOS[q][1], c + CANTOS[q][2])]; if(v[q] > ISO) tem |= 1 << q; }
    if(tem === 0 || tem === 255) continue;
    let sx = 0, sy = 0, sz = 0, m = 0;
    for(const [p, q] of ARESTAS){
      if((v[p] > ISO) === (v[q] > ISO)) continue;
      const t = (ISO - v[p]) / (v[q] - v[p]), A = CANTOS[p], B = CANTOS[q];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; m++;
    }
    const [X, Y, Z] = P(a + sx / m, b + sy / m, c + sz / m);
    idx[I(a, b, c)] = pos.length / 3;
    pos.push(X, Y, Z);
    let tr = 0, tg = 0, tb = 0, td = 0, g = 0;
    for(const K of CANTOS){
      const k = I(a + K[0], b + K[1], c + K[2]);
      tr += cr[k]; tg += cg[k]; tb += cb[k]; td += d[k];
    }
    for(let e = -1; e <= 2 && !g; e++) for(let f = -1; f <= 2 && !g; f++) for(let h = -1; h <= 2 && !g; h++){
      const aa = a + e, bb = b + f, cc = c + h;
      if(aa >= 0 && bb >= 0 && cc >= 0 && aa < nx && bb < ny && cc < nz) g = gr[I(aa, bb, cc)];
    }
    const pelo = .9 + hashV(a, b, c) / 15 * .2;
    td = Math.max(td, 1e-3);
    cor.push(tr / td * pelo, tg / td * pelo, tb / td * pelo);
    // morph: a perna balança para a frente e para trás (grupo 1 e 2 em oposição)
    const f = g && Y < topoPerna ? clamp(1 - Y / topoPerna, 0, 1) : 0, am = Math.min(1.4, topoPerna * .4) * f * (g === 1 ? 1 : -1);
    mor.push(am, f * .15, 0);
  }
  const tri = [];
  const quad = (a, b, c, e, para) => {
    if(a < 0 || b < 0 || c < 0 || e < 0) return;
    const pa = a * 3, pb = b * 3, pc = c * 3;
    const ux = pos[pb] - pos[pa], uy = pos[pb + 1] - pos[pa + 1], uz = pos[pb + 2] - pos[pa + 2];
    const wx = pos[pc] - pos[pa], wy = pos[pc + 1] - pos[pa + 1], wz = pos[pc + 2] - pos[pa + 2];
    const nX = uy * wz - uz * wy, nY = uz * wx - ux * wz, nZ = ux * wy - uy * wx;
    if(nX * para[0] + nY * para[1] + nZ * para[2] > 0) tri.push(a, b, c, a, c, e);
    else tri.push(a, c, b, a, e, c);
  };
  for(let c = 1; c < nz - 1; c++) for(let b = 1; b < ny - 1; b++) for(let a = 1; a < nx - 1; a++){
    const k = I(a, b, c), den = d[k] > ISO;
    if(den !== (d[k + 1] > ISO)){ // aresta em x
      quad(idx[I(a, b - 1, c - 1)], idx[I(a, b, c - 1)], idx[k], idx[I(a, b - 1, c)], [den ? 1 : -1, 0, 0]);
    }
    if(den !== (d[k + nx] > ISO)){ // aresta em y do voxel = z da cena
      quad(idx[I(a - 1, b, c - 1)], idx[I(a, b, c - 1)], idx[k], idx[I(a - 1, b, c)], [0, 0, den ? 1 : -1]);
    }
    if(den !== (d[k + nx * ny] > ISO)){ // aresta em z do voxel = y da cena
      quad(idx[I(a - 1, b - 1, c)], idx[I(a, b - 1, c)], idx[k], idx[I(a - 1, b, c)], [0, den ? 1 : -1, 0]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(cor, 3));
  g.setIndex(tri);
  g.computeVertexNormals();
  if(topoPerna){ g.morphAttributes.position = [new THREE.Float32BufferAttribute(mor, 3)]; g.morphTargetsRelative = true; }
  g.userData.altura = z1 + 1;
  return geoCache[id] = g;
}

/* ---------- CENÁRIO ---------- */
function alturaChao(x, y){
  const base = (fbm(x * .09, y * .09) - .5) * .5;
  if(!noLago(x, y, 1.3)) return base;
  const a = (x - terrenoN * .76) / (terrenoN * .17), b = (y - terrenoN * .24) / (terrenoN * .15), r = Math.sqrt(a * a + b * b);
  return base * clamp(r - 1, 0, 1) - clamp(1.3 - r, 0, 1) * 2.2;
}
function texturaChao(n){
  const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), D = img.data;
  for(let py = 0; py < S; py++) for(let px = 0; px < S; px++){
    const x = px / S * n, y = py / S * n, k = (px + py * S) * 4;
    const t = fbm(x * .22, y * .22), m = fbm(x * .9 + 40, y * .9), f = ruido(x * 4.5, y * 4.5);
    let r = 58 + t * 46 + f * 20, g = 96 + t * 62 + f * 26, b = 30 + t * 20 + f * 10;
    if(m > .62){ const u = (m - .62) * 2.2; r += u * 70; g += u * 28; b += u * 12; } // falhas de terra na grama
    const h = alturaChao(x, y);
    if(h < -.05){ const u = clamp(-h / .5, 0, 1); r += (188 - r) * u; g += (168 - g) * u; b += (118 - b) * u; }
    if(h < -.7){ const u = clamp((-h - .7) / .8, 0, 1); r *= 1 - u * .55; g *= 1 - u * .4; b *= 1 - u * .3; }
    D[k] = r; D[k + 1] = g; D[k + 2] = b; D[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
  return t;
}
function texturaOndas(){
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), D = img.data;
  const h = (x, y) => Math.sin(x / S * 6.283 * 3 + 2 * Math.sin(y / S * 6.283)) + Math.sin(y / S * 6.283 * 4 + 1.5 * Math.sin(x / S * 6.283 * 2)) * .7 + Math.sin((x + y) / S * 6.283 * 7) * .3;
  for(let y = 0; y < S; y++) for(let x = 0; x < S; x++){
    const k = (x + y * S) * 4, nx = h(x + 1, y) - h(x - 1, y), ny = h(x, y + 1) - h(x, y - 1);
    D[k] = 128 + nx * 90; D[k + 1] = 128 + ny * 90; D[k + 2] = 255; D[k + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function ceuEnv(renderer){
  const cena = new THREE.Scene(), g = new THREE.SphereGeometry(50, 24, 12), p = g.attributes.position, cor = new Float32Array(p.count * 3);
  const alto = linearDe('#6fb2ea'), hor = linearDe('#f3eadb'), chao = linearDe('#6d7a4f'), c = new THREE.Color();
  for(let i = 0; i < p.count; i++){
    const y = p.getY(i) / 50;
    if(y > 0) c.copy(hor).lerp(alto, Math.pow(y, .6)); else c.copy(hor).lerp(chao, Math.min(1, -y * 3));
    cor.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cor, 3));
  cena.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({vertexColors: true, side: THREE.BackSide})));
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(cena, .02).texture;
  pm.dispose();
  return env;
}
function bolhaIrregular(raio, semente, cor){
  const g = new THREE.IcosahedronGeometry(raio, 2), p = g.attributes.position, c = new Float32Array(p.count * 3), base = linearDe(cor), t = new THREE.Color();
  for(let i = 0; i < p.count; i++){
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = 1 + (ruido(x * 1.3 + semente, y * 1.3 + z) - .5) * .5;
    p.setXYZ(i, x * f, y * f, z * f);
    t.copy(base).multiplyScalar(.75 + ruido(x * 2 + z, y * 2 + semente) * .55);
    c.set([t.r, t.g, t.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3));
  g.computeVertexNormals();
  return g;
}
function montaCenario(){
  const r3 = R3, n = terrenoN;
  if(r3.cenario){
    r3.scene.remove(r3.cenario);
    r3.cenario.traverse(o => { if(o.geometry) o.geometry.dispose(); if(o.material){ if(o.material.map) o.material.map.dispose(); o.material.dispose(); } });
  }
  const G = new THREE.Group(); r3.cenario = G; r3.scene.add(G); r3.cenarioN = n;
  // chão com relevo
  const pl = new THREE.PlaneGeometry(n, n, 96, 96); pl.rotateX(-Math.PI / 2);
  const pp = pl.attributes.position;
  for(let i = 0; i < pp.count; i++) pp.setY(i, alturaChao(pp.getX(i) + n / 2, pp.getZ(i) + n / 2));
  pl.computeVertexNormals();
  const chao = new THREE.Mesh(pl, new THREE.MeshStandardMaterial({map: texturaChao(n), roughness: .95}));
  chao.receiveShadow = true; G.add(chao);
  // laterais de terra
  const terra = new THREE.MeshStandardMaterial({color: linearDe('#6b4a2e'), roughness: 1});
  [[0, -n / 2, n, .6], [0, n / 2, n, .6], [-n / 2, 0, .6, n], [n / 2, 0, .6, n]].forEach(([x, z, w, d]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, 4, d), terra);
    b.position.set(x, -2, z); G.add(b);
  });
  // água
  r3.ondas = r3.ondas || texturaOndas();
  r3.ondas.repeat.set(3, 3);
  const agua = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({
    color: linearDe('#2f7fb0'), roughness: .12, metalness: .35, normalMap: r3.ondas, normalScale: new THREE.Vector2(.35, .35), transparent: true, opacity: .84,
  }));
  agua.rotation.x = -Math.PI / 2; agua.scale.set(n * .17 * 1.04, n * .15 * 1.04, 1);
  agua.position.set(n * .76 - n / 2, -.22, n * .24 - n / 2); G.add(agua);
  // grama em tufos
  const lam = new THREE.PlaneGeometry(.22, .9, 1, 2); lam.translate(0, .45, 0);
  const lp = lam.attributes.position;
  for(let i = 0; i < lp.count; i++){ const y = lp.getY(i) / .9; lp.setX(i, lp.getX(i) * (1 - y)); lp.setZ(i, y * y * .22); }
  const nrm = lam.attributes.normal; for(let i = 0; i < nrm.count; i++) nrm.setXYZ(i, 0, 1, 0);
  const mult = r3.fraco ? 1.2 : 3, qt = Math.floor(n * n * mult);
  const grama = new THREE.InstancedMesh(lam, new THREE.MeshStandardMaterial({side: THREE.DoubleSide, roughness: 1}), qt);
  const M = new THREE.Object3D(), C = new THREE.Color(), rn = rng(n * 131), verdes = ['#4d8a2c', '#5f9c35', '#3f7a2a', '#79a83e', '#8aa646'].map(linearDe);
  let u = 0;
  for(let i = 0; i < qt * 2 && u < qt; i++){
    const x = rn() * (n - 1) + .5, y = rn() * (n - 1) + .5;
    if(noLago(x, y, 1.25)) continue;
    const a = rn() * 6.28, e = .7 + rn() * .9;
    M.position.set(x - n / 2, alturaChao(x, y) - .02, y - n / 2); M.rotation.set(0, a, 0); M.scale.set(e, e, e); M.updateMatrix();
    grama.setMatrixAt(u, M.matrix);
    C.copy(verdes[Math.floor(rn() * verdes.length)]).multiplyScalar(.85 + rn() * .3);
    grama.setColorAt(u, C);
    u++;
  }
  grama.count = u; grama.receiveShadow = true; G.add(grama);
  // cerca de madeira
  const madeira = new THREE.MeshStandardMaterial({color: linearDe('#8a6239'), roughness: .85});
  const posteG = new THREE.CylinderGeometry(.22, .26, 2.3, 8); posteG.translate(0, 1.05, 0);
  const lado = n - 1, passo = 6, cada = Math.floor(lado / passo) + 1, postes = new THREE.InstancedMesh(posteG, madeira, cada * 4);
  let ip = 0;
  const poste = (x, z) => { M.position.set(x - n / 2, alturaChao(x, z), z - n / 2); M.rotation.set(0, 0, 0); M.scale.set(1, 1, 1); M.updateMatrix(); postes.setMatrixAt(ip++, M.matrix); };
  for(let i = 0; i < cada; i++){ const t = .5 + i * passo; poste(t, .5); poste(t, n - .5); poste(.5, t); poste(n - .5, t); }
  postes.castShadow = true; G.add(postes);
  [[n / 2, .5, n - 1, .16], [n / 2, n - .5, n - 1, .16], [.5, n / 2, .16, n - 1], [n - .5, n / 2, .16, n - 1]].forEach(([x, z, w, d]) => {
    for(const h of [.95, 1.75]){
      const t = new THREE.Mesh(new THREE.BoxGeometry(w, .2, d), madeira);
      t.position.set(x - n / 2, h, z - n / 2); t.castShadow = true; G.add(t);
    }
  });
  // árvores e pedras
  const folha = new THREE.MeshStandardMaterial({vertexColors: true, roughness: .9});
  const casca = new THREE.MeshStandardMaterial({color: linearDe('#5a3f28'), roughness: .95});
  for(const e of enfeites){
    const P = new THREE.Vector3(e.x - n / 2, alturaChao(e.x, e.y), e.y - n / 2);
    if(e.id === '_pedra'){
      const m = new THREE.Mesh(bolhaIrregular(1.5, e.x, '#8d8f88'), folha);
      m.position.copy(P); m.scale.set(1.2, .7, 1); m.castShadow = m.receiveShadow = true; G.add(m);
      continue;
    }
    const h = e.id === '_arvore2' ? 8 : 6;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.42, .72, h, 8), casca);
    tr.position.copy(P).setY(P.y + h / 2); tr.castShadow = true; G.add(tr);
    const cf = e.id === '_arvore2' ? '#2f6b38' : '#487f33';
    [[0, h + 1.2, 0, 3.1], [1.7, h, .5, 2.2], [-1.5, h + .2, -.8, 2.3], [.3, h + 2.9, -.4, 2], [-.5, h - .4, 1.7, 2]].forEach(([a, b, c, ra], i) => {
      const fm = new THREE.Mesh(bolhaIrregular(ra, e.x + i * 3, cf), folha);
      fm.position.set(P.x + a, P.y + b, P.z + c); fm.castShadow = fm.receiveShadow = true; G.add(fm);
    });
  }
  // sol e câmera acompanham o tamanho do terreno
  const s = r3.sol, q = n * .78;
  s.position.set(-n * .55, n * 1.15, n * .2);
  s.shadow.camera.left = -q; s.shadow.camera.right = q; s.shadow.camera.top = q; s.shadow.camera.bottom = -q; s.shadow.camera.far = n * 3.2;
  s.shadow.camera.updateProjectionMatrix();
  const dist = n * 3.05;
  r3.camera.position.set(dist * .62, dist * .55, dist * .62);
  r3.camera.lookAt(0, -1, 0);
}
const EMOJI = {coracao: '❤️', chuva: '🌧️', alerta: '❗', caveira: '💀'};
function materialIcone(nome){
  const r3 = R3;
  if(r3.icones[nome]) return r3.icones[nome];
  const cv = document.createElement('canvas'); cv.width = cv.height = 64;
  const c = cv.getContext('2d'); c.font = '48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(EMOJI[nome], 32, 36);
  return r3.icones[nome] = new THREE.SpriteMaterial({map: new THREE.CanvasTexture(cv), depthTest: false, transparent: true});
}

/* ---------- INÍCIO E QUADRO ---------- */
function iniciaRealista(){
  if(R3 !== null) return R3;
  R3 = false;
  if(!window.THREE) return false;
  try{
    const cv = document.createElement('canvas'); cv.id = 'terrenoGL';
    cv.setAttribute('aria-label', 'Terreno em 3D com seus animais. Toque em um animal para ver a ficha.');
    const renderer = new THREE.WebGLRenderer({canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const fraco = (navigator.hardwareConcurrency || 4) <= 4;
    const scene = new THREE.Scene(); scene.environment = ceuEnv(renderer);
    const camera = new THREE.PerspectiveCamera(17, 236 / 168, 1, 800);
    const sol = new THREE.DirectionalLight(new THREE.Color('#fff1d6'), 2.6);
    sol.castShadow = true; sol.shadow.mapSize.set(fraco ? 1024 : 2048, fraco ? 1024 : 2048); sol.shadow.bias = -.0006; sol.shadow.normalBias = .06;
    scene.add(sol, sol.target, new THREE.HemisphereLight(new THREE.Color('#cfe6ff'), new THREE.Color('#5d6b3f'), .35));
    R3 = {renderer, scene, camera, sol, fraco, cv, ondas: null, cenario: null, cenarioN: 0, malhas: new Map(), efeitos: [], icones: {},
      material: new THREE.MeshStandardMaterial({vertexColors: true, roughness: .78, metalness: 0}), pr: Math.min(devicePixelRatio || 1, fraco ? 1.5 : 2), custo: 0, nQuadros: 0, ultimo: 0};
    cv.addEventListener('click', cliqueRealista);
  }catch(e){ R3 = false; }
  return R3;
}
function posDoAnimal(a, m){
  const n = terrenoN;
  if(a.esp === 'peixe') return [m.x - n / 2, -1.05, m.y - n / 2];
  return [m.x - n / 2, Math.max(alturaChao(m.x, m.y), AQUATICOS[a.esp] ? -.7 : -1), m.y - n / 2];
}
function cliqueRealista(e){
  const r3 = R3, r = r3.cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top, v = new THREE.Vector3();
  let melhor = null, dist = 1e9;
  for(const [id, o] of r3.malhas){
    v.copy(o.mesh.position); v.y += o.alt * .45; v.project(r3.camera);
    const sx = (v.x + 1) / 2 * r.width, sy = (1 - v.y) / 2 * r.height, q = Math.hypot(sx - mx, sy - my);
    if(q < dist && q < Math.max(22, o.alt * 3)){ dist = q; melhor = id; }
  }
  if(melhor) ACT.verAnimal(melhor);
}
function desenhaRealista(tempoMs, dt){
  const r3 = iniciaRealista();
  if(!r3) return false;
  const base = $('#terrenoCv');
  if(!base) return true;
  if(!r3.cv.isConnected) base.parentNode.insertBefore(r3.cv, base);
  base.style.display = 'none';
  if(r3.cenarioN !== terrenoN) montaCenario();
  const w = r3.cv.clientWidth, h = r3.cv.clientHeight;
  if(w && (r3.w !== w || r3.h !== h || r3.prUsado !== r3.pr)){
    r3.w = w; r3.h = h; r3.prUsado = r3.pr;
    r3.renderer.setPixelRatio(r3.pr); r3.renderer.setSize(w, h, false);
    r3.camera.aspect = w / h; r3.camera.updateProjectionMatrix();
  }
  const lista = S.animais.slice(0, ANIMAIS_NA_TELA), vivos = new Set();
  const pisca = Math.floor(tempoMs / 500) % 2;
  for(const a of lista){
    const m = mundo.get(a.id);
    if(!m) continue;
    vivos.add(a.id);
    let o = r3.malhas.get(a.id);
    if(!o){
      const g = geometriaDe(a.esp), mesh = new THREE.Mesh(g, r3.material);
      mesh.castShadow = true; mesh.receiveShadow = true;
      const ic = new THREE.Sprite(materialIcone('coracao')); ic.visible = false; ic.scale.set(3.2, 3.2, 1);
      r3.scene.add(mesh, ic);
      o = {mesh, ic, alt: g.userData.altura, yaw: -m.dir * Math.PI / 2, fase: Math.random() * 6, ax: m.x, ay: m.y};
      r3.malhas.set(a.id, o);
    }
    const [X, Y, Z] = posDoAnimal(a, m), ddx = m.x - o.ax, ddy = m.y - o.ay, anda = Math.hypot(ddx, ddy) > 1e-3;
    o.ax = m.x; o.ay = m.y;
    if(anda){
      const alvo = -Math.atan2(ddy, ddx);
      let dif = alvo - o.yaw;
      while(dif > Math.PI) dif -= Math.PI * 2;
      while(dif < -Math.PI) dif += Math.PI * 2;
      o.yaw += dif * Math.min(1, dt * 8);
      o.fase += dt * 11;
    }
    const filhote = idadeDe(a) < IDADE_FERTIL ? .68 : 1, resp = 1 + Math.sin(tempoMs / 700 + o.fase) * .012;
    o.mesh.position.set(X, Y + (anda ? Math.abs(Math.sin(o.fase)) * .12 : 0), Z);
    o.mesh.rotation.y = o.yaw;
    o.mesh.scale.set(filhote, filhote * resp, filhote);
    if(o.mesh.morphTargetInfluences) o.mesh.morphTargetInfluences[0] = anda ? Math.sin(o.fase) : 0;
    const c = casalDe(a.id);
    let nome = '';
    if(c && a.id === c.f && c.fase !== 'pronto') nome = 'coracao';
    else if(ESP[a.esp].caca && m.alvo) nome = 'alerta';
    else if(humores[a.esp] >= 40) nome = 'chuva';
    o.ic.visible = !!nome && !!pisca;
    if(o.ic.visible){ o.ic.material = materialIcone(nome); o.ic.position.set(X, Y + o.alt * filhote + 2.2, Z); }
  }
  for(const [id, o] of r3.malhas) if(!vivos.has(id)){ r3.scene.remove(o.mesh, o.ic); r3.malhas.delete(id); }
  // caveiras dos que foram comidos
  for(const e of efeitos) if(!e.spr){
    e.spr = new THREE.Sprite(materialIcone('caveira')); e.spr.scale.set(3.4, 3.4, 1);
    r3.scene.add(e.spr);
  }
  for(const e of r3.efeitos) if(e.t <= 0) r3.scene.remove(e.spr);
  r3.efeitos = efeitos.filter(e => e.spr);
  for(const e of r3.efeitos) e.spr.position.set(e.x - terrenoN / 2, 3 + (3 - e.t) * 1.4, e.y - terrenoN / 2);
  if(r3.ondas){ r3.ondas.offset.x = tempoMs * .00002; r3.ondas.offset.y = tempoMs * .000013; }
  const ini = performance.now();
  r3.renderer.render(r3.scene, r3.camera);
  // aparelho lento: baixa a resolução, sem nunca passar de 1 pixel por ponto da tela
  r3.custo += dt; r3.nQuadros++;
  if(r3.nQuadros >= 45){
    if(r3.custo / r3.nQuadros > .05 && r3.pr > 1) r3.pr = Math.max(1, r3.pr - .25);
    r3.custo = 0; r3.nQuadros = 0;
  }
  return performance.now() >= ini;
}

'use client';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/** связь страницы со сценой: лоадер ждёт ready, после лоадера started запускает влёт шаров */
export type Control = { started: boolean; progress: number; ready: boolean };

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (a: number, b: number, x: number) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type Pal = { pastel: THREE.Color; light: THREE.Color; medium: THREE.Color; deep: THREE.Color; glass: THREE.Color };
const C = (h: string) => new THREE.Color(h);
/** палитры эталона: пять ролей цвета на базовый оттенок шаров */
export function paletteFor(base: string): Pal {
  const hex = base.toLowerCase();
  if (hex === '#e1fc03') return { pastel: C('#FBFFE2'), light: C('#EFFE69'), medium: C('#E1FC03'), deep: C('#B1E200'), glass: C('#DCFF32') };
  if (hex === '#ffc5c2' || hex === '#ffa19e') return { pastel: C('#FFF5F4'), light: C('#FFECEB'), medium: C('#FFA6B3'), deep: C('#FF4D6D'), glass: C('#FFA6B3') };
  if (hex === '#96e5ff') return { pastel: C('#F0F9FF'), light: C('#C9F1FF'), medium: C('#96E5FF'), deep: C('#2BA5FF'), glass: C('#98E4FF') };
  if (hex === '#2f69ff') return { pastel: C('#ECEFFF'), light: C('#A8C1FF'), medium: C('#2F69FF'), deep: C('#0A33BF'), glass: C('#4D80FF') };
  const c = C(base);
  return { pastel: c.clone().offsetHSL(0, -0.15, 0.25), light: c.clone().offsetHSL(0, -0.05, 0.12), medium: c.clone(), deep: c.clone().offsetHSL(0.01, 0.1, -0.12), glass: c.clone() };
}
const ROLES = ['pastel', 'light', 'medium', 'deep', 'glass'] as const;
type Role = (typeof ROLES)[number];

type Ball = { id: number; radius: number; mass: number; pos: THREE.Vector3; vel: THREE.Vector3; prev: THREE.Vector3; quat: THREE.Quaternion; role: Role; isGlass: boolean; visual: number; fade: number; shape: THREE.Vector3; slot: number };

function makeBalls(count: number): Ball[] {
  const out: Ball[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random(); let radius = 0.33;
    if (r < 0.3) radius = 0.27 + Math.random() * 0.12; else if (r < 0.8) radius = 0.42 + Math.random() * 0.18; else radius = 0.66 + Math.random() * 0.21;
    const isGlass = Math.random() < 0.22;
    let role: Role = 'glass';
    if (!isGlass) { const c = Math.random(); role = c < 0.25 ? 'pastel' : c < 0.55 ? 'light' : c < 0.85 ? 'medium' : 'deep'; }
    out.push({ id: i, radius, mass: radius ** 3, pos: new THREE.Vector3(), vel: new THREE.Vector3(), prev: new THREE.Vector3(), quat: new THREE.Quaternion(), role, isGlass, visual: radius, fade: 1, shape: new THREE.Vector3(), slot: 0 });
  }
  return out;
}

const params = { rebound: -0.3, mouseRepelForce: 0.05, mouseRepelRadius: 4.4, damping: 0.91, centerAttractForce: 0.0035, bounciness: 0.02 };
const inHeart = (x: number, y: number) => { const a = x * x + y * y - 1; return a * a * a - x * x * y * y * y <= 0; };
const MAX_DIAM = 1.8;

function Sim({ ballColor, control, mobile, reduce }: { ballColor: string; control: MutableRefObject<Control>; mobile: boolean; reduce: boolean }) {
  const { camera, size } = useThree();
  const count = reduce ? 40 : mobile ? 54 : 96;
  const balls = useMemo(() => makeBalls(count), [count]);
  const matte = useMemo(() => balls.filter((b) => !b.isGlass), [balls]);
  const glass = useMemo(() => balls.filter((b) => b.isGlass), [balls]);
  useMemo(() => { matte.forEach((b, i) => { b.slot = i; }); glass.forEach((b, i) => { b.slot = i; }); }, [matte, glass]);
  const geo = useMemo(() => new THREE.SphereGeometry(1, 48, 48), []);
  const palHero = useMemo(() => paletteFor(ballColor), [ballColor]);
  const palLime = useMemo(() => paletteFor('#E1FC03'), []);
  const palPink = useMemo(() => paletteFor('#FFC5C2'), []);
  const cur = useMemo<Pal>(() => ({ pastel: new THREE.Color(), light: new THREE.Color(), medium: new THREE.Color(), deep: new THREE.Color(), glass: new THREE.Color() }), []);
  /* два материала на все шары: матовый и стеклянный; цвет каждого шара — цвет инстанса */
  const matteMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.44, metalness: 0, clearcoat: 0.24, clearcoatRoughness: 0.35, emissive: palHero.medium.clone(), emissiveIntensity: 0.06 }), [palHero]);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, transmission: 0.95, ior: 1.485, thickness: 2.2, specularColor: new THREE.Color('#ffffff'), specularIntensity: 1, attenuationColor: palHero.pastel.clone(), attenuationDistance: 1, emissive: palHero.glass.clone(), emissiveIntensity: 0.12, transparent: true }), [palHero]);
  const matteRef = useRef<THREE.InstancedMesh>(null);
  const glassRef = useRef<THREE.InstancedMesh>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const S = useRef({ vw: 10, vh: 6, shapeScale: 1, meanR: 0, localStarted: false, entranceStart: 0, reported: false, acc: 0, smooth: 0, stage: -1, mouse: { x: 99, y: 99, down: false }, mouseWorld: new THREE.Vector3(), prevMouse: new THREE.Vector3(), mouseSpeed: 0, order: [] as number[] }).current;
  const tmp = useRef({ m: new THREE.Matrix4(), s: new THREE.Vector3(), d: new THREE.Vector3(), c: new THREE.Vector3(), rv: new THREE.Vector3(), dp: new THREE.Vector3(), ax: new THREE.Vector3(), q: new THREE.Quaternion(), proj: new THREE.Vector3() }).current;

  const assignHeart = () => {
    const Sz = Math.min(S.vw * 0.3, S.vh * 0.34); const baseCY = -S.vh * 0.03;
    /* радиус шара в фигуре — из площади сердца (≈3·S²) и числа шаров, иначе силуэт сливается в ком */
    const rT = Math.sqrt((3 * Sz * Sz * 0.78) / (Math.PI * balls.length));
    S.shapeScale = Math.max(0.3, Math.min(1, rT / S.meanR));
    for (const b of balls) {
      let x = 0, y = 0, tries = 0;
      do { x = (Math.random() * 2 - 1) * 1.25; y = Math.random() * 2.55 - 1.4; tries++; } while (!inHeart(x, y) && tries < 60);
      b.shape.set(x * Sz, (y + 0.12) * Sz + baseCY, (Math.random() - 0.5) * 0.35);
    }
  };
  const scatterFar = (withVel: boolean) => {
    const R = Math.max(S.vw, S.vh) * 1.5;
    for (const b of balls) {
      const a = Math.random() * Math.PI * 2; const px = Math.cos(a) * R * 1.25, py = Math.sin(a) * R * 0.85, pz = (Math.random() - 0.5) * 4;
      b.pos.set(px, py, pz); b.prev.copy(b.pos);
      if (withVel) b.vel.set(-px, -py, -pz).normalize().multiplyScalar(0.08 + Math.random() * 0.05); else b.vel.set(0, 0, 0);
    }
  };

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    S.vh = 2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * cam.position.z; S.vw = S.vh * (size.width / size.height);
    S.meanR = balls.reduce((a, b) => a + b.radius, 0) / balls.length;
    assignHeart();
    if (!S.localStarted) scatterFar(false);
    S.order = balls.map((_, i) => i);
  }, [size.width, size.height, balls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const mv = (e: PointerEvent) => { S.mouse.x = (e.clientX / window.innerWidth) * 2 - 1; S.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1; };
    const dn = () => { S.mouse.down = true; }; const up = () => { S.mouse.down = false; };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerdown', dn); window.addEventListener('pointerup', up);
    return () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerdown', dn); window.removeEventListener('pointerup', up); };
  }, [S]);

  /** один шаг физики (в единицах кадра при 60 Гц) — формулы эталона */
  const step = (time: number) => {
    const progress = S.smooth;
    tmp.proj.set(S.mouse.x, S.mouse.y, 0.5).unproject(camera);
    const dir = tmp.proj.sub(camera.position).normalize();
    S.mouseWorld.copy(camera.position).add(dir.multiplyScalar(-camera.position.z / dir.z));

    const heroF = 1 - smoothstep(0.3, 0.8, progress);
    const dropRaw = smoothstep(0.4, 0.95, progress);
    const flyF = smoothstep(2.7, 3.45, progress);
    const shapeF = smoothstep(1.4, 2.05, progress) * (1 - smoothstep(2.55, 3.0, progress));
    const dropF = dropRaw * (1 - smoothstep(1.25, 1.75, progress));
    const bLime = smoothstep(0.55, 1.05, progress), bPink = smoothstep(1.4, 1.95, progress);
    for (const r of ROLES) cur[r].copy(palHero[r]).lerp(palLime[r], bLime).lerp(palPink[r], bPink);

    const entranceT = easeOutCubic(clamp01((time - S.entranceStart) / 2.2));
    const attractionBoost = lerp(7.5, 1, entranceT);
    const interacting = Math.abs(S.mouse.x) < 0.99 || Math.abs(S.mouse.y) < 0.99;
    S.mouseSpeed = interacting ? Math.min(S.mouseWorld.distanceTo(S.prevMouse), 3) : 0; S.prevMouse.copy(S.mouseWorld);
    let damping = lerp(params.damping, 0.992, dropF); damping = lerp(damping, 0.9, shapeF); damping = lerp(damping, 0.985, flyF);
    const camZ = camera.position.z; const clusterActive = Math.max(heroF, entranceT < 1 ? 1 : 0);

    for (const b of balls) {
      if (heroF > 0.01 && !reduce) { b.vel.x += Math.sin(time * 0.4 + b.id * 1.5) * 0.0004 * b.radius * heroF; b.vel.y += Math.cos(time * 0.5 + b.id * 1.2) * 0.0004 * b.radius * heroF; b.vel.z += Math.sin(time * 0.35 + b.id) * 0.0001 * heroF; }
      const cs = params.centerAttractForce * attractionBoost * clusterActive;
      if (cs > 0.00001) { b.vel.x += -b.pos.x * cs * 0.38; b.vel.y += -b.pos.y * cs * 1.85; b.vel.z += -b.pos.z * cs * 1.8; }
      if (dropF > 0.001) b.vel.y -= 0.011 * dropF;
      if (shapeF > 0.001) { const k = 0.06 * shapeF; b.vel.x += (b.shape.x - b.pos.x) * k; b.vel.y += (b.shape.y - b.pos.y) * k; b.vel.z += (b.shape.z - b.pos.z) * k; }
      if (flyF > 0.001) { const st = (b.id * 0.6180339887) % 1; const local = smoothstep(st * 0.55, st * 0.55 + 0.45, flyF); b.vel.z += 0.05 * local; b.vel.x += b.pos.x * 0.006 * local; b.vel.y += b.pos.y * 0.006 * local; }
      if (interacting) {
        tmp.d.subVectors(b.pos, S.mouseWorld); const raw = tmp.d.length();
        const R = S.mouse.down ? params.mouseRepelRadius * 1.4 : params.mouseRepelRadius; const F = S.mouse.down ? params.mouseRepelForce * 1.7 : params.mouseRepelForce;
        if (raw < R && raw > 0.0001) { const ratio = raw / R; const sf = 1 - ratio * ratio * (3 - 2 * ratio); const push = sf * F * (1 + S.mouseSpeed * 3.2); tmp.d.normalize(); tmp.d.z *= 0.12; tmp.d.normalize(); b.vel.addScaledVector(tmp.d, push); }
      }
      b.vel.multiplyScalar(damping); b.pos.addScaledVector(b.vel, 1);
      b.fade = flyF > 0.001 ? 1 - smoothstep(camZ - 2.6, camZ - 0.3, b.pos.z) : 1;
      const tv = b.radius * (1 - (1 - S.shapeScale) * shapeF); b.visual += (tv - b.visual) * 0.12;
    }

    /* коллизии: сортировка по x и проход только по соседям вместо полного перебора пар */
    const collideScale = 0.28 * (1 - 0.93 * shapeF) * (1 - flyF); const order = S.order; const n = balls.length;
    for (let s = 0; s < 4; s++) {
      for (let a = 1; a < n; a++) { const v = order[a]; const x = balls[v].pos.x; let k = a - 1; while (k >= 0 && balls[order[k]].pos.x > x) { order[k + 1] = order[k]; k--; } order[k + 1] = v; }
      for (let a = 0; a < n; a++) {
        const b1 = balls[order[a]];
        for (let c = a + 1; c < n; c++) {
          const b2 = balls[order[c]]; if (b2.pos.x - b1.pos.x > MAX_DIAM) break;
          tmp.c.subVectors(b2.pos, b1.pos); const dist = tmp.c.length(); const minD = b1.visual + b2.visual;
          if (dist < minD && dist > 0.001) {
            const overlap = minD - dist; tmp.c.multiplyScalar(1 / dist); const tm = b1.mass + b2.mass;
            b1.pos.addScaledVector(tmp.c, -overlap * (b2.mass / tm) * collideScale); b2.pos.addScaledVector(tmp.c, overlap * (b1.mass / tm) * collideScale);
            tmp.rv.subVectors(b2.vel, b1.vel); const vn = tmp.rv.dot(tmp.c);
            if (vn < -0.0001) { const imp = (-(1 + params.bounciness) * vn) / (1 / b1.mass + 1 / b2.mass); b1.vel.addScaledVector(tmp.c, -imp / b1.mass); b2.vel.addScaledVector(tmp.c, imp / b2.mass); }
          }
        }
      }
    }

    const xB = S.vw / 2 - 0.2, topY = S.vh / 2 - 0.05, floorY = -S.vh / 2 + 0.05, zB = 2; const rest = 0.3 + 0.35 * dropF;
    const contain = flyF < 0.5, zContain = flyF < 0.02;
    for (const b of balls) {
      const r = b.visual;
      if (contain) {
        if (b.pos.x < -xB - r) { b.pos.x = -xB - r; b.vel.x *= params.rebound; } else if (b.pos.x > xB + r) { b.pos.x = xB + r; b.vel.x *= params.rebound; }
        if (b.pos.y - r < floorY) { b.pos.y = floorY + r; if (b.vel.y < 0) b.vel.y = -b.vel.y * rest; if (dropF > 0.3) { b.vel.x *= 0.86; b.vel.z *= 0.86; } }
        if (b.pos.y + r > topY) { b.pos.y = topY - r; if (b.vel.y > 0) b.vel.y *= params.rebound; }
      }
      if (zContain) { if (b.pos.z < -zB) { b.pos.z = -zB; b.vel.z *= params.rebound; } else if (b.pos.z > zB) { b.pos.z = zB; b.vel.z *= params.rebound; } }
      tmp.dp.copy(b.pos).sub(b.prev);
      if (tmp.dp.lengthSq() > 0.000001) { tmp.ax.set(tmp.dp.y, -tmp.dp.x, 0).normalize(); tmp.q.setFromAxisAngle(tmp.ax, (tmp.dp.length() / b.radius) * 0.95); b.quat.premultiply(tmp.q); }
      b.prev.copy(b.pos);
    }
    if (hemi.current) hemi.current.groundColor.copy(cur.medium);
    matteMat.emissive.copy(cur.medium); glassMat.emissive.copy(cur.glass); glassMat.attenuationColor.copy(cur.pastel);
    const stage = progress > 1.55 ? 2 : progress > 0.7 ? 1 : 0;
    if (stage !== S.stage) { S.stage = stage; const el = document.getElementById('bg'); if (el) el.dataset.stage = String(stage); }
  };

  const write = (mesh: THREE.InstancedMesh | null, list: Ball[]) => {
    if (!mesh) return;
    for (const b of list) { tmp.s.setScalar(Math.max(b.visual * b.fade, 0.0001)); tmp.m.compose(b.pos, b.quat, tmp.s); mesh.setMatrixAt(b.slot, tmp.m); mesh.setColorAt(b.slot, b.isGlass ? cur.glass : cur[b.role]); }
    mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    if (control.current.started && !S.localStarted) { S.localStarted = true; S.entranceStart = t; scatterFar(true); }
    if (!S.reported) { S.reported = true; control.current.ready = true; }
    if (!S.localStarted) { write(matteRef.current, matte); write(glassRef.current, glass); return; }
    const target = window.scrollY / (window.innerHeight || 1);
    S.acc += Math.min(delta, 0.1); let n = 0;
    while (S.acc >= 1 / 60 && n < 3) { S.smooth += (target - S.smooth) * 0.09; control.current.progress = S.smooth; step(t); S.acc -= 1 / 60; n++; }
    if (S.acc >= 1 / 60) S.acc = 0;
    write(matteRef.current, matte); write(glassRef.current, glass);
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', palHero.medium, 1.6]} />
      <directionalLight position={[-6, 10, 8]} intensity={1.4} castShadow shadow-mapSize={mobile ? [1024, 1024] : [2048, 2048]} shadow-camera-near={0.5} shadow-camera-far={30} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-bias={-0.0003} shadow-radius={12} />
      <directionalLight position={[8, 7, -8]} intensity={1.25} />
      <directionalLight position={[0, 0, 11]} intensity={0.4} />
      <directionalLight position={[-9, -2, 4]} intensity={0.3} />
      <instancedMesh ref={matteRef} args={[geo, matteMat, matte.length]} castShadow receiveShadow frustumCulled={false} />
      <instancedMesh ref={glassRef} args={[geo, glassMat, Math.max(glass.length, 1)]} castShadow receiveShadow frustumCulled={false} />
    </>
  );
}

export default function Field({ ballColor, control }: { ballColor: string; control: MutableRefObject<Control> }) {
  const mobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <Canvas shadows="soft" dpr={[1, mobile ? 1.5 : 2]} camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0, 11] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      style={{ position: 'absolute', inset: 0 }}>
      <Sim ballColor={ballColor} control={control} mobile={mobile} reduce={reduce} />
    </Canvas>
  );
}

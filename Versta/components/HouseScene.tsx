'use client';
import { Suspense, useMemo, useRef, useEffect, useState, type MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { base } from '@/lib/base';

/**
 * Дом из клеёного бруса, который разбирается на слои при скролле — как пазл, поэтапно.
 * У каждого слоя своё окно прогресса: сначала уходит кровля, потом стены (венцы веером),
 * потом терраса и фундамент. Активный слой — тот, о котором подпись слева — светится
 * тёплым эмиссивом и чуть увеличен, остальные приглушены.
 * Освещение — HDR Poly Haven (CC0). reduced-motion — дом стоит собранным без движения.
 */
export type SceneProps = { progress: MutableRefObject<number> };

const W = 3.2, D = 2.3, H = 0.17, GAP = 0.018, ROWS = 11, OVER = 0.3;
const RISE = 1.05, EAVE = 0.55;
const WOOD = '#B98A57', WOOD_DARK = '#9E7346', ROOF = '#2A2623', RIDGE = '#3D3631', FRAME = '#2A2623', DECK = '#C7A377', POST = '#8C6A43', PILE = '#6E6A63', GRILLAGE = '#8A857C';

/** окна прогресса, в которых слой уходит вверх, и итоговый подъём */
export const WINDOWS = {
  roof:  { from: 0.04, to: 0.36, lift: 3.4 },
  walls: { from: 0.34, to: 0.66, lift: 1.7 },
  deck:  { from: 0.64, to: 0.84, lift: 0.7 },
  found: { from: 0.64, to: 1.0,  lift: 0.0 },
};
/** после этой отметки прогресса ничего не движется: слои встали, камера и поворот замирают */
const MOTION_END = 0.84;
const motion = (p: number) => Math.min(p / MOTION_END, 1);
type LayerKey = keyof typeof WINDOWS;
const ORDER: LayerKey[] = ['roof', 'walls', 'deck', 'found'];
const ease = (t: number) => 1 - Math.pow(1 - THREE.MathUtils.clamp(t, 0, 1), 3);
const win = (k: LayerKey, p: number) => ease((p - WINDOWS[k].from) / (WINDOWS[k].to - WINDOWS[k].from));
/** какой слой «в фокусе» при данном прогрессе; -1 — собранный дом */
export function focusAt(p: number): number {
  if (p < 0.04) return -1;
  if (p < 0.34) return 0;
  if (p < 0.64) return 1;
  return 3; // терраса и фундамент подсвечиваются вместе
}

type Beam = { p: [number, number, number]; s: [number, number, number]; d: number; dark?: boolean; fan?: number };

function Course({ b, built, progress, layer }: { b: Beam; built: MutableRefObject<number>; progress: MutableRefObject<number>; layer: LayerKey }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current; if (!m) return;
    const t = THREE.MathUtils.clamp((built.current - b.d) / 0.5, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    // веер: при разборке стен верхние венцы уходят чуть выше нижних
    const fan = (b.fan ?? 0) * win(layer, progress.current);
    m.position.y = b.p[1] + (1 - e) * 1.2 + fan;
    (m.material as THREE.MeshStandardMaterial).opacity = e;
    m.visible = t > 0;
  });
  return (
    <mesh ref={ref} position={b.p} castShadow receiveShadow>
      <boxGeometry args={b.s} />
      <meshStandardMaterial color={b.dark ? WOOD_DARK : WOOD} roughness={0.72} envMapIntensity={0.7} transparent emissive="#E8B56B" emissiveIntensity={0} />
    </mesh>
  );
}

function Opening({ x, y, z, w, h, rot = 0 }: { x: number; y: number; z: number; w: number; h: number; rot?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[w, h]} />
        <meshPhysicalMaterial color="#9FB4BC" roughness={0.08} metalness={0} transmission={0.55} thickness={0.15} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0, 0.006]}><planeGeometry args={[w + 0.08, h + 0.08]} /><meshStandardMaterial color={FRAME} roughness={0.6} /></mesh>
    </group>
  );
}

/** слой: подъём по своему окну прогресса + подсветка, когда о нём идёт речь */
function Layer({ k, index, progress, children }: { k: LayerKey; index: number; progress: MutableRefObject<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const glow = useRef(0);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  useEffect(() => {
    const list: THREE.MeshStandardMaterial[] = [];
    ref.current?.traverse((o) => { const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial; if (m && 'emissive' in m) list.push(m); });
    mats.current = list;
  }, []);
  useFrame((_, dt) => {
    const g = ref.current; if (!g) return;
    const p = progress.current;
    const targetY = WINDOWS[k].lift * win(k, p);
    g.position.y += (targetY - g.position.y) * Math.min(1, dt * 5);
    const f = focusAt(p);
    const active = f === index || (f === 3 && (index === 2 || index === 3));
    const dimmed = f >= 0 && !active;
    glow.current += ((active ? 1 : 0) - glow.current) * Math.min(1, dt * 5);
    const s = 1 + glow.current * 0.025;
    g.scale.setScalar(s);
    for (const m of mats.current) {
      m.emissiveIntensity = glow.current * 0.32;
      const dim = dimmed ? 0.55 : 1;
      m.envMapIntensity = m.userData.env ?? (m.userData.env = m.envMapIntensity);
      m.envMapIntensity = m.userData.env * dim;
      if (!m.userData.c) m.userData.c = m.color.clone();
      m.color.copy(m.userData.c).multiplyScalar(dimmed ? 0.7 : 1);
    }
  });
  return <group ref={ref}>{children}</group>;
}

function House({ reduce, progress }: { reduce: boolean; progress: MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const built = useRef(reduce ? 99 : -0.3);
  const start = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => { start.current = performance.now(); }, []);
  useEffect(() => { if (reduce) built.current = 99; }, [reduce]);
  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => { pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }; };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce]);

  useFrame((state, dt) => {
    if (!reduce) built.current = (performance.now() - start.current) / 1000 - 0.3;
    const g = group.current; if (!g) return;
    const p = motion(progress.current);
    const idle = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.05;
    const ty = -0.55 + idle + p * 0.5 + (reduce ? 0 : pointer.current.x * 0.18);
    const tx = (reduce ? 0 : pointer.current.y * 0.04) + p * 0.14;
    const k = Math.min(1, dt * 4);
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
  });

  const wallTop = ROWS * (H + GAP);
  const walls = useMemo(() => {
    const out: Beam[] = [];
    for (let i = 0; i < ROWS; i++) {
      const y = i * (H + GAP) + H / 2, d = i * 0.075, long = i % 2 === 0, fan = i * 0.035;
      out.push({ p: [0, y, D / 2], s: [W + (long ? OVER : -H), H, H], d, fan });
      out.push({ p: [0, y, -D / 2], s: [W + (long ? OVER : -H), H, H], d: d + 0.02, fan });
      out.push({ p: [W / 2, y, 0], s: [H, H, D + (long ? -H : OVER)], d: d + 0.04, dark: true, fan });
      out.push({ p: [-W / 2, y, 0], s: [H, H, D + (long ? -H : OVER)], d: d + 0.06, dark: true, fan });
    }
    return out;
  }, []);
  const gables = useMemo(() => {
    const out: Beam[] = [];
    const rows = Math.floor(RISE / (H + GAP));
    for (let i = 0; i < rows; i++) {
      const y = wallTop + i * (H + GAP) + H / 2;
      const len = Math.max(W * (1 - (i + 0.5) / rows), 0.3);
      const d = ROWS * 0.075 + i * 0.07;
      out.push({ p: [0, y, D / 2], s: [len, H, H], d });
      out.push({ p: [0, y, -D / 2], s: [len, H, H], d: d + 0.02 });
    }
    return out;
  }, [wallTop]);

  const halfSpan = W / 2 + EAVE, pitch = Math.atan2(RISE, halfSpan), slab = Math.hypot(RISE, halfSpan) + 0.05, roofD = D + 0.9;
  const canopyY = wallTop + 0.02;            // навес террасы
  const postH = canopyY - 0.03 - 0.06;       // столбы — до низа навеса, не сквозь него

  return (
    <group ref={group} position={[-0.35, -0.6, 0]} scale={0.6}>
      <Layer k="found" index={3} progress={progress}>
        <mesh position={[0, -0.12, 0]} receiveShadow><boxGeometry args={[W + 0.2, 0.22, D + 0.2]} /><meshStandardMaterial color={GRILLAGE} roughness={0.95} emissive="#E8B56B" emissiveIntensity={0} /></mesh>
        {[[-W / 2, -D / 2], [W / 2, -D / 2], [-W / 2, D / 2], [W / 2, D / 2], [0, -D / 2], [0, D / 2], [-W / 2, 0], [W / 2, 0]].map(([x, z], i) => (
          <mesh key={i} position={[x, -0.6, z]}><boxGeometry args={[0.2, 0.75, 0.2]} /><meshStandardMaterial color={PILE} roughness={0.95} emissive="#E8B56B" emissiveIntensity={0} /></mesh>
        ))}
        <mesh position={[0.4, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[3.0, 48]} /><meshStandardMaterial color="#2A3A30" roughness={1} /></mesh>
      </Layer>

      <Layer k="deck" index={2} progress={progress}>
        <mesh position={[W / 2 + 0.85, 0.02, 0]} receiveShadow><boxGeometry args={[1.5, 0.08, D + 0.5]} /><meshStandardMaterial color={DECK} roughness={0.8} envMapIntensity={0.5} emissive="#E8B56B" emissiveIntensity={0} /></mesh>
        {[[W / 2 + 1.5, D / 2 + 0.15], [W / 2 + 1.5, -D / 2 - 0.15]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.06 + postH / 2, z]} castShadow><boxGeometry args={[0.12, postH, 0.12]} /><meshStandardMaterial color={POST} roughness={0.8} emissive="#E8B56B" emissiveIntensity={0} /></mesh>
        ))}
      </Layer>

      <Layer k="walls" index={1} progress={progress}>
        {walls.map((b, i) => <Course key={i} b={b} built={built} progress={progress} layer="walls" />)}
        <Opening x={-0.85} y={wallTop * 0.55} z={D / 2 + H / 2} w={0.78} h={0.9} />
        <Opening x={0.95} y={wallTop * 0.55} z={D / 2 + H / 2} w={0.78} h={0.9} />
        <Opening x={W / 2 + H / 2} y={wallTop * 0.48} z={0.35} w={0.7} h={1.7} rot={Math.PI / 2} />
      </Layer>

      <Layer k="roof" index={0} progress={progress}>
        {gables.map((b, i) => <Course key={'g' + i} b={b} built={built} progress={progress} layer="roof" />)}
        <Opening x={0} y={wallTop + RISE * 0.32} z={D / 2 + H / 2} w={1.0} h={0.42} />
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * halfSpan / 2, wallTop + RISE / 2 + 0.04, 0]} rotation={[0, 0, -s * pitch]} castShadow receiveShadow>
            <boxGeometry args={[slab, 0.075, roofD]} />
            <meshStandardMaterial color={ROOF} roughness={0.85} envMapIntensity={0.4} emissive="#8FA6B0" emissiveIntensity={0} />
          </mesh>
        ))}
        <mesh position={[0, wallTop + RISE + 0.06, 0]}><boxGeometry args={[0.16, 0.1, roofD + 0.02]} /><meshStandardMaterial color={RIDGE} roughness={0.8} emissive="#8FA6B0" emissiveIntensity={0} /></mesh>
        <mesh position={[W / 2 + 0.85, canopyY, 0]} castShadow><boxGeometry args={[1.7, 0.06, D + 0.6]} /><meshStandardMaterial color={ROOF} roughness={0.85} emissive="#8FA6B0" emissiveIntensity={0} /></mesh>
      </Layer>
    </group>
  );
}


/** камера следит за разборкой: отъезжает и поднимает точку взгляда, чтобы стопка слоёв оставалась в кадре целиком */
function CameraRig({ progress }: { progress: MutableRefObject<number> }) {
  const target = useRef(new THREE.Vector3(0, -0.15, 0));
  useFrame(({ camera }, dt) => {
    const p = motion(progress.current);
    const k = Math.min(1, dt * 3.5);
    const px = 6.8 + p * 2.4, py = 3.9 + p * 2.6, pz = 8.4 + p * 3.0;
    camera.position.x += (px - camera.position.x) * k;
    camera.position.y += (py - camera.position.y) * k;
    camera.position.z += (pz - camera.position.z) * k;
    const ty = -0.15 + p * 1.15;
    target.current.y += (ty - target.current.y) * k;
    camera.lookAt(target.current);
  });
  return null;
}

export default function HouseScene({ progress }: SceneProps) {
  const [reduce, setReduce] = useState(false);
  useEffect(() => { setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [6.8, 3.9, 8.4], fov: 25 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <CameraRig progress={progress} />
      <fog attach="fog" args={['#1C1915', 10, 24]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[-2.5, 6.5, 6.5]} intensity={1.7} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[5, 3, -5]} intensity={0.35} color="#cfe0d8" />
      <Suspense fallback={null}>
        <Environment files={`${base}/hdr/forest_slope_512.hdr`} environmentIntensity={0.55} />
      </Suspense>
      <Float speed={reduce ? 0 : 1.1} rotationIntensity={reduce ? 0 : 0.08} floatIntensity={reduce ? 0 : 0.25} floatingRange={[-0.04, 0.04]}>
        <House reduce={reduce} progress={progress} />
      </Float>
      {!reduce && <Sparkles count={40} scale={[7, 5, 7]} position={[0, 1.4, 0]} size={2.2} speed={0.25} opacity={0.35} color="#E6C58A" />}
      <ContactShadows position={[-0.3, -1.21, 0]} opacity={0.5} scale={12} blur={2.4} far={4} />
    </Canvas>
  );
}

'use client';
import { useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Процедурный дом из клеёного бруса на собственной площадке.
 * Никаких моделей и текстур: венцы, фронтоны из венцов, окна, дверь, терраса на столбах, кровля со свесами.
 * При загрузке дом собирается венец за венцом снизу вверх (объяснение: «домокомплект собирается на участке»),
 * затем медленно поворачивается за курсором. reduced-motion — дом стоит собранным, без движения.
 */

const W = 3.2, D = 2.3, H = 0.17, GAP = 0.018, ROWS = 11, OVER = 0.3;
const RISE = 1.05, EAVE = 0.55;
const WOOD = '#B98A57', WOOD_DARK = '#9E7346', ROOF = '#2A2623', RIDGE = '#3D3631', GLASS = '#8FA6B0', FRAME = '#2A2623', DECK = '#C7A377', POST = '#8C6A43';

type Beam = { p: [number, number, number]; s: [number, number, number]; d: number; dark?: boolean };

function Course({ b, built }: { b: Beam; built: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = ref.current; if (!m) return;
    const t = THREE.MathUtils.clamp((built.current - b.d) / 0.5, 0, 1);
    const e = 1 - Math.pow(1 - t, 3);
    m.position.y = b.p[1] + (1 - e) * 1.2;
    (m.material as THREE.MeshStandardMaterial).opacity = e;
    m.visible = t > 0;
  });
  return (
    <mesh ref={ref} position={b.p} castShadow receiveShadow>
      <boxGeometry args={b.s} />
      <meshStandardMaterial color={b.dark ? WOOD_DARK : WOOD} roughness={0.82} transparent />
    </mesh>
  );
}

function Opening({ x, y, z, w, h, rot = 0 }: { x: number; y: number; z: number; w: number; h: number; rot?: number }) {
  return (
    <group position={[x, y, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0, 0.012]}><planeGeometry args={[w, h]} /><meshStandardMaterial color={GLASS} roughness={0.15} metalness={0.3} /></mesh>
      <mesh position={[0, 0, 0.006]}><planeGeometry args={[w + 0.08, h + 0.08]} /><meshStandardMaterial color={FRAME} roughness={0.7} /></mesh>
    </group>
  );
}

function House({ reduce }: { reduce: boolean }) {
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
    const idle = reduce ? 0 : Math.sin(state.clock.elapsedTime * 0.25) * 0.06;
    const ty = -0.55 + idle + (reduce ? 0 : pointer.current.x * 0.22);
    const tx = reduce ? 0 : pointer.current.y * 0.04;
    const k = Math.min(1, dt * 4);
    g.rotation.y += (ty - g.rotation.y) * k;
    g.rotation.x += (tx - g.rotation.x) * k;
  });

  const wallTop = ROWS * (H + GAP);
  const beams = useMemo(() => {
    const out: Beam[] = [];
    for (let i = 0; i < ROWS; i++) {
      const y = i * (H + GAP) + H / 2, d = i * 0.075, long = i % 2 === 0;
      out.push({ p: [0, y, D / 2], s: [W + (long ? OVER : -H), H, H], d });
      out.push({ p: [0, y, -D / 2], s: [W + (long ? OVER : -H), H, H], d: d + 0.02 });
      out.push({ p: [W / 2, y, 0], s: [H, H, D + (long ? -H : OVER)], d: d + 0.04, dark: true });
      out.push({ p: [-W / 2, y, 0], s: [H, H, D + (long ? -H : OVER)], d: d + 0.06, dark: true });
    }
    // фронтоны из укорачивающихся венцов — как в настоящем доме из бруса
    const gableRows = Math.floor(RISE / (H + GAP));
    for (let i = 0; i < gableRows; i++) {
      const y = wallTop + i * (H + GAP) + H / 2;
      const len = W * (1 - (i + 0.5) / gableRows);
      const d = ROWS * 0.075 + i * 0.07;
      out.push({ p: [0, y, D / 2], s: [Math.max(len, 0.3), H, H], d });
      out.push({ p: [0, y, -D / 2], s: [Math.max(len, 0.3), H, H], d: d + 0.02 });
    }
    return out;
  }, [wallTop]);

  const halfSpan = W / 2 + EAVE, pitch = Math.atan2(RISE, halfSpan), slab = Math.hypot(RISE, halfSpan) + 0.05, roofD = D + 0.9;

  return (
    <group ref={group} position={[-0.35, -1.05, 0]} scale={0.6}>
      {beams.map((b, i) => <Course key={i} b={b} built={built} />)}

      {/* окна и дверь: фасад к камере (+Z) и торец (+X) */}
      <Opening x={-0.85} y={wallTop * 0.55} z={D / 2 + H / 2} w={0.78} h={0.9} />
      <Opening x={0.95} y={wallTop * 0.55} z={D / 2 + H / 2} w={0.78} h={0.9} />
      <Opening x={0} y={wallTop + RISE * 0.32} z={D / 2 + H / 2} w={1.0} h={0.42} />
      <Opening x={W / 2 + H / 2} y={wallTop * 0.48} z={0.35} w={0.7} h={1.7} rot={Math.PI / 2} />

      {/* кровля со свесами и конёк */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * halfSpan / 2, wallTop + RISE / 2 + 0.04, 0]} rotation={[0, 0, -s * pitch]} castShadow receiveShadow>
          <boxGeometry args={[slab, 0.075, roofD]} />
          <meshStandardMaterial color={ROOF} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, wallTop + RISE + 0.06, 0]}><boxGeometry args={[0.16, 0.1, roofD + 0.02]} /><meshStandardMaterial color={RIDGE} roughness={0.8} /></mesh>

      {/* терраса на столбах, с торца */}
      <mesh position={[W / 2 + 0.85, 0.02, 0]} receiveShadow><boxGeometry args={[1.5, 0.08, D + 0.5]} /><meshStandardMaterial color={DECK} roughness={0.85} /></mesh>
      {[[W / 2 + 1.5, D / 2 + 0.15], [W / 2 + 1.5, -D / 2 - 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, wallTop / 2 + 0.05, z]} castShadow><boxGeometry args={[0.12, wallTop + 0.1, 0.12]} /><meshStandardMaterial color={POST} roughness={0.8} /></mesh>
      ))}
      <mesh position={[W / 2 + 0.85, wallTop + 0.02, 0]} castShadow><boxGeometry args={[1.7, 0.06, D + 0.6]} /><meshStandardMaterial color={ROOF} roughness={0.9} /></mesh>

      {/* площадка */}
      <mesh position={[0.4, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[4.2, 48]} /><meshStandardMaterial color="#2A3A30" roughness={1} /></mesh>
    </group>
  );
}

export default function HouseScene() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => { setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches); }, []);
  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [6.8, 3.6, 8.4], fov: 24 }} gl={{ antialias: true, alpha: true }} style={{ background: 'transparent' }}>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#efe6d2', '#22302a', 0.55]} />
      <directionalLight position={[-2.5, 6.5, 6.5]} intensity={2.1} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} />
      <directionalLight position={[5, 3, -5]} intensity={0.45} color="#cfe0d8" />
      <House reduce={reduce} />
      <ContactShadows position={[-0.3, -1.06, 0]} opacity={0.5} scale={12} blur={2.4} far={4} />
    </Canvas>
  );
}

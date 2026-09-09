'use client';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { base } from '@/lib/base';
import { roasts, type RoastId } from '@/lib/coffee';

/** общее состояние между DOM и сценой: курсор, сглаженный курсор, оборот при смене обжарки */
export type Shared = { x: number; y: number; px: number; py: number; cx: number; cy: number; spin: number; reduce: boolean; mobile: boolean };
export type SceneApi = { switchRoast: (id: RoastId) => Promise<void> };

/** процедурное зерно: эллипсоид, уплощённая передняя грань, бороздка по центру */
function makeBean(): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(1, 128, 96);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x0 = pos.getX(i), y0 = pos.getY(i), z0 = pos.getZ(i);
    const front = THREE.MathUtils.smoothstep(z0, -0.15, 0.4);
    let z = z0 * 0.5;
    z -= front * z0 * 0.5 * 0.3;
    z -= Math.exp(-(x0 * x0) / 0.05) * (1 - 0.45 * y0 * y0) * front * 0.16;
    z += front * Math.exp(-((Math.abs(x0) - 0.3) ** 2) / 0.04) * 0.035;
    pos.setXYZ(i, x0 * 0.66, y0, z);
  }
  g.computeVertexNormals();
  return g;
}

/** лист кофейного дерева: плоский контур */
function makeLeaf(): THREE.BufferGeometry {
  const s = new THREE.Shape();
  s.moveTo(0, -1); s.quadraticCurveTo(0.6, -0.35, 0, 1); s.quadraticCurveTo(-0.6, -0.35, 0, -1);
  return new THREE.ShapeGeometry(s, 24);
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
type Sat = { pos: THREE.Vector3; base: THREE.Vector3; ndc: THREE.Vector2; rep: THREE.Vector2; rot: THREE.Euler; angle: number; scale: { v: number; base: number }; phase: number; dur: number; tint: number };

function Scene({ shared, api, roast }: { shared: MutableRefObject<Shared>; api: MutableRefObject<SceneApi | null>; roast: RoastId }) {
  const { camera, viewport, size } = useThree();
  const bean = useMemo(makeBean, []);
  const leaf = useMemo(makeLeaf, []);
  const R0 = roasts.find((r) => r.id === roast)!;
  const heroMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: R0.bean, roughness: R0.rough, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.45, sheen: 0.25, sheenColor: new THREE.Color('#E0B98A') }), [R0]);
  const satMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: R0.bean, roughness: R0.rough + 0.08, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.5 }), [R0]);
  const leafMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3E5A34', roughness: 0.85, side: THREE.DoubleSide, transparent: true, opacity: 0.55 }), []);
  const hero = useRef<THREE.Group>(null);
  const satRefs = useRef<(THREE.Mesh | null)[]>([]);
  const leafRefs = useRef<(THREE.Mesh | null)[]>([]);
  const switching = useRef(false);
  const count = shared.current.mobile ? 8 : 16;

  /** спутники: позиция в NDC вне центра, глубина от -2.5 до 1.6 */
  const place = (s: Sat) => {
    let u = 0, v = 0; const big = s.scale.base > 0.48;
    do { u = rnd(big ? -0.1 : -0.92, 0.92); v = rnd(-0.88, 0.88); } while (Math.hypot(u * 1.2, v) < 0.5);
    s.ndc.set(u, v); s.base.z = rnd(-2.6, 1.6);
    const vp = viewport.getCurrentViewport(camera, [0, 0, s.base.z]);
    s.base.x = (u * vp.width) / 2; s.base.y = (v * vp.height) / 2;
  };
  const sats = useMemo<Sat[]>(() => Array.from({ length: count }, (_, i) => {
    const big = i % 5 === 0;
    const s: Sat = { pos: new THREE.Vector3(), base: new THREE.Vector3(), ndc: new THREE.Vector2(), rep: new THREE.Vector2(), rot: new THREE.Euler(rnd(0, 6.28), rnd(0, 6.28), rnd(0, 6.28)), angle: rnd(0, 360),
      scale: { v: 0, base: big ? rnd(0.5, 0.66) : rnd(0.22, 0.42) }, phase: rnd(0, 6.28), dur: [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9], tint: rnd(0.85, 1.1) };
    place(s); s.scale.v = s.scale.base; s.pos.copy(s.base);
    return s;
  }), [count]); // eslint-disable-line react-hooks/exhaustive-deps

  const leaves = useMemo(() => Array.from({ length: shared.current.mobile ? 2 : 5 }, (_, i) => ({ x: rnd(-4.2, 4.2), y: rnd(-2.4, 2.4), z: rnd(-4, -2.6), s: rnd(0.55, 1.1), r: rnd(0, 6.28), i })), []); // eslint-disable-line react-hooks/exhaustive-deps

  /** смена обжарки: спутники схлопываются к центру, цвет меняется, разлёт на новые места */
  useEffect(() => {
    api.current = {
      switchRoast: (id) => new Promise((res) => {
        const R = roasts.find((r) => r.id === id)!;
        const c = new THREE.Color(R.bean);
        const recolor = () => {
          gsap.to(heroMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.4, ease: 'power2.out' });
          gsap.to(satMat.color, { r: c.r, g: c.g, b: c.b, duration: 0.4, ease: 'power2.out' });
          gsap.to(heroMat, { roughness: R.rough, duration: 0.4 }); gsap.to(satMat, { roughness: R.rough + 0.08, duration: 0.4 });
        };
        if (shared.current.reduce) { recolor(); res(); return; }
        switching.current = true;
        const tl = gsap.timeline({ onComplete: () => { switching.current = false; sats.forEach((s) => { s.rep.set(0, 0); s.pos.copy(s.base); }); res(); } });
        sats.forEach((s, i) => {
          tl.to(s.pos, { x: 0, y: 0, z: 0.9, duration: 0.5, ease: 'power2.in' }, i * 0.012);
          tl.to(s.scale, { v: 0.04, duration: 0.5, ease: 'power2.in' }, i * 0.012);
        });
        tl.add(recolor, 0.6);
        tl.add(() => sats.forEach(place), 0.82);
        sats.forEach((s, i) => {
          tl.to(s.pos, { x: () => s.base.x, y: () => s.base.y, z: () => s.base.z, duration: 0.9, ease: 'back.out(1.5)' }, 0.84 + i * 0.015);
          tl.to(s.scale, { v: s.scale.base, duration: 0.9, ease: 'back.out(1.5)' }, 0.84 + i * 0.015);
        });
      }),
    };
    return () => { api.current = null; };
  }, [api, sats, heroMat, satMat, shared]); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, dt) => {
    const sh = shared.current; const t = performance.now() * 0.001;
    sh.cx += (sh.x - sh.cx) * 0.05; sh.cy += (sh.y - sh.cy) * 0.05;
    const g = hero.current; const k = Math.min(1, viewport.width / 7.2);
    if (g) {
      g.scale.setScalar(1.32 * k);
      g.rotation.set(0.28 + sh.cy * 0.5 + Math.sin(t * 0.7) * 0.04, sh.cx * 0.9 + Math.sin(t * 0.5) * 0.12 + THREE.MathUtils.degToRad(sh.spin), -0.62);
      g.position.set(sh.cx * 0.25, 0.05 + Math.sin(t * 0.8) * 0.07, 0);
    }
    const pointerOff = sh.px < 0;
    sats.forEach((s, i) => {
      const m = satRefs.current[i]; if (!m) return;
      if (switching.current) { m.position.copy(s.pos); m.scale.setScalar(s.scale.v); m.rotation.copy(s.rot); m.rotation.z += dt * 0.6; return; }
      const vp = viewport.getCurrentViewport(camera, [0, 0, s.base.z]);
      let tx = 0, ty = 0, speed = 1;
      if (!pointerOff) {
        const pw = ((sh.px / size.width) * 2 - 1) * (vp.width / 2), ph = -((sh.py / size.height) * 2 - 1) * (vp.height / 2);
        const dx = pw - s.base.x, dy = ph - s.base.y; const d = Math.hypot(dx, dy); const Rr = vp.width * 0.26;
        if (d < Rr && d > 0.001) { const f = (Rr - d) / Rr; tx = (-dx / d) * f * vp.width * 0.16; ty = (-dy / d) * f * vp.width * 0.16; speed = 1 + f * 5; }
      }
      s.rep.x += (tx - s.rep.x) * 0.1; s.rep.y += (ty - s.rep.y) * 0.1; s.angle += 0.2 * speed * dt * 60;
      const ph2 = (t + i * 0.7) * ((Math.PI * 2) / s.dur);
      const par = 0.35 + (s.base.z + 2.6) * 0.16;
      m.position.set(s.base.x + s.rep.x + sh.cx * par, s.base.y + s.rep.y + Math.sin(ph2) * 0.14 - sh.cy * par * 0.6, s.base.z);
      m.rotation.set(s.rot.x + Math.cos(ph2) * 0.1, s.rot.y + THREE.MathUtils.degToRad(s.angle), s.rot.z);
      m.scale.setScalar(s.scale.v * Math.max(k, 0.7));
    });
    leaves.forEach((l, i) => {
      const m = leafRefs.current[i]; if (!m) return;
      const ph2 = (t + i * 1.2) * ((Math.PI * 2) / (10 + i * 2));
      m.position.set(l.x + Math.cos(ph2 * 0.5) * 0.25 - sh.cx * 0.3, l.y + Math.sin(ph2) * 0.3 - sh.cy * 0.2, l.z);
      m.rotation.set(0.3, Math.sin(ph2 * 0.3) * 0.4, l.r + Math.sin(ph2 * 0.3) * 0.25);
    });
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 5, 6]} intensity={2.4} color="#FFE4C4" />
      <directionalLight position={[-5, 2, -3]} intensity={1.3} color="#FFB877" />
      <Environment files={`${base}/hdr/forest_slope_512.hdr`} environmentIntensity={0.55} />
      <group ref={hero}><mesh geometry={bean} material={heroMat} /></group>
      {sats.map((s, i) => <mesh key={i} ref={(el) => { satRefs.current[i] = el; }} geometry={bean} material={satMat} />)}
      {leaves.map((l, i) => <mesh key={`l${i}`} ref={(el) => { leafRefs.current[i] = el; }} geometry={leaf} material={leafMat} scale={l.s} />)}
    </>
  );
}

export default function BeanScene({ shared, api, roast }: { shared: MutableRefObject<Shared>; api: MutableRefObject<SceneApi | null>; roast: RoastId }) {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 7], fov: 32 }} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <Scene shared={shared} api={api} roast={roast} />
    </Canvas>
  );
}

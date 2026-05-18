'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  Lightformer,
  ContactShadows,
  Grid,
  Center,
  Bounds,
  useBounds,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import { F16Model, type ViewMode } from './F16Model';

function Loader() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-af-blue/20 border-t-af-blue" />
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Loading airframe… {Math.round(progress)}%
        </p>
      </div>
    </Html>
  );
}

/** Re-fits the camera to the model whenever `fitKey` changes. */
function FitOnDemand({ fitKey }: { fitKey: number }) {
  const api = useBounds();
  useEffect(() => {
    api.refresh().clip().fit();
  }, [fitKey, api]);
  return null;
}

/** Restores camera + orbit target to the default 3/4 view on reset. */
function CameraReset({ resetKey }: { resetKey: number }) {
  const { camera, controls } = useThree();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    camera.position.set(6.5, 3.2, 8.5);
    const oc = controls as unknown as {
      target: THREE.Vector3;
      update: () => void;
    } | null;
    if (oc?.target) {
      oc.target.set(0, 0, 0);
      oc.update();
    }
  }, [resetKey, camera, controls]);
  return null;
}

export interface F16SceneProps {
  selectedId: string | null;
  hoveredId: string | null;
  isolate: boolean;
  explode: number;
  gearDown: boolean;
  viewMode: ViewMode;
  showLabels: boolean;
  autoRotate: boolean;
  resetKey: number;
  fitKey: number;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export default function F16Scene(props: F16SceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: [6.5, 3.2, 8.5], fov: 42, near: 0.1, far: 100 }}
    >
      {/* Light studio backdrop — matches the app's white/slate UI and keeps
          the metallic airframe readable. */}
      <color attach="background" args={['#eef2f8']} />
      <fog attach="fog" args={['#eef2f8', 40, 80]} />

      {/* Lighting rig — key / fill / rim + image-based environment. */}
      <hemisphereLight args={['#ffffff', '#c4cedd', 0.85]} />
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[8, 12, 6]}
        intensity={2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-12, 12, 12, -12, 0.1, 50]}
        />
      </directionalLight>
      <directionalLight position={[-9, 5, -7]} intensity={0.7} color="#7db4ff" />
      <pointLight position={[0, 4, -10]} intensity={0.6} color="#ffd9a0" />

      <Suspense fallback={<Loader />}>
        {/* No `observe` — it re-fits on every bbox change (incl. explode
            animation frames), overriding manual zoom. `fit` handles initial
            fit; `fitKey` triggers explicit re-fits via FitOnDemand. */}
        <Bounds fit clip margin={1.7}>
          <FitOnDemand fitKey={props.fitKey} />
          <F16Model
            selectedId={props.selectedId}
            hoveredId={props.hoveredId}
            isolate={props.isolate}
            explode={props.explode}
            gearDown={props.gearDown}
            viewMode={props.viewMode}
            showLabels={props.showLabels}
            onSelect={props.onSelect}
            onHover={props.onHover}
          />
        </Bounds>
        {/* Self-contained image-based lighting — no network fetch, so it
            works fully offline during a demo. Gives metallic PBR surfaces
            something to reflect. */}
        <Environment resolution={256}>
          <Lightformer
            intensity={2}
            position={[0, 5, -9]}
            scale={[12, 6, 1]}
            color="#bcd4ff"
          />
          <Lightformer
            intensity={1.4}
            position={[-7, 2, 6]}
            scale={[8, 8, 1]}
            color="#ffffff"
          />
          <Lightformer
            intensity={1}
            position={[7, -2, 5]}
            scale={[6, 6, 1]}
            color="#ffd9a0"
          />
          <Lightformer
            form="ring"
            intensity={1.2}
            position={[0, 8, 0]}
            scale={6}
            color="#ffffff"
          />
        </Environment>
      </Suspense>

      <ContactShadows
        position={[0, -2.4, 0]}
        opacity={0.35}
        scale={30}
        blur={2.8}
        far={9}
        color="#1e293b"
      />
      <Grid
        position={[0, -2.4, 0]}
        args={[40, 40]}
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#cbd5e1"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={34}
        fadeStrength={1.4}
        infiniteGrid
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={26}
        autoRotate={props.autoRotate}
        autoRotateSpeed={0.7}
        target={[0, 0, 0]}
      />
      <CameraReset resetKey={props.resetKey} />
    </Canvas>
  );
}

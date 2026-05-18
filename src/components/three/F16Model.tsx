'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useGLTF, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  F16_PARTS,
  PART_NODE_NAMES,
  partForNode,
  type F16Part,
} from '@/data/f16Parts';

const MODEL_URL = 'https://ho4j8cjjck6kspk6.public.blob.vercel-storage.com/f-16_fighting_falcon_-_fighter_jet_-_free.glb';
useGLTF.preload(MODEL_URL);

export type ViewMode = 'solid' | 'xray' | 'wireframe';

interface F16ModelProps {
  selectedId: string | null;
  hoveredId: string | null;
  isolate: boolean;
  explode: number;
  gearDown: boolean;
  viewMode: ViewMode;
  showLabels: boolean;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

interface PartGroup {
  part: F16Part;
  root: THREE.Object3D;
  basePosition: THREE.Vector3;
  meshes: THREE.Mesh[];
}

/** Walk up the parent chain until we hit a known part node name. */
function findPartRoot(obj: THREE.Object3D): THREE.Object3D | null {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (PART_NODE_NAMES.has(cur.name)) return cur;
    cur = cur.parent;
  }
  return null;
}

export function F16Model({
  selectedId,
  hoveredId,
  isolate,
  explode,
  gearDown,
  viewMode,
  showLabels,
  onSelect,
  onHover,
}: F16ModelProps) {
  const { scene } = useGLTF(MODEL_URL);

  // Deep clone so HMR / remounts never mutate the cached source scene, then
  // auto-normalise: GLB source units are arbitrary, so scale the whole model
  // to a fixed target size and re-centre it at the origin. This guarantees a
  // consistent on-screen size no matter what units the model was exported in.
  const model = useMemo(() => {
    const m = scene.clone(true);
    const box = new THREE.Box3().setFromObject(m);
    const size = box.isEmpty()
      ? new THREE.Vector3(1, 1, 1)
      : box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const TARGET = 5.5; // world units for the largest dimension
    const s = TARGET / maxDim;
    m.scale.setScalar(s);
    // Re-centre using the scaled bounding box.
    const scaledBox = new THREE.Box3().setFromObject(m);
    const center = scaledBox.getCenter(new THREE.Vector3());
    m.position.sub(center);
    return m;
  }, [scene]);

  // Build part groups, clone materials (so we can tint without touching cache),
  // tag meshes with their owning part id for raycasting.
  const groups = useMemo<PartGroup[]>(() => {
    const map = new Map<string, PartGroup>();

    model.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const root = findPartRoot(mesh);
      if (!root) return;
      const part = partForNode(root.name);
      if (!part) return;

      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const src = mesh.material as THREE.Material | THREE.Material[];
      mesh.material = Array.isArray(src)
        ? src.map((m) => m.clone())
        : src.clone();
      mesh.userData.partId = part.id;
      mesh.userData.baseColor = new Map<THREE.Material, THREE.Color>();

      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        const sm = m as THREE.MeshStandardMaterial;
        if (sm.color) {
          (mesh.userData.baseColor as Map<THREE.Material, THREE.Color>).set(
            m,
            sm.color.clone()
          );
        }
      });

      let g = map.get(part.id);
      if (!g) {
        g = {
          part,
          root,
          basePosition: root.position.clone(),
          meshes: [],
        };
        map.set(part.id, g);
      }
      g.meshes.push(mesh);
    });

    return F16_PARTS.map((p) => map.get(p.id)).filter(
      (g): g is PartGroup => Boolean(g)
    );
  }, [model]);

  // Smoothly animate the explode offset per part.
  // Divide by model scale so the world-space displacement is `dir * amt`
  // regardless of what auto-normalisation scale factor was applied.
  const explodeRef = useRef(0);
  useFrame(() => {
    explodeRef.current += (explode - explodeRef.current) * 0.15;
    const amt = explodeRef.current;
    const invS = 1 / (model.scale.x || 1);
    for (const g of groups) {
      const [ex, ey, ez] = g.part.explode;
      g.root.position.set(
        g.basePosition.x + ex * amt * invS,
        g.basePosition.y + ey * amt * invS,
        g.basePosition.z + ez * amt * invS
      );
    }
  });

  // Apply visibility, highlight tint and view-mode to every part each render.
  useEffect(() => {
    for (const g of groups) {
      const { id } = g.part;

      // Landing-gear state is mutually exclusive.
      let visible = true;
      if (id === 'gear-down' || id === 'lights') visible = gearDown;
      if (id === 'gear-up') visible = !gearDown;

      const isSel = selectedId === id;
      const isHov = hoveredId === id;
      const dimmed = isolate && selectedId !== null && !isSel;

      g.root.visible = visible;

      for (const mesh of g.meshes) {
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        const baseColors = mesh.userData.baseColor as Map<
          THREE.Material,
          THREE.Color
        >;

        for (const m of mats) {
          const sm = m as THREE.MeshStandardMaterial;

          sm.wireframe = viewMode === 'wireframe';

          // Reset base colour first.
          const bc = baseColors.get(m);
          if (bc && sm.color) sm.color.copy(bc);

          // Highlight tinting via emissive.
          if (sm.emissive) {
            if (isSel) {
              sm.emissive.set(g.part.accent);
              sm.emissiveIntensity = 0.55;
            } else if (isHov) {
              sm.emissive.set(g.part.accent);
              sm.emissiveIntensity = 0.25;
            } else {
              sm.emissive.set('#000000');
              sm.emissiveIntensity = 0;
            }
          }

          // Opacity: x-ray, dimmed-when-isolated, or solid.
          let opacity = 1;
          if (viewMode === 'xray') opacity = isSel ? 0.95 : 0.18;
          if (dimmed) opacity = Math.min(opacity, 0.06);

          sm.transparent = opacity < 1;
          sm.opacity = opacity;
          sm.depthWrite = opacity > 0.5;
          sm.needsUpdate = true;
        }
      }
    }
  }, [groups, selectedId, hoveredId, isolate, gearDown, viewMode]);

  return (
    <group
      dispose={null}
      onPointerMissed={() => onSelect(null)}
    >
      <primitive
        object={model}
        onClick={(e: any) => {
          e.stopPropagation();
          const pid = e.object?.userData?.partId as string | undefined;
          if (pid) onSelect(pid);
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          const pid = e.object?.userData?.partId as string | undefined;
          if (pid) {
            onHover(pid);
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e: any) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = 'auto';
        }}
      />

      {showLabels &&
        groups.map((g) => {
          if (g.part.id === 'gear-up' && gearDown) return null;
          if ((g.part.id === 'gear-down' || g.part.id === 'lights') && !gearDown)
            return null;
          const c = new THREE.Box3()
            .setFromObject(g.root)
            .getCenter(new THREE.Vector3());
          return (
            <Html
              key={g.part.id}
              position={[c.x, c.y, c.z]}
              center
              distanceFactor={5}
              zIndexRange={[20, 0]}
              // pointer-events:none on the wrapper so wheel events reach the
              // canvas (fixes zoom) and onPointerMissed isn't triggered by
              // clicks on these DOM labels (fixes info-panel clearing).
              style={{ pointerEvents: 'none' }}
            >
              <button
                onClick={() => onSelect(g.part.id)}
                onPointerOver={() => onHover(g.part.id)}
                onPointerOut={() => onHover(null)}
                className="whitespace-nowrap rounded-full border px-1.5 py-px text-[8px] font-bold uppercase tracking-widest shadow backdrop-blur-sm transition-all"
                style={{
                  pointerEvents: 'all',
                  borderColor: g.part.accent,
                  color: selectedId === g.part.id ? '#fff' : g.part.accent,
                  background:
                    selectedId === g.part.id
                      ? g.part.accent
                      : 'rgba(255,255,255,0.88)',
                }}
              >
                {g.part.label}
              </button>
            </Html>
          );
        })}
    </group>
  );
}

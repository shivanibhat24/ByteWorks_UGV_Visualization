"use client"

import { useEffect, useState } from "react"
import { Canvas, useLoader } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as THREE from "three"

type Marker = {
  id: number
  position: [number, number, number]
}

let markerStore: Marker[] = []
const markerSubscribers = new Set<(markers: Marker[]) => void>()

export function addMarker(x: number, y: number, z: number) {
  const marker: Marker = {
    id: Date.now() + Math.random(),
    position: [x, y, z],
  }
  markerStore = [...markerStore, marker]
  markerSubscribers.forEach((fn) => fn(markerStore))
}

function useMarkers() {
  const [markers, setMarkers] = useState<Marker[]>(markerStore)

  useEffect(() => {
    const listener = (next: Marker[]) => setMarkers(next)
    markerSubscribers.add(listener)
    return () => {
      markerSubscribers.delete(listener)
    }
  }, [])

  return markers
}

function DesertScene() {
  const gltf = useLoader(GLTFLoader, "/models/desert.glb")
  const markers = useMarkers()

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <primitive
        object={gltf.scene}
        position={[0, 0, 0]}
        scale={1}
      />

      {markers.map((m) => (
        <mesh
          key={m.id}
          position={m.position}
          castShadow
        >
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} />
        </mesh>
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.1}
        minDistance={5}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
      />
    </>
  )
}

export function DesertViewer() {
  return (
    <section className="relative w-full rounded-xl border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Desert Terrain
          </p>
          <p className="text-[11px] text-muted-foreground">
            Interactive 3D scene &nbsp;·&nbsp; GLB model
          </p>
        </div>
      </div>
      <div className="h-[360px] w-full rounded-lg bg-gradient-to-b from-background/30 to-background/70">
        <Canvas
          camera={{ position: [12, 14, 18], fov: 45 }}
          shadows
          dpr={[1, 2]}
        >
          <color attach="background" args={["#020617"]} />
          <DesertScene />
        </Canvas>
      </div>
    </section>
  )
}


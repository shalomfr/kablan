'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Line,
} from '@react-three/drei';
import * as THREE from 'three';
import { useBuilderStore } from '@/stores/builder-store';

// Wall component
function Wall({
  start,
  end,
  height,
  thickness,
  isSelected,
  onClick,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  height: number;
  thickness: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  return (
    <mesh
      position={[midX, height / 2, midY]}
      rotation={[0, -angle, 0]}
      onClick={onClick}
    >
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial
        color={isSelected ? '#06b6d4' : '#e5e5e5'}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

// Temporary wall being drawn
function TempWall({
  start,
  end,
  height,
  thickness,
}: {
  start: { x: number; y: number };
  end: { x: number; y: number };
  height: number;
  thickness: number;
}) {
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  if (length < 0.01) return null;

  return (
    <mesh position={[midX, height / 2, midY]} rotation={[0, -angle, 0]}>
      <boxGeometry args={[length, height, thickness]} />
      <meshStandardMaterial color="#06b6d4" transparent opacity={0.5} />
    </mesh>
  );
}

// Floor component
function Floor({ size = 20 }: { size?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#f5f5f5" roughness={0.9} metalness={0} />
    </mesh>
  );
}

// Grid helper
function BuilderGrid({ size = 20, divisions = 40 }: { size?: number; divisions?: number }) {
  const { showGrid } = useBuilderStore();

  if (!showGrid) return null;

  return (
    <Grid
      args={[size, size]}
      cellSize={0.5}
      cellThickness={0.5}
      cellColor="#6b7280"
      sectionSize={1}
      sectionThickness={1}
      sectionColor="#374151"
      fadeDistance={30}
      fadeStrength={1}
      followCamera={false}
      position={[0, 0.01, 0]}
    />
  );
}

// Dimension line
function DimensionLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
  const length = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
      Math.pow(end[1] - start[1], 2) +
      Math.pow(end[2] - start[2], 2)
  );

  return (
    <group>
      <Line
        points={[start, end]}
        color="#06b6d4"
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
    </group>
  );
}

// Camera controller for different view modes
function CameraController() {
  const { viewMode } = useBuilderStore();
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (viewMode === '2d' && camera.position.y !== 15) {
      camera.position.set(0, 15, 0);
      camera.lookAt(0, 0, 0);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={viewMode !== '2d'}
      enablePan={true}
      enableZoom={true}
      maxPolarAngle={viewMode === '2d' ? 0 : Math.PI / 2}
      minPolarAngle={viewMode === '2d' ? 0 : 0}
      target={[0, 0, 0]}
    />
  );
}

// Pointer interaction
function Pointer() {
  const { currentTool, isDrawingWall, wallStartPoint, tempWallEnd, snapToGrid, gridSize, startDrawingWall, updateTempWall, finishDrawingWall } = useBuilderStore();
  const planeRef = useRef<THREE.Mesh>(null);

  const handlePointerMove = (e: any) => {
    if (currentTool !== 'wall') return;
    
    const point = e.point;
    const snappedPoint = snapToGrid
      ? {
          x: Math.round(point.x / gridSize) * gridSize,
          y: Math.round(point.z / gridSize) * gridSize,
        }
      : { x: point.x, y: point.z };
    
    if (isDrawingWall) {
      updateTempWall(snappedPoint);
    }
  };

  const handlePointerDown = (e: any) => {
    if (currentTool !== 'wall') return;
    
    const point = e.point;
    const snappedPoint = snapToGrid
      ? {
          x: Math.round(point.x / gridSize) * gridSize,
          y: Math.round(point.z / gridSize) * gridSize,
        }
      : { x: point.x, y: point.z };
    
    if (!isDrawingWall) {
      startDrawingWall(snappedPoint);
    } else {
      finishDrawingWall();
    }
  };

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
    >
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

// Main scene
function SceneContent() {
  const {
    currentRoom,
    selectedWall,
    isDrawingWall,
    wallStartPoint,
    tempWallEnd,
    defaultWallHeight,
    defaultWallThickness,
    setSelectedWall,
  } = useBuilderStore();

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <hemisphereLight intensity={0.3} groundColor="#8d7c5f" />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[8, 8, 8]} fov={50} />
      <CameraController />

      {/* Environment */}
      <Environment preset="city" />

      {/* Floor */}
      <Floor />
      <BuilderGrid />

      {/* Shadows */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.3}
        scale={20}
        blur={1}
        far={10}
      />

      {/* Pointer interaction */}
      <Pointer />

      {/* Walls */}
      {currentRoom?.walls.map((wall) => (
        <Wall
          key={wall.id}
          start={wall.start}
          end={wall.end}
          height={wall.height}
          thickness={wall.thickness}
          isSelected={selectedWall === wall.id}
          onClick={() => setSelectedWall(wall.id)}
        />
      ))}

      {/* Temporary wall being drawn */}
      {isDrawingWall && wallStartPoint && tempWallEnd && (
        <TempWall
          start={wallStartPoint}
          end={tempWallEnd}
          height={defaultWallHeight}
          thickness={defaultWallThickness}
        />
      )}
    </>
  );
}

export function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
    >
      <SceneContent />
    </Canvas>
  );
}


'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  PerspectiveCamera,
  Environment,
  ContactShadows,
  Line,
  TransformControls,
  PointerLockControls,
  Text,
  Html,
  useTexture,
  AccumulativeShadows,
  RandomizedLight,
  BakeShadows,
  SoftShadows,
  useHelper,
} from '@react-three/drei';
import * as THREE from 'three';
import { useBuilderStore } from '@/stores/builder-store';
import { FLOOR_MATERIALS, WALL_MATERIALS, FURNITURE_MATERIALS, getMaterial } from '@/lib/3d/textures';
import type { Door3D as Door3DType, Window3D as Window3DType, Object3D as Object3DType, Wall3D } from '@/types';

// ============== ADVANCED MATERIALS ==============

// Create PBR material from config
function createMaterial(config: { color: string; roughness: number; metalness: number; normalScale?: number; envMapIntensity?: number }) {
  return (
    <meshStandardMaterial
      color={config.color}
      roughness={config.roughness}
      metalness={config.metalness}
      envMapIntensity={config.envMapIntensity || 1}
    />
  );
}

// ============== PROCEDURAL TEXTURES ==============

// Wood grain pattern
function useWoodMaterial(color: string, roughness: number = 0.6) {
  return useMemo(() => ({
    color,
    roughness,
    metalness: 0,
  }), [color, roughness]);
}

// ============== FLOOR WITH TEXTURE ==============

function RealisticFloor({
  size = 20,
  texture = 'default',
  position = [0, 0, 0] as [number, number, number]
}: {
  size?: number;
  texture?: string;
  position?: [number, number, number];
}) {
  const material = getMaterial('floor', texture);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
    >
      <planeGeometry args={[size, size, 32, 32]} />
      <meshStandardMaterial
        color={material.color}
        roughness={material.roughness}
        metalness={material.metalness}
        envMapIntensity={material.envMapIntensity || 1}
      />
    </mesh>
  );
}

// ============== WALL COMPONENT ==============

function Wall({
  wall,
  isSelected,
  isLocked,
  onClick,
  wallTexture,
}: {
  wall: Wall3D;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
  wallTexture: string;
}) {
  const { currentTool, addDoor, addWindow, currentRoom } = useBuilderStore();
  const material = getMaterial('wall', wallTexture);

  const length = Math.sqrt(
    Math.pow(wall.end.x - wall.start.x, 2) + Math.pow(wall.end.y - wall.start.y, 2)
  );
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);
  const midX = (wall.start.x + wall.end.x) / 2;
  const midY = (wall.start.y + wall.end.y) / 2;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();

    if (currentTool === 'door' && currentRoom) {
      const localPoint = e.point;

      const newDoor: Door3DType = {
        id: crypto.randomUUID(),
        type: 'standard',
        width: 0.9,
        height: 2.1,
        position: { x: localPoint.x, y: 0, z: localPoint.z },
        rotation: -angle * (180 / Math.PI),
        wallId: wall.id,
      };
      addDoor(newDoor);
    } else if (currentTool === 'window' && currentRoom) {
      const localPoint = e.point;

      const newWindow: Window3DType = {
        id: crypto.randomUUID(),
        type: 'double',
        width: 1.2,
        height: 1.0,
        position: { x: localPoint.x, y: 1.2, z: localPoint.z },
        rotation: -angle * (180 / Math.PI),
        glazing: 'double',
        wallId: wall.id,
      };
      addWindow(newWindow);
    } else if (onClick) {
      onClick(e);
    }
  };

  const color = isSelected ? '#06b6d4' : isLocked ? '#9CA3AF' : material.color;

  return (
    <group>
      <mesh
        position={[midX, wall.height / 2, midY]}
        rotation={[0, -angle, 0]}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[length, wall.height, wall.thickness]} />
        <meshStandardMaterial
          color={color}
          roughness={material.roughness}
          metalness={material.metalness}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Wall baseboard */}
      <mesh
        position={[midX, 0.05, midY]}
        rotation={[0, -angle, 0]}
        castShadow
      >
        <boxGeometry args={[length, 0.1, wall.thickness + 0.02]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.7} />
      </mesh>

      {/* Wall crown molding */}
      <mesh
        position={[midX, wall.height - 0.03, midY]}
        rotation={[0, -angle, 0]}
      >
        <boxGeometry args={[length, 0.06, wall.thickness + 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Wall measurement */}
      <WallMeasurement wall={wall} length={length} angle={angle} />
    </group>
  );
}

// Wall measurement display
function WallMeasurement({ wall, length, angle }: { wall: Wall3D; length: number; angle: number }) {
  const { showMeasurements } = useBuilderStore();

  if (!showMeasurements || length < 0.1) return null;

  const midX = (wall.start.x + wall.end.x) / 2;
  const midZ = (wall.start.y + wall.end.y) / 2;

  return (
    <Html
      position={[midX, wall.height + 0.3, midZ]}
      center
      style={{
        background: 'rgba(0, 0, 0, 0.85)',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {length.toFixed(2)} מ'
    </Html>
  );
}

// ============== REALISTIC DOOR COMPONENT ==============

function Door3DComponent({
  door,
  isSelected,
  isLocked,
  onClick,
}: {
  door: Door3DType;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  const frameThickness = 0.06;
  const frameDepth = 0.18;
  const doorThickness = 0.045;
  const panelInset = 0.015;

  const frameColor = isSelected ? '#06b6d4' : isLocked ? '#9CA3AF' : '#6B4423';
  const doorColor = isSelected ? '#0891b2' : isLocked ? '#6B7280' : '#8B5A2B';
  const panelColor = isSelected ? '#0e7490' : isLocked ? '#4B5563' : '#A0522D';

  return (
    <group
      position={[door.position.x, door.height / 2, door.position.z]}
      rotation={[0, (door.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Door frame - left */}
      <mesh position={[-door.width / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, door.height, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Door frame - right */}
      <mesh position={[door.width / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, door.height, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Door frame - top */}
      <mesh position={[0, door.height / 2 + frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[door.width + frameThickness * 2, frameThickness, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Main door panel */}
      <mesh position={[0, 0, 0.03]} castShadow>
        <boxGeometry args={[door.width - 0.02, door.height - 0.02, doorThickness]} />
        <meshStandardMaterial color={doorColor} roughness={0.55} />
      </mesh>

      {/* Door panels (decorative) */}
      {/* Top panel */}
      <mesh position={[0, door.height / 4 + 0.1, 0.055]} castShadow>
        <boxGeometry args={[door.width * 0.7, door.height * 0.3, 0.02]} />
        <meshStandardMaterial color={panelColor} roughness={0.6} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, -door.height / 4 + 0.05, 0.055]} castShadow>
        <boxGeometry args={[door.width * 0.7, door.height * 0.35, 0.02]} />
        <meshStandardMaterial color={panelColor} roughness={0.6} />
      </mesh>

      {/* Door handle backplate */}
      <mesh position={[door.width / 2 - 0.12, 0, 0.07]} castShadow>
        <boxGeometry args={[0.04, 0.12, 0.015]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Door handle */}
      <mesh position={[door.width / 2 - 0.12, 0, 0.09]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.1, 12]} />
        <meshStandardMaterial color="#D4D4D4" metalness={0.95} roughness={0.1} envMapIntensity={1.2} />
      </mesh>

      {/* Keyhole */}
      <mesh position={[door.width / 2 - 0.12, -0.08, 0.065]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.02, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Hinges */}
      {[door.height / 3, 0, -door.height / 3].map((y, i) => (
        <mesh key={i} position={[-door.width / 2 + 0.02, y, 0.03]} castShadow>
          <boxGeometry args={[0.03, 0.08, 0.015]} />
          <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// ============== REALISTIC WINDOW COMPONENT ==============

function Window3DComponent({
  window: win,
  isSelected,
  isLocked,
  onClick,
}: {
  window: Window3DType;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  const frameThickness = 0.05;
  const frameDepth = 0.12;
  const glassThickness = 0.012;
  const mullionWidth = 0.03;

  const frameColor = isSelected ? '#06b6d4' : isLocked ? '#9CA3AF' : '#f8f8f8';

  return (
    <group
      position={[win.position.x, win.position.y, win.position.z]}
      rotation={[0, (win.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Outer frame */}
      {/* Left frame */}
      <mesh position={[-win.width / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, win.height, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>

      {/* Right frame */}
      <mesh position={[win.width / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, win.height, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>

      {/* Top frame */}
      <mesh position={[0, win.height / 2 - frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[win.width, frameThickness, frameDepth]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>

      {/* Bottom frame (sill) */}
      <mesh position={[0, -win.height / 2 + frameThickness / 2, 0.02]} castShadow>
        <boxGeometry args={[win.width + 0.06, frameThickness * 1.5, frameDepth + 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.3} />
      </mesh>

      {/* Center mullion (vertical divider) */}
      {win.type === 'double' && (
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[mullionWidth, win.height - frameThickness * 2, frameDepth * 0.8]} />
          <meshStandardMaterial color={frameColor} roughness={0.25} />
        </mesh>
      )}

      {/* Horizontal mullion */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[win.width - frameThickness * 2, mullionWidth, frameDepth * 0.8]} />
        <meshStandardMaterial color={frameColor} roughness={0.25} />
      </mesh>

      {/* Glass panes */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[win.width - frameThickness * 2, win.height - frameThickness * 2, glassThickness]} />
        <meshStandardMaterial
          color="#E0F7FA"
          transparent
          opacity={0.25}
          roughness={0.02}
          metalness={0.1}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Glass reflection layer */}
      <mesh position={[0, 0, glassThickness / 2 + 0.001]}>
        <boxGeometry args={[win.width - frameThickness * 2 - 0.02, win.height - frameThickness * 2 - 0.02, 0.001]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={0}
          metalness={1}
        />
      </mesh>

      {/* Window handle */}
      <mesh position={[win.type === 'double' ? win.width / 4 : 0, 0, frameDepth / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ============== REALISTIC FURNITURE MODELS ==============

function ToiletModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#FAFAFA';
  const ceramicProps = { roughness: 0.15, metalness: 0.05, envMapIntensity: 0.8 };

  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.08, 0.05]} castShadow>
        <boxGeometry args={[0.35, 0.16, 0.45]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Bowl */}
      <mesh position={[0, 0.22, 0.12]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.28, 24]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Bowl inner */}
      <mesh position={[0, 0.28, 0.12]}>
        <cylinderGeometry args={[0.14, 0.12, 0.15, 24]} />
        <meshStandardMaterial color="#E8E8E8" {...ceramicProps} />
      </mesh>

      {/* Seat ring */}
      <mesh position={[0, 0.37, 0.12]} castShadow>
        <torusGeometry args={[0.16, 0.025, 12, 24]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Tank */}
      <mesh position={[0, 0.45, -0.14]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.16]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Tank lid */}
      <mesh position={[0, 0.68, -0.14]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.18]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Flush button */}
      <mesh position={[0, 0.71, -0.14]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function SinkModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#FAFAFA';
  const ceramicProps = { roughness: 0.12, metalness: 0.05, envMapIntensity: 0.9 };

  return (
    <group>
      {/* Basin */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.2, 0.18, 32]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Basin inner */}
      <mesh position={[0, 0.84, 0]}>
        <cylinderGeometry args={[0.21, 0.17, 0.14, 32]} />
        <meshStandardMaterial color="#E0E0E0" {...ceramicProps} />
      </mesh>

      {/* Pedestal */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.14, 0.72, 16]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Faucet base */}
      <mesh position={[0, 0.93, -0.12]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.08, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Faucet spout */}
      <mesh position={[0, 1.0, -0.03]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.08} envMapIntensity={1.2} />
      </mesh>

      {/* Handles */}
      {[-0.06, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.95, -0.15]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.04, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function ShowerModel({ isSelected }: { isSelected: boolean }) {
  const glassColor = isSelected ? '#06b6d4' : '#E0F7FA';
  const frameColor = '#C0C0C0';

  return (
    <group>
      {/* Floor tray */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.08, 0.9]} />
        <meshStandardMaterial color="#F5F5F5" roughness={0.25} />
      </mesh>

      {/* Drain */}
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.01, 16]} />
        <meshStandardMaterial color="#808080" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Glass panel - front */}
      <mesh position={[0, 1.0, 0.44]} castShadow>
        <boxGeometry args={[0.88, 1.92, 0.01]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.2} roughness={0.02} />
      </mesh>

      {/* Glass panel - side */}
      <mesh position={[0.44, 1.0, 0]} castShadow>
        <boxGeometry args={[0.01, 1.92, 0.88]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.2} roughness={0.02} />
      </mesh>

      {/* Chrome frame */}
      <mesh position={[0.44, 1.0, 0.44]} castShadow>
        <boxGeometry args={[0.025, 1.96, 0.025]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Top rail */}
      <mesh position={[0.22, 1.96, 0.44]} castShadow>
        <boxGeometry args={[0.46, 0.02, 0.025]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Shower head */}
      <mesh position={[-0.25, 2.1, -0.35]} castShadow>
        <cylinderGeometry args={[0.1, 0.08, 0.03, 24]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Shower arm */}
      <mesh position={[-0.25, 2.0, -0.38]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* Mixer */}
      <mesh position={[-0.25, 1.2, -0.4]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.04]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>
    </group>
  );
}

function BathtubModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#FAFAFA';
  const ceramicProps = { roughness: 0.12, metalness: 0.05 };

  return (
    <group>
      {/* Main tub body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[1.7, 0.56, 0.75]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Inner basin */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[1.55, 0.42, 0.58]} />
        <meshStandardMaterial color="#E8E8E8" {...ceramicProps} />
      </mesh>

      {/* Rim */}
      <mesh position={[0, 0.53, 0]} castShadow>
        <boxGeometry args={[1.72, 0.06, 0.77]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Sloped back */}
      <mesh position={[-0.72, 0.42, 0]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.7]} />
        <meshStandardMaterial color={color} {...ceramicProps} />
      </mesh>

      {/* Faucet */}
      <mesh position={[0.72, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.12, 12]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Handles */}
      {[-0.08, 0.08].map((z, i) => (
        <mesh key={i} position={[0.72, 0.68, z]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.95} roughness={0.08} />
        </mesh>
      ))}

      {/* Feet */}
      {[[-0.7, -0.25], [-0.7, 0.25], [0.7, -0.25], [0.7, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.04, z]} castShadow>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshStandardMaterial color="#B8860B" metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function KitchenLowerModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#F5F5F5';
  const doorColor = isSelected ? '#0891b2' : '#FFFFFF';
  const countertopColor = '#2D2D2D';

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 0.425, 0]} castShadow>
        <boxGeometry args={[0.6, 0.85, 0.58]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      {/* Countertop */}
      <mesh position={[0, 0.89, 0]} castShadow>
        <boxGeometry args={[0.64, 0.04, 0.64]} />
        <meshStandardMaterial color={countertopColor} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Door left */}
      <mesh position={[-0.145, 0.42, 0.295]} castShadow>
        <boxGeometry args={[0.27, 0.74, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.35} />
      </mesh>

      {/* Door right */}
      <mesh position={[0.145, 0.42, 0.295]} castShadow>
        <boxGeometry args={[0.27, 0.74, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.35} />
      </mesh>

      {/* Handles */}
      {[-0.05, 0.05].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0.315]} castShadow>
          <boxGeometry args={[0.1, 0.015, 0.015]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Kickplate */}
      <mesh position={[0, 0.04, 0.25]} castShadow>
        <boxGeometry args={[0.56, 0.08, 0.02]} />
        <meshStandardMaterial color="#3D3D3D" roughness={0.5} />
      </mesh>
    </group>
  );
}

function KitchenUpperModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#F5F5F5';
  const doorColor = isSelected ? '#0891b2' : '#FFFFFF';

  return (
    <group position={[0, 1.4, 0]}>
      {/* Main body */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.6, 0.64, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.32, 0.18]} castShadow>
        <boxGeometry args={[0.58, 0.6, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.35} />
      </mesh>

      {/* Handle */}
      <mesh position={[0.22, 0.32, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.015, 0.015]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

function ClosetModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#6B4423';
  const doorColor = isSelected ? '#0891b2' : '#8B5A2B';

  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.2, 2.2, 0.58]} />
        <meshStandardMaterial color={bodyColor} roughness={0.55} />
      </mesh>

      {/* Door left */}
      <mesh position={[-0.295, 1.1, 0.295]} castShadow>
        <boxGeometry args={[0.58, 2.12, 0.025]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>

      {/* Door right */}
      <mesh position={[0.295, 1.1, 0.295]} castShadow>
        <boxGeometry args={[0.58, 2.12, 0.025]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>

      {/* Handles */}
      {[-0.07, 0.07].map((x, i) => (
        <mesh key={i} position={[x, 1.1, 0.315]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 8]} />
          <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* Crown molding */}
      <mesh position={[0, 2.22, 0]} castShadow>
        <boxGeometry args={[1.24, 0.04, 0.62]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>

      {/* Base */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[1.22, 0.04, 0.6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.55} />
      </mesh>
    </group>
  );
}

function BedSingleModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#6B4423';
  const mattressColor = isSelected ? '#0891b2' : '#F8F8F8';
  const beddingColor = '#E8E8E8';

  return (
    <group>
      {/* Frame base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.98, 0.18, 1.98]} />
        <meshStandardMaterial color={frameColor} roughness={0.55} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.34, 0.02]} castShadow>
        <boxGeometry args={[0.9, 0.2, 1.85]} />
        <meshStandardMaterial color={mattressColor} roughness={0.85} />
      </mesh>

      {/* Pillow */}
      <mesh position={[0, 0.48, -0.72]} castShadow>
        <boxGeometry args={[0.55, 0.12, 0.35]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
      </mesh>

      {/* Blanket */}
      <mesh position={[0, 0.46, 0.25]} castShadow>
        <boxGeometry args={[0.88, 0.06, 1.2]} />
        <meshStandardMaterial color={beddingColor} roughness={0.9} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.65, -0.97]} castShadow>
        <boxGeometry args={[0.98, 0.8, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Legs */}
      {[[-0.44, -0.9], [0.44, -0.9], [-0.44, 0.9], [0.44, 0.9]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} castShadow>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color={frameColor} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function BedDoubleModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#6B4423';
  const mattressColor = isSelected ? '#0891b2' : '#F8F8F8';
  const beddingColor = '#E0E0E0';

  return (
    <group>
      {/* Frame base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.68, 0.18, 2.08]} />
        <meshStandardMaterial color={frameColor} roughness={0.55} />
      </mesh>

      {/* Mattress */}
      <mesh position={[0, 0.36, 0.02]} castShadow>
        <boxGeometry args={[1.58, 0.24, 1.95]} />
        <meshStandardMaterial color={mattressColor} roughness={0.85} />
      </mesh>

      {/* Pillows */}
      {[-0.38, 0.38].map((x, i) => (
        <mesh key={i} position={[x, 0.52, -0.75]} castShadow>
          <boxGeometry args={[0.55, 0.14, 0.38]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
        </mesh>
      ))}

      {/* Blanket */}
      <mesh position={[0, 0.5, 0.2]} castShadow>
        <boxGeometry args={[1.56, 0.06, 1.3]} />
        <meshStandardMaterial color={beddingColor} roughness={0.9} />
      </mesh>

      {/* Headboard */}
      <mesh position={[0, 0.75, -1.02]} castShadow>
        <boxGeometry args={[1.68, 1.0, 0.07]} />
        <meshStandardMaterial color={frameColor} roughness={0.5} />
      </mesh>

      {/* Headboard detail */}
      <mesh position={[0, 0.8, -1.0]} castShadow>
        <boxGeometry args={[1.5, 0.75, 0.03]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>
    </group>
  );
}

function SofaModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#3D3D3D';
  const cushionColor = isSelected ? '#0891b2' : '#5C5C5C';

  return (
    <group>
      {/* Base frame */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[2.0, 0.12, 0.88]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>

      {/* Seat cushions */}
      {[-0.48, 0.48].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0.05]} castShadow>
          <boxGeometry args={[0.92, 0.2, 0.7]} />
          <meshStandardMaterial color={cushionColor} roughness={0.92} />
        </mesh>
      ))}

      {/* Back cushion */}
      <mesh position={[0, 0.55, -0.32]} castShadow>
        <boxGeometry args={[1.92, 0.42, 0.22]} />
        <meshStandardMaterial color={cushionColor} roughness={0.92} />
      </mesh>

      {/* Left armrest */}
      <mesh position={[-0.92, 0.35, 0]} castShadow>
        <boxGeometry args={[0.16, 0.38, 0.8]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>

      {/* Right armrest */}
      <mesh position={[0.92, 0.35, 0]} castShadow>
        <boxGeometry args={[0.16, 0.38, 0.8]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>

      {/* Legs */}
      {[[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 8]} />
          <meshStandardMaterial color="#2D2D2D" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function TableModel({ isSelected }: { isSelected: boolean }) {
  const topColor = isSelected ? '#06b6d4' : '#8B5A2B';
  const legColor = isSelected ? '#0891b2' : '#6B4423';

  return (
    <group>
      {/* Table top */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.2, 0.045, 0.8]} />
        <meshStandardMaterial color={topColor} roughness={0.4} />
      </mesh>

      {/* Table top edge */}
      <mesh position={[0, 0.71, 0]} castShadow>
        <boxGeometry args={[1.18, 0.02, 0.78]} />
        <meshStandardMaterial color={topColor} roughness={0.45} />
      </mesh>

      {/* Legs */}
      {[[-0.54, -0.34], [0.54, -0.34], [-0.54, 0.34], [0.54, 0.34]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color={legColor} roughness={0.5} />
        </mesh>
      ))}

      {/* Leg supports */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.96, 0.03, 0.03]} />
        <meshStandardMaterial color={legColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.56, 0.03, 0.03]} />
        <meshStandardMaterial color={legColor} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ChairModel({ isSelected }: { isSelected: boolean }) {
  const woodColor = isSelected ? '#06b6d4' : '#6B4423';
  const seatColor = isSelected ? '#0891b2' : '#5C5C5C';

  return (
    <group>
      {/* Seat frame */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <boxGeometry args={[0.44, 0.04, 0.42]} />
        <meshStandardMaterial color={woodColor} roughness={0.55} />
      </mesh>

      {/* Seat cushion */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.4, 0.04, 0.38]} />
        <meshStandardMaterial color={seatColor} roughness={0.9} />
      </mesh>

      {/* Back frame */}
      <mesh position={[0, 0.75, -0.19]} castShadow>
        <boxGeometry args={[0.42, 0.5, 0.035]} />
        <meshStandardMaterial color={woodColor} roughness={0.55} />
      </mesh>

      {/* Back slats */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={i} position={[x, 0.72, -0.17]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.015]} />
          <meshStandardMaterial color={woodColor} roughness={0.5} />
        </mesh>
      ))}

      {/* Legs */}
      {[[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <boxGeometry args={[0.035, 0.44, 0.035]} />
          <meshStandardMaterial color={woodColor} roughness={0.55} />
        </mesh>
      ))}
    </group>
  );
}

function ACUnitModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#F5F5F5';

  return (
    <group position={[0, 2.2, 0]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.85, 0.28, 0.22]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>

      {/* Front panel */}
      <mesh position={[0, -0.02, 0.105]}>
        <boxGeometry args={[0.82, 0.22, 0.01]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>

      {/* Vents */}
      <mesh position={[0, -0.08, 0.115]}>
        <boxGeometry args={[0.75, 0.1, 0.005]} />
        <meshStandardMaterial color="#3D3D3D" roughness={0.4} />
      </mesh>

      {/* Display */}
      <mesh position={[0.32, 0.05, 0.115]}>
        <boxGeometry args={[0.12, 0.06, 0.005]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.3} />
      </mesh>

      {/* LED indicators */}
      {[0.28, 0.32, 0.36].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0.116]}>
          <circleGeometry args={[0.005, 8]} />
          <meshStandardMaterial color={i === 0 ? '#22c55e' : '#6B7280'} emissive={i === 0 ? '#22c55e' : '#000'} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

function LightModel({ isSelected }: { isSelected: boolean }) {
  const baseColor = isSelected ? '#06b6d4' : '#F5F5F5';
  const glowColor = '#FFF8E1';

  return (
    <group position={[0, 2.6, 0]}>
      {/* Ceiling mount */}
      <mesh position={[0, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.04, 16]} />
        <meshStandardMaterial color="#404040" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Cord/rod */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
        <meshStandardMaterial color="#2D2D2D" roughness={0.5} />
      </mesh>

      {/* Shade */}
      <mesh position={[0, -0.2, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.16, 0.15, 24]} />
        <meshStandardMaterial color={baseColor} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.12, 24]} />
        <meshStandardMaterial
          color={glowColor}
          emissive={glowColor}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Light bulb */}
      <mesh position={[0, -0.18, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#FFFDE7"
          emissive="#FFF8E1"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Point light */}
      <pointLight position={[0, -0.18, 0]} intensity={0.5} distance={4} color="#FFF8E1" castShadow />
    </group>
  );
}

// ============== OBJECT 3D COMPONENT ==============

function Object3DComponent({
  object,
  isSelected,
  isLocked,
  onClick,
}: {
  object: Object3DType;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
}) {
  const scale = object.scale || { x: 1, y: 1, z: 1 };

  const renderModel = () => {
    const selected = !!isSelected;
    switch (object.type) {
      case 'toilet': return <ToiletModel isSelected={selected} />;
      case 'sink': return <SinkModel isSelected={selected} />;
      case 'shower': return <ShowerModel isSelected={selected} />;
      case 'bathtub': return <BathtubModel isSelected={selected} />;
      case 'kitchen-lower': return <KitchenLowerModel isSelected={selected} />;
      case 'kitchen-upper': return <KitchenUpperModel isSelected={selected} />;
      case 'closet': return <ClosetModel isSelected={selected} />;
      case 'bed-single': return <BedSingleModel isSelected={selected} />;
      case 'bed-double': return <BedDoubleModel isSelected={selected} />;
      case 'sofa': return <SofaModel isSelected={selected} />;
      case 'table': return <TableModel isSelected={selected} />;
      case 'chair': return <ChairModel isSelected={selected} />;
      case 'ac-unit': return <ACUnitModel isSelected={selected} />;
      case 'light': return <LightModel isSelected={selected} />;
      default:
        return (
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={selected ? '#06b6d4' : '#808080'} roughness={0.7} />
          </mesh>
        );
    }
  };

  return (
    <group
      position={[object.position.x, object.position.y, object.position.z]}
      rotation={[
        ((object.rotation?.x || 0) * Math.PI) / 180,
        ((object.rotation?.y || 0) * Math.PI) / 180,
        ((object.rotation?.z || 0) * Math.PI) / 180,
      ]}
      scale={[scale.x, scale.y, scale.z]}
      onClick={(e) => {
        e.stopPropagation();
        if (!isLocked) onClick?.();
      }}
    >
      {renderModel()}
    </group>
  );
}

// ============== TRANSFORM CONTROLS WRAPPER ==============

function TransformControlsWrapper({ children }: { children: React.ReactNode }) {
  const {
    selectedObject,
    selectedDoor,
    selectedWindow,
    currentRoom,
    transformMode,
    updateObject,
    updateDoor,
    updateWindow,
    saveToHistory,
    isLocked,
    currentTool,
  } = useBuilderStore();

  const transformRef = useRef<any>(null);
  const { camera, gl } = useThree();

  const selectedElement = useMemo(() => {
    if (!currentRoom) return null;

    if (selectedObject) {
      const obj = currentRoom.objects.find(o => o.id === selectedObject);
      if (obj && !isLocked(obj.id)) return { type: 'object', data: obj };
    }
    if (selectedDoor) {
      const door = currentRoom.doors.find(d => d.id === selectedDoor);
      if (door && !isLocked(door.id)) return { type: 'door', data: door };
    }
    if (selectedWindow) {
      const win = currentRoom.windows.find(w => w.id === selectedWindow);
      if (win && !isLocked(win.id)) return { type: 'window', data: win };
    }
    return null;
  }, [selectedObject, selectedDoor, selectedWindow, currentRoom, isLocked]);

  const handleChange = useCallback(() => {
    if (!transformRef.current || !selectedElement) return;

    const object = transformRef.current.object;
    if (!object) return;

    const position = {
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
    };

    const rotation = {
      x: (object.rotation.x * 180) / Math.PI,
      y: (object.rotation.y * 180) / Math.PI,
      z: (object.rotation.z * 180) / Math.PI,
    };

    const scale = {
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z,
    };

    if (selectedElement.type === 'object' && selectedObject) {
      updateObject(selectedObject, { position, rotation, scale });
    } else if (selectedElement.type === 'door' && selectedDoor) {
      updateDoor(selectedDoor, { position, rotation: rotation.y });
    } else if (selectedElement.type === 'window' && selectedWindow) {
      updateWindow(selectedWindow, { position, rotation: rotation.y });
    }
  }, [selectedElement, selectedObject, selectedDoor, selectedWindow, updateObject, updateDoor, updateWindow]);

  const handleMouseUp = useCallback(() => {
    saveToHistory();
  }, [saveToHistory]);

  if (!selectedElement || currentTool !== 'select') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <TransformControls
        ref={transformRef}
        mode={transformMode}
        onObjectChange={handleChange}
        onMouseUp={handleMouseUp}
      />
    </>
  );
}

// ============== MEASUREMENT LINE ==============

function MeasurementLine() {
  const { isMeasuring, measureStart, measureEnd, measurements, showMeasurements } = useBuilderStore();

  if (!showMeasurements) return null;

  return (
    <group>
      {/* Active measurement */}
      {isMeasuring && measureStart && measureEnd && (
        <group>
          <Line
            points={[
              [measureStart.x, measureStart.y + 0.05, measureStart.z],
              [measureEnd.x, measureEnd.y + 0.05, measureEnd.z],
            ]}
            color="#ef4444"
            lineWidth={3}
          />
          <Html
            position={[
              (measureStart.x + measureEnd.x) / 2,
              Math.max(measureStart.y, measureEnd.y) + 0.3,
              (measureStart.z + measureEnd.z) / 2,
            ]}
            center
            style={{
              background: 'rgba(239, 68, 68, 0.95)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            {Math.sqrt(
              Math.pow(measureEnd.x - measureStart.x, 2) +
              Math.pow(measureEnd.y - measureStart.y, 2) +
              Math.pow(measureEnd.z - measureStart.z, 2)
            ).toFixed(2)} מ'
          </Html>
        </group>
      )}

      {/* Saved measurements */}
      {measurements.map((m) => (
        <group key={m.id}>
          <Line
            points={[
              [m.start.x, m.start.y + 0.05, m.start.z],
              [m.end.x, m.end.y + 0.05, m.end.z],
            ]}
            color="#3b82f6"
            lineWidth={2}
            dashed
            dashSize={0.1}
            gapSize={0.05}
          />
          <Html
            position={[
              (m.start.x + m.end.x) / 2,
              Math.max(m.start.y, m.end.y) + 0.2,
              (m.start.z + m.end.z) / 2,
            ]}
            center
            style={{
              background: 'rgba(59, 130, 246, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {m.distance.toFixed(2)} מ'
          </Html>
        </group>
      ))}
    </group>
  );
}

// ============== TEMP WALL ==============

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
    <group>
      <mesh position={[midX, height / 2, midY]} rotation={[0, -angle, 0]}>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.5} />
      </mesh>
      <Html
        position={[midX, height + 0.3, midY]}
        center
        style={{
          background: 'rgba(6, 182, 212, 0.95)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      >
        {length.toFixed(2)} מ'
      </Html>
    </group>
  );
}

// ============== GHOST OBJECT ==============

function GhostObject({
  type,
  position,
}: {
  type: string;
  position: { x: number; y: number; z: number };
}) {
  const getDimensions = (): [number, number, number] => {
    switch (type) {
      case 'toilet': return [0.4, 0.75, 0.6];
      case 'sink': return [0.5, 1.0, 0.5];
      case 'shower': return [0.9, 2.0, 0.9];
      case 'bathtub': return [1.7, 0.5, 0.7];
      case 'kitchen-lower': return [0.6, 0.9, 0.6];
      case 'kitchen-upper': return [0.6, 0.6, 0.35];
      case 'closet': return [1.2, 2.2, 0.6];
      case 'bed-single': return [0.95, 0.5, 1.95];
      case 'bed-double': return [1.65, 0.55, 2.05];
      case 'sofa': return [2.0, 0.8, 0.9];
      case 'table': return [1.2, 0.76, 0.8];
      case 'chair': return [0.45, 1.0, 0.45];
      case 'ac-unit': return [0.8, 0.25, 0.2];
      case 'light': return [0.4, 0.15, 0.4];
      default: return [0.5, 0.5, 0.5];
    }
  };

  const dimensions = getDimensions();
  const yOffset = type === 'ac-unit' ? 2.2 : type === 'light' ? 2.5 : type === 'kitchen-upper' ? 1.7 : dimensions[1] / 2;

  return (
    <group position={[position.x, position.y + yOffset, position.z]}>
      <mesh>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
        <lineBasicMaterial color="#06b6d4" />
      </lineSegments>
    </group>
  );
}

// ============== GRID ==============

function BuilderGrid({ size = 20 }: { size?: number }) {
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

// ============== CAMERA CONTROLLER ==============

function CameraController() {
  const { viewMode } = useBuilderStore();
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (viewMode === '2d' && camera.position.y !== 15) {
      camera.position.set(0, 15, 0.01);
      camera.lookAt(0, 0, 0);
    }
  });

  if (viewMode === 'walk') {
    return null;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate={viewMode !== '2d'}
      enablePan={true}
      enableZoom={true}
      maxPolarAngle={viewMode === '2d' ? 0 : Math.PI / 2}
      minPolarAngle={viewMode === '2d' ? 0 : 0}
      target={[0, 0, 0]}
      maxDistance={50}
      minDistance={2}
    />
  );
}

// ============== WALK MODE CONTROLLER ==============

function WalkModeController() {
  const { viewMode, walkPosition, setWalkPosition, currentRoom } = useBuilderStore();
  const { camera } = useThree();
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);

  useEffect(() => {
    if (viewMode !== 'walk') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveForward.current = true; break;
        case 'KeyS': case 'ArrowDown': moveBackward.current = true; break;
        case 'KeyA': case 'ArrowLeft': moveLeft.current = true; break;
        case 'KeyD': case 'ArrowRight': moveRight.current = true; break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp': moveForward.current = false; break;
        case 'KeyS': case 'ArrowDown': moveBackward.current = false; break;
        case 'KeyA': case 'ArrowLeft': moveLeft.current = false; break;
        case 'KeyD': case 'ArrowRight': moveRight.current = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [viewMode]);

  useFrame((_, delta) => {
    if (viewMode !== 'walk') return;

    const speed = 3.0;
    velocity.current.x -= velocity.current.x * 10.0 * delta;
    velocity.current.z -= velocity.current.z * 10.0 * delta;

    direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.current.normalize();

    if (moveForward.current || moveBackward.current) {
      velocity.current.z -= direction.current.z * speed * delta;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.current.x -= direction.current.x * speed * delta;
    }

    camera.translateX(-velocity.current.x);
    camera.translateZ(velocity.current.z);
    camera.position.y = 1.7;

    setWalkPosition({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    });
  });

  if (viewMode !== 'walk') return null;

  return <PointerLockControls />;
}

// ============== POINTER INTERACTION ==============

function Pointer() {
  const {
    currentTool,
    isDrawingWall,
    snapToGrid,
    gridSize,
    startDrawingWall,
    updateTempWall,
    finishDrawingWall,
    placementObject,
    setPlacementPosition,
    placeObject,
    clearSelection,
    isMeasuring,
    startMeasuring,
    updateMeasureEnd,
    finishMeasuring,
    viewMode,
  } = useBuilderStore();

  const planeRef = useRef<THREE.Mesh>(null);

  const getSnappedPoint = (point: THREE.Vector3) => {
    return snapToGrid
      ? {
          x: Math.round(point.x / gridSize) * gridSize,
          y: Math.round(point.z / gridSize) * gridSize,
        }
      : { x: point.x, y: point.z };
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (viewMode === 'walk') return;

    const point = e.point;
    const snappedPoint = getSnappedPoint(point);

    if (currentTool === 'wall' && isDrawingWall) {
      updateTempWall(snappedPoint);
    }

    if (currentTool === 'object' && placementObject) {
      setPlacementPosition({ x: snappedPoint.x, y: 0, z: snappedPoint.y });
    }

    if (currentTool === 'measure' && isMeasuring) {
      updateMeasureEnd({ x: snappedPoint.x, y: 0, z: snappedPoint.y });
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (viewMode === 'walk') return;

    const point = e.point;
    const snappedPoint = getSnappedPoint(point);

    if (currentTool === 'wall') {
      if (!isDrawingWall) {
        startDrawingWall(snappedPoint);
      } else {
        finishDrawingWall();
      }
    } else if (currentTool === 'object' && placementObject) {
      placeObject();
    } else if (currentTool === 'measure') {
      if (!isMeasuring) {
        startMeasuring({ x: snappedPoint.x, y: 0, z: snappedPoint.y });
      } else {
        finishMeasuring();
      }
    } else if (currentTool === 'select') {
      clearSelection();
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

// ============== ADVANCED LIGHTING ==============

function AdvancedLighting() {
  return (
    <>
      {/* Main sun light */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[4096, 4096]}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />

      {/* Fill light */}
      <directionalLight
        position={[-15, 20, -15]}
        intensity={0.4}
        color="#E3F2FD"
      />

      {/* Ambient light */}
      <ambientLight intensity={0.4} color="#F5F5F5" />

      {/* Hemisphere light for natural sky/ground colors */}
      <hemisphereLight
        intensity={0.5}
        color="#B3E5FC"
        groundColor="#8D6E63"
      />
    </>
  );
}

// ============== MAIN SCENE ==============

function SceneContent() {
  const {
    currentRoom,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedObject,
    isDrawingWall,
    wallStartPoint,
    tempWallEnd,
    defaultWallHeight,
    defaultWallThickness,
    currentTool,
    placementObject,
    placementPosition,
    floorTexture,
    wallTexture,
    isLocked,
    setSelectedWall,
    setSelectedDoor,
    setSelectedWindow,
    setSelectedObject,
    viewMode,
  } = useBuilderStore();

  return (
    <>
      {/* Advanced Lighting */}
      <AdvancedLighting />

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={viewMode === 'walk' ? [0, 1.7, 5] : [10, 10, 10]}
        fov={viewMode === 'walk' ? 75 : 45}
      />
      <CameraController />
      <WalkModeController />

      {/* Environment */}
      <Environment preset="apartment" background={false} />

      {/* Floor */}
      <RealisticFloor texture={floorTexture} size={25} />
      <BuilderGrid size={25} />

      {/* Soft shadows */}
      <ContactShadows
        position={[0, 0.001, 0]}
        opacity={0.5}
        scale={35}
        blur={2.5}
        far={20}
      />

      {/* Pointer interaction */}
      <Pointer />

      {/* Measurement lines */}
      <MeasurementLine />

      {/* Walls */}
      {currentRoom?.walls.map((wall) => (
        <Wall
          key={wall.id}
          wall={wall}
          isSelected={selectedWall === wall.id}
          isLocked={isLocked(wall.id)}
          wallTexture={wallTexture}
          onClick={() => currentTool === 'select' && setSelectedWall(wall.id)}
        />
      ))}

      {/* Doors */}
      {currentRoom?.doors.map((door) => (
        <Door3DComponent
          key={door.id}
          door={door}
          isSelected={selectedDoor === door.id}
          isLocked={isLocked(door.id)}
          onClick={() => currentTool === 'select' && setSelectedDoor(door.id)}
        />
      ))}

      {/* Windows */}
      {currentRoom?.windows.map((win) => (
        <Window3DComponent
          key={win.id}
          window={win}
          isSelected={selectedWindow === win.id}
          isLocked={isLocked(win.id)}
          onClick={() => currentTool === 'select' && setSelectedWindow(win.id)}
        />
      ))}

      {/* Objects with Transform Controls */}
      <TransformControlsWrapper>
        {currentRoom?.objects.map((obj) => (
          <Object3DComponent
            key={obj.id}
            object={obj}
            isSelected={selectedObject === obj.id}
            isLocked={isLocked(obj.id)}
            onClick={() => currentTool === 'select' && setSelectedObject(obj.id)}
          />
        ))}
      </TransformControlsWrapper>

      {/* Temporary wall being drawn */}
      {isDrawingWall && wallStartPoint && tempWallEnd && (
        <TempWall
          start={wallStartPoint}
          end={tempWallEnd}
          height={defaultWallHeight}
          thickness={defaultWallThickness}
        />
      )}

      {/* Ghost object for placement preview */}
      {currentTool === 'object' && placementObject && placementPosition && (
        <GhostObject
          type={placementObject}
          position={placementPosition}
        />
      )}
    </>
  );
}

// ============== MAIN EXPORT ==============

export function Scene3D() {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #E0F2F1 50%, #F5F5F5 100%)' }}
      dpr={[1, 2]}
    >
      <SoftShadows size={25} focus={0} samples={10} />
      <SceneContent />
    </Canvas>
  );
}

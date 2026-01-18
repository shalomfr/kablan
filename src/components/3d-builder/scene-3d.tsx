'use client';

import { useRef, useState } from 'react';
import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
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
import type { Door3D as Door3DType, Window3D as Window3DType, Object3D as Object3DType } from '@/types';

// Wall component with openings support
function Wall({
  id,
  start,
  end,
  height,
  thickness,
  isSelected,
  onClick,
}: {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  height: number;
  thickness: number;
  isSelected?: boolean;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const { currentTool, addDoor, addWindow, currentRoom } = useBuilderStore();
  
  const length = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    if (currentTool === 'door' && currentRoom) {
      // Calculate position along the wall
      const localPoint = e.point;
      const wallDir = new THREE.Vector3(end.x - start.x, 0, end.y - start.y).normalize();
      const startVec = new THREE.Vector3(start.x, 0, start.y);
      const clickVec = new THREE.Vector3(localPoint.x, 0, localPoint.z);
      const positionAlongWall = clickVec.sub(startVec).dot(wallDir);
      
      const newDoor: Door3DType = {
        id: crypto.randomUUID(),
        type: 'standard',
        width: 0.9,
        height: 2.1,
        position: { x: localPoint.x, y: 0, z: localPoint.z },
        rotation: -angle * (180 / Math.PI),
        wallId: id,
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
        wallId: id,
      };
      addWindow(newWindow);
    } else if (onClick) {
      onClick(e);
    }
  };

  return (
    <mesh
      position={[midX, height / 2, midY]}
      rotation={[0, -angle, 0]}
      onClick={handleClick}
      castShadow
      receiveShadow
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

// Door 3D component
function Door3DComponent({
  door,
  isSelected,
  onClick,
}: {
  door: Door3DType;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const frameThickness = 0.05;
  const frameDepth = 0.15;
  const doorThickness = 0.04;
  
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
      <mesh position={[-door.width / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, door.height, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#8B4513'} roughness={0.6} />
      </mesh>
      
      {/* Door frame - right */}
      <mesh position={[door.width / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, door.height, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#8B4513'} roughness={0.6} />
      </mesh>
      
      {/* Door frame - top */}
      <mesh position={[0, door.height / 2 - frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[door.width, frameThickness, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#8B4513'} roughness={0.6} />
      </mesh>
      
      {/* Door panel */}
      <mesh position={[0, 0, 0.02]} castShadow>
        <boxGeometry args={[door.width - frameThickness * 2, door.height - frameThickness, doorThickness]} />
        <meshStandardMaterial color={isSelected ? '#0891b2' : '#A0522D'} roughness={0.5} />
      </mesh>
      
      {/* Door handle */}
      <mesh position={[door.width / 2 - 0.15, 0, 0.05]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Window 3D component
function Window3DComponent({
  window: win,
  isSelected,
  onClick,
}: {
  window: Window3DType;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const frameThickness = 0.04;
  const frameDepth = 0.1;
  const glassThickness = 0.01;
  
  return (
    <group
      position={[win.position.x, win.position.y, win.position.z]}
      rotation={[0, (win.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      {/* Window frame - outer */}
      {/* Left */}
      <mesh position={[-win.width / 2 + frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, win.height, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
      </mesh>
      
      {/* Right */}
      <mesh position={[win.width / 2 - frameThickness / 2, 0, 0]} castShadow>
        <boxGeometry args={[frameThickness, win.height, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
      </mesh>
      
      {/* Top */}
      <mesh position={[0, win.height / 2 - frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[win.width, frameThickness, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
      </mesh>
      
      {/* Bottom */}
      <mesh position={[0, -win.height / 2 + frameThickness / 2, 0]} castShadow>
        <boxGeometry args={[win.width, frameThickness, frameDepth]} />
        <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
      </mesh>
      
      {/* Center divider (for double window) */}
      {win.type === 'double' && (
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[frameThickness / 2, win.height - frameThickness * 2, frameDepth]} />
          <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
        </mesh>
      )}
      
      {/* Glass */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[win.width - frameThickness * 2, win.height - frameThickness * 2, glassThickness]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4} 
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Realistic Toilet
function ToiletModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#f5f5f5';
  return (
    <group>
      {/* Bowl */}
      <mesh position={[0, 0.2, 0.1]} castShadow>
        <cylinderGeometry args={[0.18, 0.15, 0.4, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Bowl rim */}
      <mesh position={[0, 0.4, 0.1]} castShadow>
        <torusGeometry args={[0.17, 0.03, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Tank */}
      <mesh position={[0, 0.45, -0.15]} castShadow>
        <boxGeometry args={[0.35, 0.5, 0.15]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Tank lid */}
      <mesh position={[0, 0.72, -0.15]} castShadow>
        <boxGeometry args={[0.37, 0.04, 0.17]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Flush button */}
      <mesh position={[0, 0.75, -0.15]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.02, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Realistic Sink
function SinkModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#f5f5f5';
  return (
    <group>
      {/* Basin */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.18, 0.15, 24]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.1} />
      </mesh>
      {/* Basin inner (darker) */}
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.19, 0.15, 0.12, 24]} />
        <meshStandardMaterial color="#e0e0e0" roughness={0.1} />
      </mesh>
      {/* Pedestal */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Faucet base */}
      <mesh position={[0, 0.95, -0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Faucet spout */}
      <mesh position={[0, 1.02, -0.05]} rotation={[Math.PI / 4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.15, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.08, 0.95, -0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.08, 0.95, -0.12]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Realistic Shower
function ShowerModel({ isSelected }: { isSelected: boolean }) {
  const glassColor = isSelected ? '#06b6d4' : '#87CEEB';
  return (
    <group>
      {/* Floor tray */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.06, 0.9]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
      {/* Glass panel - front */}
      <mesh position={[0, 1, 0.43]} castShadow>
        <boxGeometry args={[0.85, 1.9, 0.01]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* Glass panel - side */}
      <mesh position={[0.43, 1, 0]} castShadow>
        <boxGeometry args={[0.01, 1.9, 0.85]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.3} roughness={0.1} />
      </mesh>
      {/* Metal frame - vertical */}
      <mesh position={[0.44, 1, 0.44]} castShadow>
        <boxGeometry args={[0.02, 1.95, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Shower head */}
      <mesh position={[-0.2, 1.8, -0.35]} castShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.03, 16]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Shower arm */}
      <mesh position={[-0.2, 1.7, -0.4]} rotation={[Math.PI / 6, 0, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Realistic Bathtub
function BathtubModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#f5f5f5';
  return (
    <group>
      {/* Main tub body */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.7, 0.5, 0.7]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Inner cavity (darker) */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.55, 0.35, 0.55]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.1} />
      </mesh>
      {/* Raised back */}
      <mesh position={[-0.7, 0.4, 0]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.65]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* Faucet */}
      <mesh position={[0.7, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Feet */}
      {[[-0.7, -0.25], [-0.7, 0.25], [0.7, -0.25], [0.7, 0.25]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} castShadow>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#8B8B8B" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Kitchen Lower Cabinet
function KitchenLowerModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#f5f5f5';
  const doorColor = isSelected ? '#0891b2' : '#e8e8e8';
  return (
    <group>
      {/* Cabinet body */}
      <mesh position={[0, 0.425, 0]} castShadow>
        <boxGeometry args={[0.6, 0.85, 0.58]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 0.87, 0]} castShadow>
        <boxGeometry args={[0.62, 0.04, 0.62]} />
        <meshStandardMaterial color="#404040" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* Door left */}
      <mesh position={[-0.15, 0.4, 0.29]} castShadow>
        <boxGeometry args={[0.27, 0.7, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.4} />
      </mesh>
      {/* Door right */}
      <mesh position={[0.15, 0.4, 0.29]} castShadow>
        <boxGeometry args={[0.27, 0.7, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.4} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.05, 0.5, 0.31]} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.05, 0.5, 0.31]} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Realistic Kitchen Upper Cabinet
function KitchenUpperModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#f5f5f5';
  const doorColor = isSelected ? '#0891b2' : '#e8e8e8';
  return (
    <group position={[0, 1.4, 0]}>
      {/* Cabinet body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.35]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      {/* Door */}
      <mesh position={[0, 0.3, 0.17]} castShadow>
        <boxGeometry args={[0.56, 0.56, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.4} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.2, 0.3, 0.19]} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Realistic Closet
function ClosetModel({ isSelected }: { isSelected: boolean }) {
  const bodyColor = isSelected ? '#06b6d4' : '#8B4513';
  const doorColor = isSelected ? '#0891b2' : '#A0522D';
  return (
    <group>
      {/* Main body */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.2, 2.2, 0.58]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>
      {/* Left door */}
      <mesh position={[-0.3, 1.1, 0.29]} castShadow>
        <boxGeometry args={[0.56, 2.1, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>
      {/* Right door */}
      <mesh position={[0.3, 1.1, 0.29]} castShadow>
        <boxGeometry args={[0.56, 2.1, 0.02]} />
        <meshStandardMaterial color={doorColor} roughness={0.5} />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.08, 1.1, 0.31]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.08, 1.1, 0.31]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color="#C0C0C0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Realistic Single Bed
function BedSingleModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#8B4513';
  const mattressColor = isSelected ? '#0891b2' : '#f5f5f5';
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[0.95, 0.2, 1.95]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.35, 0.05]} castShadow>
        <boxGeometry args={[0.88, 0.2, 1.8]} />
        <meshStandardMaterial color={mattressColor} roughness={0.8} />
      </mesh>
      {/* Pillow */}
      <mesh position={[0, 0.5, -0.7]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshStandardMaterial color="#fff" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.6, -0.95]} castShadow>
        <boxGeometry args={[0.95, 0.7, 0.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.4, -0.85], [0.4, -0.85], [-0.4, 0.85], [0.4, 0.85]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Double Bed
function BedDoubleModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#8B4513';
  const mattressColor = isSelected ? '#0891b2' : '#f5f5f5';
  return (
    <group>
      {/* Frame */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.65, 0.2, 2.05]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>
      {/* Mattress */}
      <mesh position={[0, 0.35, 0.05]} castShadow>
        <boxGeometry args={[1.55, 0.22, 1.9]} />
        <meshStandardMaterial color={mattressColor} roughness={0.8} />
      </mesh>
      {/* Pillows */}
      <mesh position={[-0.35, 0.52, -0.7]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.35]} />
        <meshStandardMaterial color="#fff" roughness={0.9} />
      </mesh>
      <mesh position={[0.35, 0.52, -0.7]} castShadow>
        <boxGeometry args={[0.5, 0.12, 0.35]} />
        <meshStandardMaterial color="#fff" roughness={0.9} />
      </mesh>
      {/* Headboard */}
      <mesh position={[0, 0.7, -1]} castShadow>
        <boxGeometry args={[1.65, 0.9, 0.06]} />
        <meshStandardMaterial color={frameColor} roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.75, -0.95], [0.75, -0.95], [-0.75, 0.95], [0.75, 0.95]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.05, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
          <meshStandardMaterial color={frameColor} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Sofa
function SofaModel({ isSelected }: { isSelected: boolean }) {
  const frameColor = isSelected ? '#06b6d4' : '#4a4a4a';
  const cushionColor = isSelected ? '#0891b2' : '#6B7280';
  return (
    <group>
      {/* Base frame */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[2.0, 0.15, 0.85]} />
        <meshStandardMaterial color={frameColor} roughness={0.7} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.32, 0.05]} castShadow>
        <boxGeometry args={[1.9, 0.18, 0.65]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>
      {/* Back cushion */}
      <mesh position={[0, 0.55, -0.32]} castShadow>
        <boxGeometry args={[1.9, 0.4, 0.2]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>
      {/* Left armrest */}
      <mesh position={[-0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.35, 0.8]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>
      {/* Right armrest */}
      <mesh position={[0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.15, 0.35, 0.8]} />
        <meshStandardMaterial color={cushionColor} roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.85, -0.35], [0.85, -0.35], [-0.85, 0.35], [0.85, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.04, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Table
function TableModel({ isSelected }: { isSelected: boolean }) {
  const topColor = isSelected ? '#06b6d4' : '#8B4513';
  const legColor = isSelected ? '#0891b2' : '#654321';
  return (
    <group>
      {/* Table top */}
      <mesh position={[0, 0.74, 0]} castShadow>
        <boxGeometry args={[1.2, 0.04, 0.8]} />
        <meshStandardMaterial color={topColor} roughness={0.4} />
      </mesh>
      {/* Legs */}
      {[[-0.55, -0.35], [0.55, -0.35], [-0.55, 0.35], [0.55, 0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.36, z]} castShadow>
          <boxGeometry args={[0.05, 0.72, 0.05]} />
          <meshStandardMaterial color={legColor} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Realistic Chair
function ChairModel({ isSelected }: { isSelected: boolean }) {
  const woodColor = isSelected ? '#06b6d4' : '#8B4513';
  const seatColor = isSelected ? '#0891b2' : '#A0522D';
  return (
    <group>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.04, 0.4]} />
        <meshStandardMaterial color={seatColor} roughness={0.6} />
      </mesh>
      {/* Seat cushion */}
      <mesh position={[0, 0.49, 0]} castShadow>
        <boxGeometry args={[0.38, 0.04, 0.36]} />
        <meshStandardMaterial color="#6B7280" roughness={0.9} />
      </mesh>
      {/* Back */}
      <mesh position={[0, 0.75, -0.18]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.03]} />
        <meshStandardMaterial color={woodColor} roughness={0.6} />
      </mesh>
      {/* Back cushion */}
      <mesh position={[0, 0.72, -0.15]} castShadow>
        <boxGeometry args={[0.34, 0.35, 0.03]} />
        <meshStandardMaterial color="#6B7280" roughness={0.9} />
      </mesh>
      {/* Legs */}
      {[[-0.17, -0.15], [0.17, -0.15], [-0.17, 0.15], [0.17, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.22, z]} castShadow>
          <boxGeometry args={[0.03, 0.44, 0.03]} />
          <meshStandardMaterial color={woodColor} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// AC Unit
function ACUnitModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#f5f5f5';
  return (
    <group position={[0, 2.2, 0]}>
      {/* Main body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.25, 0.2]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Vent grille */}
      <mesh position={[0, -0.08, 0.09]}>
        <boxGeometry args={[0.7, 0.08, 0.01]} />
        <meshStandardMaterial color="#404040" roughness={0.5} />
      </mesh>
      {/* Display panel */}
      <mesh position={[0.3, 0.05, 0.1]}>
        <boxGeometry args={[0.1, 0.05, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} />
      </mesh>
    </group>
  );
}

// Light fixture
function LightModel({ isSelected }: { isSelected: boolean }) {
  const color = isSelected ? '#06b6d4' : '#f5f5f5';
  return (
    <group position={[0, 2.6, 0]}>
      {/* Ceiling mount */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
        <meshStandardMaterial color="#404040" roughness={0.5} />
      </mesh>
      {/* Fixture body */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.15, 0.1, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Light source */}
      <mesh position={[0, -0.12, 0]}>
        <circleGeometry args={[0.14, 16]} />
        <meshStandardMaterial color="#ffffd0" emissive="#ffffd0" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

// Object 3D component (furniture, fixtures, etc.)
function Object3DComponent({
  object,
  isSelected,
  onClick,
}: {
  object: Object3DType;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const scale = object.scale || { x: 1, y: 1, z: 1 };
  
  const renderModel = () => {
    switch (object.type) {
      case 'toilet': return <ToiletModel isSelected={!!isSelected} />;
      case 'sink': return <SinkModel isSelected={!!isSelected} />;
      case 'shower': return <ShowerModel isSelected={!!isSelected} />;
      case 'bathtub': return <BathtubModel isSelected={!!isSelected} />;
      case 'kitchen-lower': return <KitchenLowerModel isSelected={!!isSelected} />;
      case 'kitchen-upper': return <KitchenUpperModel isSelected={!!isSelected} />;
      case 'closet': return <ClosetModel isSelected={!!isSelected} />;
      case 'bed-single': return <BedSingleModel isSelected={!!isSelected} />;
      case 'bed-double': return <BedDoubleModel isSelected={!!isSelected} />;
      case 'sofa': return <SofaModel isSelected={!!isSelected} />;
      case 'table': return <TableModel isSelected={!!isSelected} />;
      case 'chair': return <ChairModel isSelected={!!isSelected} />;
      case 'ac-unit': return <ACUnitModel isSelected={!!isSelected} />;
      case 'light': return <LightModel isSelected={!!isSelected} />;
      default:
        // Generic box for other objects
        return (
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color={isSelected ? '#06b6d4' : '#808080'} roughness={0.7} />
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
        onClick?.();
      }}
    >
      {renderModel()}
    </group>
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

// Ghost object for placement preview - shows outline of the object
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
      case 'outlet': return [0.08, 0.12, 0.02];
      case 'switch': return [0.08, 0.08, 0.02];
      case 'light': return [0.4, 0.15, 0.4];
      default: return [0.5, 0.5, 0.5];
    }
  };
  
  const dimensions = getDimensions();
  const yOffset = type === 'ac-unit' ? 2.2 : type === 'light' ? 2.5 : type === 'kitchen-upper' ? 1.7 : dimensions[1] / 2;
  
  return (
    <group position={[position.x, position.y + yOffset, position.z]}>
      {/* Semi-transparent box showing footprint */}
      <mesh>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color="#06b6d4" transparent opacity={0.3} />
      </mesh>
      {/* Wireframe outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...dimensions)]} />
        <lineBasicMaterial color="#06b6d4" linewidth={2} />
      </lineSegments>
    </group>
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

// Dimension line
function DimensionLine({
  start,
  end,
}: {
  start: [number, number, number];
  end: [number, number, number];
}) {
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
  const { 
    currentTool, 
    isDrawingWall, 
    snapToGrid, 
    gridSize, 
    startDrawingWall, 
    updateTempWall, 
    finishDrawingWall,
    placementObject,
    placementPosition,
    setPlacementPosition,
    placeObject,
    clearSelection,
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
    const point = e.point;
    const snappedPoint = getSnappedPoint(point);
    
    if (currentTool === 'wall' && isDrawingWall) {
      updateTempWall(snappedPoint);
    }
    
    if (currentTool === 'object' && placementObject) {
      setPlacementPosition({ x: snappedPoint.x, y: 0, z: snappedPoint.y });
    }
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
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

// Main scene
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
    setSelectedWall,
    setSelectedDoor,
    setSelectedWindow,
    setSelectedObject,
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
          id={wall.id}
          start={wall.start}
          end={wall.end}
          height={wall.height}
          thickness={wall.thickness}
          isSelected={selectedWall === wall.id}
          onClick={() => currentTool === 'select' && setSelectedWall(wall.id)}
        />
      ))}

      {/* Doors */}
      {currentRoom?.doors.map((door) => (
        <Door3DComponent
          key={door.id}
          door={door}
          isSelected={selectedDoor === door.id}
          onClick={() => currentTool === 'select' && setSelectedDoor(door.id)}
        />
      ))}

      {/* Windows */}
      {currentRoom?.windows.map((win) => (
        <Window3DComponent
          key={win.id}
          window={win}
          isSelected={selectedWindow === win.id}
          onClick={() => currentTool === 'select' && setSelectedWindow(win.id)}
        />
      ))}

      {/* Objects */}
      {currentRoom?.objects.map((obj) => (
        <Object3DComponent
          key={obj.id}
          object={obj}
          isSelected={selectedObject === obj.id}
          onClick={() => currentTool === 'select' && setSelectedObject(obj.id)}
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

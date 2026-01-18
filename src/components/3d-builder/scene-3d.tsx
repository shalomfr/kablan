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
  // Get color based on category
  const getColor = () => {
    if (isSelected) return '#06b6d4';
    switch (object.category) {
      case 'furniture': return '#8B4513';
      case 'fixture': return '#4A90D9';
      case 'electrical': return '#FFD700';
      case 'hvac': return '#708090';
      case 'decoration': return '#9370DB';
      default: return '#808080';
    }
  };
  
  // Get dimensions based on object type
  const getDimensions = (): [number, number, number] => {
    switch (object.type) {
      case 'toilet': return [0.4, 0.4, 0.6];
      case 'sink': return [0.5, 0.2, 0.4];
      case 'shower': return [0.9, 2.0, 0.9];
      case 'bathtub': return [1.7, 0.5, 0.7];
      case 'kitchen-lower': return [0.6, 0.85, 0.6];
      case 'kitchen-upper': return [0.6, 0.6, 0.35];
      case 'closet': return [1.2, 2.2, 0.6];
      case 'bed-single': return [0.9, 0.5, 1.9];
      case 'bed-double': return [1.6, 0.5, 2.0];
      case 'sofa': return [2.0, 0.8, 0.9];
      case 'table': return [1.2, 0.75, 0.8];
      case 'chair': return [0.45, 0.9, 0.45];
      case 'ac-unit': return [0.8, 0.25, 0.2];
      case 'outlet': return [0.08, 0.12, 0.02];
      case 'switch': return [0.08, 0.08, 0.02];
      case 'light': return [0.4, 0.1, 0.4];
      default: return [0.5, 0.5, 0.5];
    }
  };
  
  const dimensions = getDimensions();
  const scale = object.scale || { x: 1, y: 1, z: 1 };
  
  return (
    <group
      position={[object.position.x, object.position.y + dimensions[1] / 2, object.position.z]}
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
      <mesh castShadow receiveShadow>
        <boxGeometry args={dimensions} />
        <meshStandardMaterial color={getColor()} roughness={0.7} />
      </mesh>
      
      {/* Add visual details for specific objects */}
      {object.type === 'toilet' && (
        <mesh position={[0, 0.15, -0.15]} castShadow>
          <boxGeometry args={[0.35, 0.3, 0.2]} />
          <meshStandardMaterial color={isSelected ? '#06b6d4' : '#f5f5f5'} roughness={0.3} />
        </mesh>
      )}
      
      {object.type === 'chair' && (
        <mesh position={[0, 0.25, -0.15]} castShadow>
          <boxGeometry args={[0.4, 0.5, 0.05]} />
          <meshStandardMaterial color={getColor()} roughness={0.7} />
        </mesh>
      )}
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

// Ghost object for placement preview
function GhostObject({
  type,
  position,
}: {
  type: string;
  position: { x: number; y: number; z: number };
}) {
  const getDimensions = (): [number, number, number] => {
    switch (type) {
      case 'toilet': return [0.4, 0.4, 0.6];
      case 'sink': return [0.5, 0.2, 0.4];
      case 'shower': return [0.9, 2.0, 0.9];
      case 'bathtub': return [1.7, 0.5, 0.7];
      case 'kitchen-lower': return [0.6, 0.85, 0.6];
      case 'kitchen-upper': return [0.6, 0.6, 0.35];
      case 'closet': return [1.2, 2.2, 0.6];
      case 'bed-single': return [0.9, 0.5, 1.9];
      case 'bed-double': return [1.6, 0.5, 2.0];
      case 'sofa': return [2.0, 0.8, 0.9];
      case 'table': return [1.2, 0.75, 0.8];
      case 'chair': return [0.45, 0.9, 0.45];
      case 'ac-unit': return [0.8, 0.25, 0.2];
      case 'outlet': return [0.08, 0.12, 0.02];
      case 'switch': return [0.08, 0.08, 0.02];
      case 'light': return [0.4, 0.1, 0.4];
      default: return [0.5, 0.5, 0.5];
    }
  };
  
  const dimensions = getDimensions();
  
  return (
    <mesh position={[position.x, position.y + dimensions[1] / 2, position.z]}>
      <boxGeometry args={dimensions} />
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

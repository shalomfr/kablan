'use client';

import { create } from 'zustand';
import { Room3D, Wall3D, Door3D, Window3D, Object3D, Material3D } from '@/types';

type Tool = 'select' | 'wall' | 'door' | 'window' | 'object' | 'measure' | 'material' | 'camera';
type ViewMode = '2d' | '3d' | 'walk';

interface BuilderState {
  // Current room/space
  currentRoom: Room3D | null;
  
  // Selected elements
  selectedWall: string | null;
  selectedDoor: string | null;
  selectedWindow: string | null;
  selectedObject: string | null;
  
  // Current tool
  currentTool: Tool;
  
  // View mode
  viewMode: ViewMode;
  
  // Grid settings
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  
  // Wall drawing state
  isDrawingWall: boolean;
  wallStartPoint: { x: number; y: number } | null;
  tempWallEnd: { x: number; y: number } | null;
  
  // Default settings
  defaultWallHeight: number;
  defaultWallThickness: number;
  defaultMaterial: Material3D | null;
  
  // Actions
  setCurrentRoom: (room: Room3D | null) => void;
  createNewRoom: (name: string) => void;
  
  setSelectedWall: (id: string | null) => void;
  setSelectedDoor: (id: string | null) => void;
  setSelectedWindow: (id: string | null) => void;
  setSelectedObject: (id: string | null) => void;
  clearSelection: () => void;
  
  setCurrentTool: (tool: Tool) => void;
  setViewMode: (mode: ViewMode) => void;
  
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGrid: (show: boolean) => void;
  
  startDrawingWall: (point: { x: number; y: number }) => void;
  updateTempWall: (point: { x: number; y: number }) => void;
  finishDrawingWall: () => void;
  cancelDrawingWall: () => void;
  
  addWall: (wall: Wall3D) => void;
  updateWall: (id: string, wall: Partial<Wall3D>) => void;
  removeWall: (id: string) => void;
  
  addDoor: (door: Door3D) => void;
  updateDoor: (id: string, door: Partial<Door3D>) => void;
  removeDoor: (id: string) => void;
  
  addWindow: (window: Window3D) => void;
  updateWindow: (id: string, window: Partial<Window3D>) => void;
  removeWindow: (id: string) => void;
  
  addObject: (object: Object3D) => void;
  updateObject: (id: string, object: Partial<Object3D>) => void;
  removeObject: (id: string) => void;
  
  setDefaultMaterial: (material: Material3D | null) => void;
  applyMaterialToSelected: (material: Material3D) => void;
  
  reset: () => void;
}

const initialRoom: Room3D = {
  id: crypto.randomUUID(),
  name: 'חדר חדש',
  walls: [],
  floor: { area: 0 },
  ceiling: { height: 2.7 },
  doors: [],
  windows: [],
  objects: [],
};

const initialState = {
  currentRoom: null,
  selectedWall: null,
  selectedDoor: null,
  selectedWindow: null,
  selectedObject: null,
  currentTool: 'select' as Tool,
  viewMode: '3d' as ViewMode,
  gridSize: 0.1,
  snapToGrid: true,
  showGrid: true,
  isDrawingWall: false,
  wallStartPoint: null,
  tempWallEnd: null,
  defaultWallHeight: 2.7,
  defaultWallThickness: 0.2,
  defaultMaterial: null,
};

export const useBuilderStore = create<BuilderState>()((set, get) => ({
  ...initialState,
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  createNewRoom: (name) => set({
    currentRoom: { ...initialRoom, id: crypto.randomUUID(), name },
  }),
  
  setSelectedWall: (id) => set({ 
    selectedWall: id,
    selectedDoor: null,
    selectedWindow: null,
    selectedObject: null,
  }),
  
  setSelectedDoor: (id) => set({
    selectedWall: null,
    selectedDoor: id,
    selectedWindow: null,
    selectedObject: null,
  }),
  
  setSelectedWindow: (id) => set({
    selectedWall: null,
    selectedDoor: null,
    selectedWindow: id,
    selectedObject: null,
  }),
  
  setSelectedObject: (id) => set({
    selectedWall: null,
    selectedDoor: null,
    selectedWindow: null,
    selectedObject: id,
  }),
  
  clearSelection: () => set({
    selectedWall: null,
    selectedDoor: null,
    selectedWindow: null,
    selectedObject: null,
  }),
  
  setCurrentTool: (tool) => set({ currentTool: tool }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setGridSize: (size) => set({ gridSize: size }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setShowGrid: (show) => set({ showGrid: show }),
  
  startDrawingWall: (point) => set({
    isDrawingWall: true,
    wallStartPoint: point,
    tempWallEnd: point,
  }),
  
  updateTempWall: (point) => {
    const { snapToGrid, gridSize } = get();
    const snappedPoint = snapToGrid
      ? {
          x: Math.round(point.x / gridSize) * gridSize,
          y: Math.round(point.y / gridSize) * gridSize,
        }
      : point;
    set({ tempWallEnd: snappedPoint });
  },
  
  finishDrawingWall: () => {
    const { wallStartPoint, tempWallEnd, currentRoom, defaultWallHeight, defaultWallThickness } = get();
    
    if (!wallStartPoint || !tempWallEnd || !currentRoom) {
      get().cancelDrawingWall();
      return;
    }
    
    const distance = Math.sqrt(
      Math.pow(tempWallEnd.x - wallStartPoint.x, 2) +
      Math.pow(tempWallEnd.y - wallStartPoint.y, 2)
    );
    
    if (distance < 0.1) {
      get().cancelDrawingWall();
      return;
    }
    
    const newWall: Wall3D = {
      id: crypto.randomUUID(),
      start: wallStartPoint,
      end: tempWallEnd,
      height: defaultWallHeight,
      thickness: defaultWallThickness,
      openings: [],
    };
    
    set({
      currentRoom: {
        ...currentRoom,
        walls: [...currentRoom.walls, newWall],
      },
      isDrawingWall: false,
      wallStartPoint: tempWallEnd,
      tempWallEnd: tempWallEnd,
    });
  },
  
  cancelDrawingWall: () => set({
    isDrawingWall: false,
    wallStartPoint: null,
    tempWallEnd: null,
  }),
  
  addWall: (wall) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        walls: [...currentRoom.walls, wall],
      },
    });
  },
  
  updateWall: (id, wall) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        walls: currentRoom.walls.map((w) => w.id === id ? { ...w, ...wall } : w),
      },
    });
  },
  
  removeWall: (id) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        walls: currentRoom.walls.filter((w) => w.id !== id),
      },
      selectedWall: null,
    });
  },
  
  addDoor: (door) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        doors: [...currentRoom.doors, door],
      },
    });
  },
  
  updateDoor: (id, door) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        doors: currentRoom.doors.map((d) => d.id === id ? { ...d, ...door } : d),
      },
    });
  },
  
  removeDoor: (id) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        doors: currentRoom.doors.filter((d) => d.id !== id),
      },
      selectedDoor: null,
    });
  },
  
  addWindow: (window) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        windows: [...currentRoom.windows, window],
      },
    });
  },
  
  updateWindow: (id, window) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        windows: currentRoom.windows.map((w) => w.id === id ? { ...w, ...window } : w),
      },
    });
  },
  
  removeWindow: (id) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        windows: currentRoom.windows.filter((w) => w.id !== id),
      },
      selectedWindow: null,
    });
  },
  
  addObject: (object) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        objects: [...currentRoom.objects, object],
      },
    });
  },
  
  updateObject: (id, object) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        objects: currentRoom.objects.map((o) => o.id === id ? { ...o, ...object } : o),
      },
    });
  },
  
  removeObject: (id) => {
    const { currentRoom } = get();
    if (!currentRoom) return;
    set({
      currentRoom: {
        ...currentRoom,
        objects: currentRoom.objects.filter((o) => o.id !== id),
      },
      selectedObject: null,
    });
  },
  
  setDefaultMaterial: (material) => set({ defaultMaterial: material }),
  
  applyMaterialToSelected: (material) => {
    const { selectedWall, selectedDoor, selectedWindow, selectedObject, currentRoom } = get();
    if (!currentRoom) return;
    
    if (selectedWall) {
      get().updateWall(selectedWall, { material });
    } else if (selectedDoor) {
      get().updateDoor(selectedDoor, { material });
    } else if (selectedWindow) {
      get().updateWindow(selectedWindow, { material });
    } else if (selectedObject) {
      get().updateObject(selectedObject, { material });
    }
  },
  
  reset: () => set(initialState),
}));



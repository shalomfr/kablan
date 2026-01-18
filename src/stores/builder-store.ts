'use client';

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Room3D, Wall3D, Door3D, Window3D, Object3D, Material3D } from '@/types';

// Types
type Tool = 'select' | 'wall' | 'door' | 'window' | 'object' | 'measure' | 'material' | 'camera';
type ViewMode = '2d' | '3d' | 'walk';
type ObjectCategory = 'furniture' | 'fixture' | 'electrical' | 'hvac' | 'decoration';
type TransformMode = 'translate' | 'rotate' | 'scale';

// History action types
interface HistoryAction {
  type: string;
  timestamp: number;
  data: Room3D;
}

// Measurement types
interface Measurement {
  id: string;
  start: { x: number; y: number; z: number };
  end: { x: number; y: number; z: number };
  distance: number;
}

// Clipboard types
interface ClipboardItem {
  type: 'wall' | 'door' | 'window' | 'object';
  data: Wall3D | Door3D | Window3D | Object3D;
}

// Group types
interface ElementGroup {
  id: string;
  name: string;
  elements: string[];
  isVisible: boolean;
  isLocked: boolean;
}

// Layer types
interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
  color: string;
}

interface BuilderState {
  // Project info
  projectName: string;
  projectId: string;
  
  // Current room/space
  currentRoom: Room3D | null;
  
  // Selected elements (support multi-select)
  selectedWall: string | null;
  selectedDoor: string | null;
  selectedWindow: string | null;
  selectedObject: string | null;
  selectedElements: string[];
  
  // Current tool
  currentTool: Tool;
  transformMode: TransformMode;
  
  // View mode
  viewMode: ViewMode;
  
  // Grid settings
  gridSize: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showMeasurements: boolean;
  
  // Wall drawing state
  isDrawingWall: boolean;
  wallStartPoint: { x: number; y: number } | null;
  tempWallEnd: { x: number; y: number } | null;
  
  // Object placement state
  placementObject: string | null;
  placementObjectCategory: ObjectCategory | null;
  placementPosition: { x: number; y: number; z: number } | null;
  
  // Dragging state
  isDragging: boolean;
  draggedElement: string | null;
  
  // Measurement state
  isMeasuring: boolean;
  measureStart: { x: number; y: number; z: number } | null;
  measureEnd: { x: number; y: number; z: number } | null;
  measurements: Measurement[];
  
  // Default settings
  defaultWallHeight: number;
  defaultWallThickness: number;
  defaultMaterial: Material3D | null;
  
  // History (Undo/Redo)
  history: HistoryAction[];
  historyIndex: number;
  maxHistoryLength: number;
  
  // Clipboard
  clipboard: ClipboardItem | null;
  
  // Locked elements
  lockedElements: string[];

  // Groups
  groups: ElementGroup[];

  // Layers
  layers: Layer[];
  activeLayer: string;

  // Hidden elements
  hiddenElements: string[];

  // Floor textures
  floorTexture: string;
  wallTexture: string;
  
  // Camera state for walk mode
  walkPosition: { x: number; y: number; z: number };
  walkRotation: { x: number; y: number };
  
  // Actions - Project
  setProjectName: (name: string) => void;
  saveProject: () => string;
  loadProject: (json: string) => void;
  
  // Actions - Room
  setCurrentRoom: (room: Room3D | null) => void;
  createNewRoom: (name: string) => void;
  
  // Actions - Selection
  setSelectedWall: (id: string | null) => void;
  setSelectedDoor: (id: string | null) => void;
  setSelectedWindow: (id: string | null) => void;
  setSelectedObject: (id: string | null) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Actions - Tools
  setCurrentTool: (tool: Tool) => void;
  setTransformMode: (mode: TransformMode) => void;
  setViewMode: (mode: ViewMode) => void;
  
  // Actions - Grid
  setGridSize: (size: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setShowMeasurements: (show: boolean) => void;
  
  // Actions - Wall drawing
  startDrawingWall: (point: { x: number; y: number }) => void;
  updateTempWall: (point: { x: number; y: number }) => void;
  finishDrawingWall: () => void;
  cancelDrawingWall: () => void;
  
  // Actions - Object placement
  startPlacingObject: (objectType: string, category: ObjectCategory) => void;
  setPlacementPosition: (position: { x: number; y: number; z: number }) => void;
  placeObject: () => void;
  cancelPlacement: () => void;
  
  // Actions - Dragging
  startDragging: (elementId: string) => void;
  updateDragPosition: (position: { x: number; y: number; z: number }) => void;
  endDragging: () => void;
  
  // Actions - Measurement
  startMeasuring: (point: { x: number; y: number; z: number }) => void;
  updateMeasureEnd: (point: { x: number; y: number; z: number }) => void;
  finishMeasuring: () => void;
  clearMeasurements: () => void;
  
  // Actions - CRUD
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
  
  // Actions - Materials/Textures
  setDefaultMaterial: (material: Material3D | null) => void;
  applyMaterialToSelected: (material: Material3D) => void;
  setFloorTexture: (texture: string) => void;
  setWallTexture: (texture: string) => void;
  
  // Actions - Delete
  deleteSelected: () => void;
  deleteMultiple: (ids: string[]) => void;
  
  // Actions - History (Undo/Redo)
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Actions - Clipboard
  copy: () => void;
  paste: () => void;
  duplicate: () => void;
  
  // Actions - Lock
  lockElement: (id: string) => void;
  unlockElement: (id: string) => void;
  isLocked: (id: string) => boolean;

  // Actions - Groups
  createGroup: (name: string, elementIds: string[]) => void;
  deleteGroup: (groupId: string) => void;
  addToGroup: (groupId: string, elementId: string) => void;
  removeFromGroup: (groupId: string, elementId: string) => void;
  toggleGroupVisibility: (groupId: string) => void;
  toggleGroupLock: (groupId: string) => void;
  selectGroup: (groupId: string) => void;

  // Actions - Layers
  createLayer: (name: string) => void;
  deleteLayer: (layerId: string) => void;
  setActiveLayer: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;

  // Actions - Visibility
  hideElement: (id: string) => void;
  showElement: (id: string) => void;
  toggleElementVisibility: (id: string) => void;
  isHidden: (id: string) => boolean;
  showAll: () => void;
  
  // Actions - Walk mode
  setWalkPosition: (position: { x: number; y: number; z: number }) => void;
  setWalkRotation: (rotation: { x: number; y: number }) => void;
  
  // Actions - Utilities
  getSelectedElement: () => { type: string; element: Wall3D | Door3D | Window3D | Object3D | null };
  calculateRoomArea: () => number;
  calculateRoomPerimeter: () => number;
  getWallLength: (wallId: string) => number;
  
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
  projectName: 'פרויקט חדש',
  projectId: crypto.randomUUID(),
  currentRoom: null as Room3D | null,
  selectedWall: null as string | null,
  selectedDoor: null as string | null,
  selectedWindow: null as string | null,
  selectedObject: null as string | null,
  selectedElements: [] as string[],
  currentTool: 'select' as Tool,
  transformMode: 'translate' as TransformMode,
  viewMode: '3d' as ViewMode,
  gridSize: 0.5,
  snapToGrid: true,
  showGrid: true,
  showMeasurements: true,
  isDrawingWall: false,
  wallStartPoint: null as { x: number; y: number } | null,
  tempWallEnd: null as { x: number; y: number } | null,
  placementObject: null as string | null,
  placementObjectCategory: null as ObjectCategory | null,
  placementPosition: null as { x: number; y: number; z: number } | null,
  isDragging: false,
  draggedElement: null as string | null,
  isMeasuring: false,
  measureStart: null as { x: number; y: number; z: number } | null,
  measureEnd: null as { x: number; y: number; z: number } | null,
  measurements: [] as Measurement[],
  defaultWallHeight: 2.7,
  defaultWallThickness: 0.2,
  defaultMaterial: null as Material3D | null,
  history: [] as HistoryAction[],
  historyIndex: -1,
  maxHistoryLength: 50,
  clipboard: null as ClipboardItem | null,
  lockedElements: [] as string[],
  groups: [] as ElementGroup[],
  layers: [
    { id: 'default', name: 'שכבה ראשית', isVisible: true, isLocked: false, color: '#06b6d4' },
  ] as Layer[],
  activeLayer: 'default',
  hiddenElements: [] as string[],
  floorTexture: 'default',
  wallTexture: 'default',
  walkPosition: { x: 0, y: 1.7, z: 0 },
  walkRotation: { x: 0, y: 0 },
};

export const useBuilderStore = create<BuilderState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Project actions
        setProjectName: (name) => set({ projectName: name }),
        
        saveProject: () => {
          const state = get();
          const projectData = {
            projectName: state.projectName,
            projectId: state.projectId,
            currentRoom: state.currentRoom,
            floorTexture: state.floorTexture,
            wallTexture: state.wallTexture,
            measurements: state.measurements,
          };
          return JSON.stringify(projectData, null, 2);
        },
        
        loadProject: (json) => {
          try {
            const data = JSON.parse(json);
            set({
              projectName: data.projectName || 'פרויקט מיובא',
              projectId: data.projectId || crypto.randomUUID(),
              currentRoom: data.currentRoom,
              floorTexture: data.floorTexture || 'default',
              wallTexture: data.wallTexture || 'default',
              measurements: data.measurements || [],
              history: [],
              historyIndex: -1,
            });
            get().saveToHistory();
          } catch (e) {
            console.error('Failed to load project:', e);
          }
        },
        
        // Room actions
        setCurrentRoom: (room) => {
          set({ currentRoom: room });
          get().saveToHistory();
        },
        
        createNewRoom: (name) => {
          set({
            currentRoom: { ...initialRoom, id: crypto.randomUUID(), name },
            history: [],
            historyIndex: -1,
          });
          get().saveToHistory();
        },
        
        // Selection actions
        setSelectedWall: (id) => set({ 
          selectedWall: id,
          selectedDoor: null,
          selectedWindow: null,
          selectedObject: null,
          selectedElements: id ? [id] : [],
        }),
        
        setSelectedDoor: (id) => set({
          selectedWall: null,
          selectedDoor: id,
          selectedWindow: null,
          selectedObject: null,
          selectedElements: id ? [id] : [],
        }),
        
        setSelectedWindow: (id) => set({
          selectedWall: null,
          selectedDoor: null,
          selectedWindow: id,
          selectedObject: null,
          selectedElements: id ? [id] : [],
        }),
        
        setSelectedObject: (id) => set({
          selectedWall: null,
          selectedDoor: null,
          selectedWindow: null,
          selectedObject: id,
          selectedElements: id ? [id] : [],
        }),
        
        addToSelection: (id) => {
          const { selectedElements } = get();
          if (!selectedElements.includes(id)) {
            set({ selectedElements: [...selectedElements, id] });
          }
        },
        
        removeFromSelection: (id) => {
          const { selectedElements } = get();
          set({ selectedElements: selectedElements.filter(e => e !== id) });
        },
        
        clearSelection: () => set({
          selectedWall: null,
          selectedDoor: null,
          selectedWindow: null,
          selectedObject: null,
          selectedElements: [],
        }),
        
        selectAll: () => {
          const { currentRoom } = get();
          if (!currentRoom) return;
          const allIds = [
            ...currentRoom.walls.map(w => w.id),
            ...currentRoom.doors.map(d => d.id),
            ...currentRoom.windows.map(w => w.id),
            ...currentRoom.objects.map(o => o.id),
          ];
          set({ selectedElements: allIds });
        },
        
        // Tool actions
        setCurrentTool: (tool) => {
          const state = get();
          if (state.isDrawingWall) {
            get().cancelDrawingWall();
          }
          if (state.placementObject) {
            get().cancelPlacement();
          }
          if (state.isMeasuring) {
            set({ isMeasuring: false, measureStart: null, measureEnd: null });
          }
          set({ currentTool: tool });
        },
        
        setTransformMode: (mode) => set({ transformMode: mode }),
        setViewMode: (mode) => set({ viewMode: mode }),
        
        // Grid actions
        setGridSize: (size) => set({ gridSize: size }),
        setSnapToGrid: (snap) => set({ snapToGrid: snap }),
        setShowGrid: (show) => set({ showGrid: show }),
        setShowMeasurements: (show) => set({ showMeasurements: show }),
        
        // Wall drawing actions
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
          
          get().saveToHistory();
        },
        
        cancelDrawingWall: () => set({
          isDrawingWall: false,
          wallStartPoint: null,
          tempWallEnd: null,
        }),
        
        // Object placement actions
        startPlacingObject: (objectType, category) => set({
          placementObject: objectType,
          placementObjectCategory: category,
          placementPosition: null,
          currentTool: 'object',
        }),
        
        setPlacementPosition: (position) => set({
          placementPosition: position,
        }),
        
        placeObject: () => {
          const { placementObject, placementObjectCategory, placementPosition, currentRoom } = get();
          
          if (!placementObject || !placementObjectCategory || !placementPosition || !currentRoom) {
            return;
          }
          
          const newObject: Object3D = {
            id: crypto.randomUUID(),
            type: placementObject,
            category: placementObjectCategory,
            position: placementPosition,
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
          };
          
          set({
            currentRoom: {
              ...currentRoom,
              objects: [...currentRoom.objects, newObject],
            },
            placementPosition: null,
          });
          
          get().saveToHistory();
        },
        
        cancelPlacement: () => set({
          placementObject: null,
          placementObjectCategory: null,
          placementPosition: null,
          currentTool: 'select',
        }),
        
        // Dragging actions
        startDragging: (elementId) => {
          const { lockedElements } = get();
          if (lockedElements.includes(elementId)) return;
          set({ isDragging: true, draggedElement: elementId });
        },
        
        updateDragPosition: (position) => {
          const { draggedElement, currentRoom, snapToGrid, gridSize } = get();
          if (!draggedElement || !currentRoom) return;
          
          const snappedPosition = snapToGrid
            ? {
                x: Math.round(position.x / gridSize) * gridSize,
                y: position.y,
                z: Math.round(position.z / gridSize) * gridSize,
              }
            : position;
          
          // Check if it's an object
          const obj = currentRoom.objects.find(o => o.id === draggedElement);
          if (obj) {
            set({
              currentRoom: {
                ...currentRoom,
                objects: currentRoom.objects.map(o => 
                  o.id === draggedElement ? { ...o, position: snappedPosition } : o
                ),
              },
            });
          }
          
          // Check if it's a door
          const door = currentRoom.doors.find(d => d.id === draggedElement);
          if (door) {
            set({
              currentRoom: {
                ...currentRoom,
                doors: currentRoom.doors.map(d => 
                  d.id === draggedElement ? { ...d, position: snappedPosition } : d
                ),
              },
            });
          }
          
          // Check if it's a window
          const window = currentRoom.windows.find(w => w.id === draggedElement);
          if (window) {
            set({
              currentRoom: {
                ...currentRoom,
                windows: currentRoom.windows.map(w => 
                  w.id === draggedElement ? { ...w, position: snappedPosition } : w
                ),
              },
            });
          }
        },
        
        endDragging: () => {
          set({ isDragging: false, draggedElement: null });
          get().saveToHistory();
        },
        
        // Measurement actions
        startMeasuring: (point) => set({
          isMeasuring: true,
          measureStart: point,
          measureEnd: point,
        }),
        
        updateMeasureEnd: (point) => {
          const { snapToGrid, gridSize } = get();
          const snappedPoint = snapToGrid
            ? {
                x: Math.round(point.x / gridSize) * gridSize,
                y: point.y,
                z: Math.round(point.z / gridSize) * gridSize,
              }
            : point;
          set({ measureEnd: snappedPoint });
        },
        
        finishMeasuring: () => {
          const { measureStart, measureEnd, measurements } = get();
          if (!measureStart || !measureEnd) return;
          
          const distance = Math.sqrt(
            Math.pow(measureEnd.x - measureStart.x, 2) +
            Math.pow(measureEnd.y - measureStart.y, 2) +
            Math.pow(measureEnd.z - measureStart.z, 2)
          );
          
          const newMeasurement: Measurement = {
            id: crypto.randomUUID(),
            start: measureStart,
            end: measureEnd,
            distance,
          };
          
          set({
            measurements: [...measurements, newMeasurement],
            isMeasuring: false,
            measureStart: null,
            measureEnd: null,
          });
        },
        
        clearMeasurements: () => set({ measurements: [] }),
        
        // CRUD actions
        addWall: (wall) => {
          const { currentRoom } = get();
          if (!currentRoom) return;
          set({
            currentRoom: {
              ...currentRoom,
              walls: [...currentRoom.walls, wall],
            },
          });
          get().saveToHistory();
        },
        
        updateWall: (id, wall) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              walls: currentRoom.walls.map((w) => w.id === id ? { ...w, ...wall } : w),
            },
          });
        },
        
        removeWall: (id) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              walls: currentRoom.walls.filter((w) => w.id !== id),
            },
            selectedWall: null,
          });
          get().saveToHistory();
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
          get().saveToHistory();
        },
        
        updateDoor: (id, door) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              doors: currentRoom.doors.map((d) => d.id === id ? { ...d, ...door } : d),
            },
          });
        },
        
        removeDoor: (id) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              doors: currentRoom.doors.filter((d) => d.id !== id),
            },
            selectedDoor: null,
          });
          get().saveToHistory();
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
          get().saveToHistory();
        },
        
        updateWindow: (id, window) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              windows: currentRoom.windows.map((w) => w.id === id ? { ...w, ...window } : w),
            },
          });
        },
        
        removeWindow: (id) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              windows: currentRoom.windows.filter((w) => w.id !== id),
            },
            selectedWindow: null,
          });
          get().saveToHistory();
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
          get().saveToHistory();
        },
        
        updateObject: (id, object) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              objects: currentRoom.objects.map((o) => o.id === id ? { ...o, ...object } : o),
            },
          });
        },
        
        removeObject: (id) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom || lockedElements.includes(id)) return;
          set({
            currentRoom: {
              ...currentRoom,
              objects: currentRoom.objects.filter((o) => o.id !== id),
            },
            selectedObject: null,
          });
          get().saveToHistory();
        },
        
        // Material/Texture actions
        setDefaultMaterial: (material) => set({ defaultMaterial: material }),
        
        applyMaterialToSelected: (material) => {
          const { selectedWall, selectedDoor, selectedWindow, selectedObject } = get();
          
          if (selectedWall) {
            get().updateWall(selectedWall, { material });
          } else if (selectedDoor) {
            get().updateDoor(selectedDoor, { material });
          } else if (selectedWindow) {
            get().updateWindow(selectedWindow, { material });
          } else if (selectedObject) {
            get().updateObject(selectedObject, { material });
          }
          get().saveToHistory();
        },
        
        setFloorTexture: (texture) => set({ floorTexture: texture }),
        setWallTexture: (texture) => set({ wallTexture: texture }),
        
        // Delete actions
        deleteSelected: () => {
          const { selectedWall, selectedDoor, selectedWindow, selectedObject, lockedElements } = get();
          
          if (selectedWall && !lockedElements.includes(selectedWall)) {
            get().removeWall(selectedWall);
          } else if (selectedDoor && !lockedElements.includes(selectedDoor)) {
            get().removeDoor(selectedDoor);
          } else if (selectedWindow && !lockedElements.includes(selectedWindow)) {
            get().removeWindow(selectedWindow);
          } else if (selectedObject && !lockedElements.includes(selectedObject)) {
            get().removeObject(selectedObject);
          }
        },
        
        deleteMultiple: (ids) => {
          const { currentRoom, lockedElements } = get();
          if (!currentRoom) return;
          
          const idsToDelete = ids.filter(id => !lockedElements.includes(id));
          
          set({
            currentRoom: {
              ...currentRoom,
              walls: currentRoom.walls.filter(w => !idsToDelete.includes(w.id)),
              doors: currentRoom.doors.filter(d => !idsToDelete.includes(d.id)),
              windows: currentRoom.windows.filter(w => !idsToDelete.includes(w.id)),
              objects: currentRoom.objects.filter(o => !idsToDelete.includes(o.id)),
            },
            selectedElements: [],
            selectedWall: null,
            selectedDoor: null,
            selectedWindow: null,
            selectedObject: null,
          });
          get().saveToHistory();
        },
        
        // History (Undo/Redo) actions
        saveToHistory: () => {
          const { currentRoom, history, historyIndex, maxHistoryLength } = get();
          if (!currentRoom) return;
          
          const newAction: HistoryAction = {
            type: 'state',
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(currentRoom)),
          };
          
          // Remove any redo history
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(newAction);
          
          // Limit history length
          if (newHistory.length > maxHistoryLength) {
            newHistory.shift();
          }
          
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
          });
        },
        
        undo: () => {
          const { history, historyIndex } = get();
          if (historyIndex <= 0) return;
          
          const newIndex = historyIndex - 1;
          const previousState = history[newIndex];
          
          set({
            currentRoom: JSON.parse(JSON.stringify(previousState.data)),
            historyIndex: newIndex,
            selectedWall: null,
            selectedDoor: null,
            selectedWindow: null,
            selectedObject: null,
            selectedElements: [],
          });
        },
        
        redo: () => {
          const { history, historyIndex } = get();
          if (historyIndex >= history.length - 1) return;
          
          const newIndex = historyIndex + 1;
          const nextState = history[newIndex];
          
          set({
            currentRoom: JSON.parse(JSON.stringify(nextState.data)),
            historyIndex: newIndex,
            selectedWall: null,
            selectedDoor: null,
            selectedWindow: null,
            selectedObject: null,
            selectedElements: [],
          });
        },
        
        canUndo: () => {
          const { historyIndex } = get();
          return historyIndex > 0;
        },
        
        canRedo: () => {
          const { history, historyIndex } = get();
          return historyIndex < history.length - 1;
        },
        
        // Clipboard actions
        copy: () => {
          const { selectedWall, selectedDoor, selectedWindow, selectedObject, currentRoom } = get();
          if (!currentRoom) return;
          
          if (selectedWall) {
            const wall = currentRoom.walls.find(w => w.id === selectedWall);
            if (wall) set({ clipboard: { type: 'wall', data: { ...wall } } });
          } else if (selectedDoor) {
            const door = currentRoom.doors.find(d => d.id === selectedDoor);
            if (door) set({ clipboard: { type: 'door', data: { ...door } } });
          } else if (selectedWindow) {
            const window = currentRoom.windows.find(w => w.id === selectedWindow);
            if (window) set({ clipboard: { type: 'window', data: { ...window } } });
          } else if (selectedObject) {
            const object = currentRoom.objects.find(o => o.id === selectedObject);
            if (object) set({ clipboard: { type: 'object', data: { ...object } } });
          }
        },
        
        paste: () => {
          const { clipboard, currentRoom } = get();
          if (!clipboard || !currentRoom) return;
          
          const offset = 0.5; // Offset to avoid overlapping
          
          switch (clipboard.type) {
            case 'wall': {
              const wall = clipboard.data as Wall3D;
              const newWall: Wall3D = {
                ...wall,
                id: crypto.randomUUID(),
                start: { x: wall.start.x + offset, y: wall.start.y + offset },
                end: { x: wall.end.x + offset, y: wall.end.y + offset },
              };
              get().addWall(newWall);
              get().setSelectedWall(newWall.id);
              break;
            }
            case 'door': {
              const door = clipboard.data as Door3D;
              const newDoor: Door3D = {
                ...door,
                id: crypto.randomUUID(),
                position: { ...door.position, x: door.position.x + offset, z: door.position.z + offset },
              };
              get().addDoor(newDoor);
              get().setSelectedDoor(newDoor.id);
              break;
            }
            case 'window': {
              const window = clipboard.data as Window3D;
              const newWindow: Window3D = {
                ...window,
                id: crypto.randomUUID(),
                position: { ...window.position, x: window.position.x + offset, z: window.position.z + offset },
              };
              get().addWindow(newWindow);
              get().setSelectedWindow(newWindow.id);
              break;
            }
            case 'object': {
              const object = clipboard.data as Object3D;
              const newObject: Object3D = {
                ...object,
                id: crypto.randomUUID(),
                position: { ...object.position, x: object.position.x + offset, z: object.position.z + offset },
              };
              get().addObject(newObject);
              get().setSelectedObject(newObject.id);
              break;
            }
          }
        },
        
        duplicate: () => {
          get().copy();
          get().paste();
        },
        
        // Lock actions
        lockElement: (id) => {
          const { lockedElements } = get();
          if (!lockedElements.includes(id)) {
            set({ lockedElements: [...lockedElements, id] });
          }
        },
        
        unlockElement: (id) => {
          const { lockedElements } = get();
          set({ lockedElements: lockedElements.filter(e => e !== id) });
        },
        
        isLocked: (id) => {
          const { lockedElements } = get();
          return lockedElements.includes(id);
        },

        // Group actions
        createGroup: (name, elementIds) => {
          const { groups } = get();
          const newGroup: ElementGroup = {
            id: crypto.randomUUID(),
            name,
            elements: elementIds,
            isVisible: true,
            isLocked: false,
          };
          set({ groups: [...groups, newGroup] });
        },

        deleteGroup: (groupId) => {
          const { groups } = get();
          set({ groups: groups.filter(g => g.id !== groupId) });
        },

        addToGroup: (groupId, elementId) => {
          const { groups } = get();
          set({
            groups: groups.map(g =>
              g.id === groupId
                ? { ...g, elements: [...g.elements, elementId] }
                : g
            ),
          });
        },

        removeFromGroup: (groupId, elementId) => {
          const { groups } = get();
          set({
            groups: groups.map(g =>
              g.id === groupId
                ? { ...g, elements: g.elements.filter(e => e !== elementId) }
                : g
            ),
          });
        },

        toggleGroupVisibility: (groupId) => {
          const { groups, hiddenElements } = get();
          const group = groups.find(g => g.id === groupId);
          if (!group) return;

          if (group.isVisible) {
            // Hide all elements in group
            set({
              groups: groups.map(g => g.id === groupId ? { ...g, isVisible: false } : g),
              hiddenElements: [...hiddenElements, ...group.elements],
            });
          } else {
            // Show all elements in group
            set({
              groups: groups.map(g => g.id === groupId ? { ...g, isVisible: true } : g),
              hiddenElements: hiddenElements.filter(e => !group.elements.includes(e)),
            });
          }
        },

        toggleGroupLock: (groupId) => {
          const { groups, lockedElements } = get();
          const group = groups.find(g => g.id === groupId);
          if (!group) return;

          if (group.isLocked) {
            // Unlock all elements in group
            set({
              groups: groups.map(g => g.id === groupId ? { ...g, isLocked: false } : g),
              lockedElements: lockedElements.filter(e => !group.elements.includes(e)),
            });
          } else {
            // Lock all elements in group
            set({
              groups: groups.map(g => g.id === groupId ? { ...g, isLocked: true } : g),
              lockedElements: [...lockedElements, ...group.elements],
            });
          }
        },

        selectGroup: (groupId) => {
          const { groups } = get();
          const group = groups.find(g => g.id === groupId);
          if (!group) return;
          set({ selectedElements: [...group.elements] });
        },

        // Layer actions
        createLayer: (name) => {
          const { layers } = get();
          const colors = ['#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          const newLayer: Layer = {
            id: crypto.randomUUID(),
            name,
            isVisible: true,
            isLocked: false,
            color: colors[layers.length % colors.length],
          };
          set({ layers: [...layers, newLayer] });
        },

        deleteLayer: (layerId) => {
          const { layers, activeLayer } = get();
          if (layers.length <= 1) return; // Keep at least one layer
          const newLayers = layers.filter(l => l.id !== layerId);
          set({
            layers: newLayers,
            activeLayer: activeLayer === layerId ? newLayers[0].id : activeLayer,
          });
        },

        setActiveLayer: (layerId) => set({ activeLayer: layerId }),

        toggleLayerVisibility: (layerId) => {
          const { layers } = get();
          set({
            layers: layers.map(l =>
              l.id === layerId ? { ...l, isVisible: !l.isVisible } : l
            ),
          });
        },

        toggleLayerLock: (layerId) => {
          const { layers } = get();
          set({
            layers: layers.map(l =>
              l.id === layerId ? { ...l, isLocked: !l.isLocked } : l
            ),
          });
        },

        // Visibility actions
        hideElement: (id) => {
          const { hiddenElements } = get();
          if (!hiddenElements.includes(id)) {
            set({ hiddenElements: [...hiddenElements, id] });
          }
        },

        showElement: (id) => {
          const { hiddenElements } = get();
          set({ hiddenElements: hiddenElements.filter(e => e !== id) });
        },

        toggleElementVisibility: (id) => {
          const { hiddenElements } = get();
          if (hiddenElements.includes(id)) {
            set({ hiddenElements: hiddenElements.filter(e => e !== id) });
          } else {
            set({ hiddenElements: [...hiddenElements, id] });
          }
        },

        isHidden: (id) => {
          const { hiddenElements } = get();
          return hiddenElements.includes(id);
        },

        showAll: () => set({ hiddenElements: [] }),

        // Walk mode actions
        setWalkPosition: (position) => set({ walkPosition: position }),
        setWalkRotation: (rotation) => set({ walkRotation: rotation }),
        
        // Utility actions
        getSelectedElement: () => {
          const { selectedWall, selectedDoor, selectedWindow, selectedObject, currentRoom } = get();
          
          if (!currentRoom) {
            return { type: 'none', element: null };
          }
          
          if (selectedWall) {
            const wall = currentRoom.walls.find((w) => w.id === selectedWall);
            return { type: 'wall', element: wall || null };
          }
          if (selectedDoor) {
            const door = currentRoom.doors.find((d) => d.id === selectedDoor);
            return { type: 'door', element: door || null };
          }
          if (selectedWindow) {
            const win = currentRoom.windows.find((w) => w.id === selectedWindow);
            return { type: 'window', element: win || null };
          }
          if (selectedObject) {
            const obj = currentRoom.objects.find((o) => o.id === selectedObject);
            return { type: 'object', element: obj || null };
          }
          
          return { type: 'none', element: null };
        },
        
        calculateRoomArea: () => {
          const { currentRoom } = get();
          if (!currentRoom || currentRoom.walls.length < 3) return 0;
          
          // Simple polygon area calculation using Shoelace formula
          const walls = currentRoom.walls;
          let area = 0;
          
          // Get all unique points
          const points: { x: number; y: number }[] = [];
          walls.forEach(wall => {
            if (!points.find(p => p.x === wall.start.x && p.y === wall.start.y)) {
              points.push(wall.start);
            }
            if (!points.find(p => p.x === wall.end.x && p.y === wall.end.y)) {
              points.push(wall.end);
            }
          });
          
          // Sort points clockwise
          const center = points.reduce((acc, p) => ({ x: acc.x + p.x / points.length, y: acc.y + p.y / points.length }), { x: 0, y: 0 });
          points.sort((a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x));
          
          // Calculate area using Shoelace
          for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].x * points[j].y;
            area -= points[j].x * points[i].y;
          }
          
          return Math.abs(area / 2);
        },
        
        calculateRoomPerimeter: () => {
          const { currentRoom } = get();
          if (!currentRoom) return 0;
          
          return currentRoom.walls.reduce((acc, wall) => {
            const length = Math.sqrt(
              Math.pow(wall.end.x - wall.start.x, 2) +
              Math.pow(wall.end.y - wall.start.y, 2)
            );
            return acc + length;
          }, 0);
        },
        
        getWallLength: (wallId) => {
          const { currentRoom } = get();
          if (!currentRoom) return 0;
          
          const wall = currentRoom.walls.find(w => w.id === wallId);
          if (!wall) return 0;
          
          return Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) +
            Math.pow(wall.end.y - wall.start.y, 2)
          );
        },
        
        reset: () => set({
          ...initialState,
          projectId: crypto.randomUUID(),
        }),
      }),
      {
        name: 'builder-storage',
        partialize: (state) => ({
          projectName: state.projectName,
          projectId: state.projectId,
          currentRoom: state.currentRoom,
          floorTexture: state.floorTexture,
          wallTexture: state.wallTexture,
          gridSize: state.gridSize,
          snapToGrid: state.snapToGrid,
          showGrid: state.showGrid,
          showMeasurements: state.showMeasurements,
          defaultWallHeight: state.defaultWallHeight,
          defaultWallThickness: state.defaultWallThickness,
        }),
      }
    )
  )
);

// Keyboard shortcuts hook
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    const store = useBuilderStore.getState();
    
    // Ctrl+Z - Undo
    if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      store.undo();
    }
    
    // Ctrl+Y or Ctrl+Shift+Z - Redo
    if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      store.redo();
    }
    
    // Ctrl+C - Copy
    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      store.copy();
    }
    
    // Ctrl+V - Paste
    if (e.ctrlKey && e.key === 'v') {
      e.preventDefault();
      store.paste();
    }
    
    // Ctrl+D - Duplicate
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      store.duplicate();
    }
    
    // Delete or Backspace - Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (store.selectedElements.length > 1) {
          store.deleteMultiple(store.selectedElements);
        } else {
          store.deleteSelected();
        }
      }
    }
    
    // Escape - Cancel current operation
    if (e.key === 'Escape') {
      store.cancelDrawingWall();
      store.cancelPlacement();
      store.clearSelection();
    }
    
    // Ctrl+A - Select all
    if (e.ctrlKey && e.key === 'a') {
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        store.selectAll();
      }
    }
    
    // G - Grab/Move mode
    if (e.key === 'g' && !e.ctrlKey) {
      store.setTransformMode('translate');
    }
    
    // R - Rotate mode
    if (e.key === 'r' && !e.ctrlKey) {
      store.setTransformMode('rotate');
    }
    
    // S - Scale mode (only when not in input)
    if (e.key === 's' && !e.ctrlKey) {
      const activeElement = document.activeElement;
      if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
        store.setTransformMode('scale');
      }
    }
  });
}

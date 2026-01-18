'use client';

import { useState, Suspense, useMemo, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBuilderStore } from '@/stores/builder-store';
import { FloorPlan2D } from './floor-plan-2d';
import type { Wall3D, Door3D, Window3D, Object3D } from '@/types';
import {
  MousePointer2,
  Square,
  DoorOpen,
  Maximize2,
  Package,
  Ruler,
  Palette,
  Camera,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Eye,
  Layers,
  Move3d,
  Box,
  Save,
  Download,
  Upload,
  Calculator,
  Loader2,
  Trash2,
  X,
  Copy,
  Clipboard,
  Lock,
  Unlock,
  Move,
  RefreshCw,
  Scaling,
  Info,
  Keyboard,
  FileJson,
  ImageIcon,
  ChevronDown,
  Undo2,
  Redo2,
  Settings,
  Layout,
  Map,
  MoreVertical,
  EyeOff,
} from 'lucide-react';

// Dynamically import the 3D canvas to avoid SSR issues
const Scene3D = dynamic(() => import('./scene-3d').then((mod) => mod.Scene3D), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center text-white">
        <Loader2 className="size-12 animate-spin mx-auto mb-4" />
        <p>טוען עורך תלת מימד...</p>
      </div>
    </div>
  ),
});

const tools = [
  { id: 'select', icon: MousePointer2, label: 'בחירה', shortcut: 'V' },
  { id: 'wall', icon: Square, label: 'קיר', shortcut: 'W' },
  { id: 'door', icon: DoorOpen, label: 'דלת', shortcut: 'D' },
  { id: 'window', icon: Maximize2, label: 'חלון', shortcut: 'N' },
  { id: 'object', icon: Package, label: 'אובייקט', shortcut: 'O' },
  { id: 'measure', icon: Ruler, label: 'מדידה', shortcut: 'M' },
  { id: 'material', icon: Palette, label: 'חומר', shortcut: 'P' },
  { id: 'camera', icon: Camera, label: 'מצלמה', shortcut: 'C' },
] as const;

const viewModes = [
  { id: '2d', icon: Layout, label: 'תוכנית קומה (2D)' },
  { id: '3d', icon: Box, label: 'תלת מימד (3D)' },
  { id: 'walk', icon: Eye, label: 'מצב סיור' },
] as const;

const transformModes = [
  { id: 'translate', icon: Move, label: 'הזזה', shortcut: 'G' },
  { id: 'rotate', icon: RefreshCw, label: 'סיבוב', shortcut: 'R' },
  { id: 'scale', icon: Scaling, label: 'קנה מידה', shortcut: 'S' },
] as const;

type ObjectCategory = 'furniture' | 'fixture' | 'electrical' | 'hvac' | 'decoration';

const objectLibrary: { id: string; name: string; category: string; builderCategory: ObjectCategory }[] = [
  { id: 'toilet', name: 'אסלה', category: 'fixtures', builderCategory: 'fixture' },
  { id: 'sink', name: 'כיור', category: 'fixtures', builderCategory: 'fixture' },
  { id: 'shower', name: 'מקלחון', category: 'fixtures', builderCategory: 'fixture' },
  { id: 'bathtub', name: 'אמבטיה', category: 'fixtures', builderCategory: 'fixture' },
  { id: 'kitchen-lower', name: 'ארון מטבח תחתון', category: 'furniture', builderCategory: 'furniture' },
  { id: 'kitchen-upper', name: 'ארון מטבח עליון', category: 'furniture', builderCategory: 'furniture' },
  { id: 'closet', name: 'ארון', category: 'furniture', builderCategory: 'furniture' },
  { id: 'bed-single', name: 'מיטה יחיד', category: 'furniture', builderCategory: 'furniture' },
  { id: 'bed-double', name: 'מיטה זוגית', category: 'furniture', builderCategory: 'furniture' },
  { id: 'sofa', name: 'ספה', category: 'furniture', builderCategory: 'furniture' },
  { id: 'table', name: 'שולחן', category: 'furniture', builderCategory: 'furniture' },
  { id: 'chair', name: 'כיסא', category: 'furniture', builderCategory: 'furniture' },
  { id: 'ac-unit', name: 'מזגן', category: 'electrical', builderCategory: 'hvac' },
  { id: 'outlet', name: 'שקע', category: 'electrical', builderCategory: 'electrical' },
  { id: 'switch', name: 'מתג', category: 'electrical', builderCategory: 'electrical' },
  { id: 'light', name: 'גוף תאורה', category: 'electrical', builderCategory: 'electrical' },
];

const materials = [
  { id: 'wall-white', name: 'קיר לבן', color: '#ffffff' },
  { id: 'wall-cream', name: 'קיר קרם', color: '#f5f5dc' },
  { id: 'wall-gray', name: 'קיר אפור', color: '#808080' },
  { id: 'floor-wood', name: 'פרקט עץ', color: '#8B4513' },
  { id: 'floor-tile', name: 'אריחי קרמיקה', color: '#d4d4d4' },
  { id: 'floor-marble', name: 'שיש', color: '#f0f0f0' },
  { id: 'ceiling-white', name: 'תקרה לבנה', color: '#fafafa' },
];

const floorTextures = [
  { id: 'default', name: 'ברירת מחדל', color: '#f5f5f5' },
  { id: 'wood', name: 'פרקט עץ', color: '#8B4513' },
  { id: 'tile', name: 'אריחים', color: '#d4d4d4' },
  { id: 'marble', name: 'שיש', color: '#f0f0f0' },
  { id: 'concrete', name: 'בטון', color: '#9CA3AF' },
];

const wallTextures = [
  { id: 'default', name: 'ברירת מחדל', color: '#e5e5e5' },
  { id: 'white', name: 'לבן', color: '#ffffff' },
  { id: 'cream', name: 'קרם', color: '#f5f5dc' },
  { id: 'gray', name: 'אפור', color: '#9CA3AF' },
  { id: 'brick', name: 'לבנים', color: '#8B4513' },
];

// Keyboard shortcuts dialog content
const keyboardShortcuts = [
  { key: 'Ctrl+Z', action: 'בטל פעולה (Undo)' },
  { key: 'Ctrl+Y', action: 'חזור על פעולה (Redo)' },
  { key: 'Ctrl+C', action: 'העתק' },
  { key: 'Ctrl+V', action: 'הדבק' },
  { key: 'Ctrl+D', action: 'שכפל' },
  { key: 'Ctrl+A', action: 'בחר הכל' },
  { key: 'Delete', action: 'מחק נבחר' },
  { key: 'Escape', action: 'בטל פעולה נוכחית' },
  { key: 'G', action: 'מצב הזזה' },
  { key: 'R', action: 'מצב סיבוב' },
  { key: 'S', action: 'מצב קנה מידה' },
];

export function Builder3DInterface() {
  const {
    currentRoom,
    projectName,
    currentTool,
    viewMode,
    gridSize,
    snapToGrid,
    showGrid,
    showMeasurements,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedObject,
    selectedElements,
    defaultWallHeight,
    defaultWallThickness,
    placementObject,
    transformMode,
    floorTexture,
    wallTexture,
    lockedElements,
    setProjectName,
    setCurrentTool,
    setViewMode,
    setTransformMode,
    setGridSize,
    setSnapToGrid,
    setShowGrid,
    setShowMeasurements,
    createNewRoom,
    clearSelection,
    deleteSelected,
    deleteMultiple,
    startPlacingObject,
    cancelPlacement,
    getSelectedElement,
    updateWall,
    updateDoor,
    updateWindow,
    updateObject,
    applyMaterialToSelected,
    undo,
    redo,
    canUndo,
    canRedo,
    copy,
    paste,
    duplicate,
    lockElement,
    unlockElement,
    isLocked,
    saveProject,
    loadProject,
    calculateRoomArea,
    calculateRoomPerimeter,
    clearMeasurements,
    setFloorTexture,
    setWallTexture,
  } = useBuilderStore();

  const [objectCategory, setObjectCategory] = useState<string>('all');
  const [showKeyboardDialog, setShowKeyboardDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [loadJson, setLoadJson] = useState('');
  const [showMinimap, setShowMinimap] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredObjects =
    objectCategory === 'all'
      ? objectLibrary
      : objectLibrary.filter((obj) => obj.category === objectCategory);

  const hasSelection = selectedWall || selectedDoor || selectedWindow || selectedObject;
  
  // Get the selected element details
  const selectedElementInfo = useMemo(() => {
    return getSelectedElement();
  }, [selectedWall, selectedDoor, selectedWindow, selectedObject, currentRoom, getSelectedElement]);

  // Check if selected element is locked
  const isSelectedLocked = useMemo(() => {
    const id = selectedWall || selectedDoor || selectedWindow || selectedObject;
    return id ? isLocked(id) : false;
  }, [selectedWall, selectedDoor, selectedWindow, selectedObject, isLocked]);

  // Handle object click in library
  const handleObjectClick = (obj: typeof objectLibrary[0]) => {
    if (!currentRoom) return;
    startPlacingObject(obj.id, obj.builderCategory);
  };

  // Handle material application
  const handleMaterialClick = (mat: typeof materials[0]) => {
    if (!hasSelection || isSelectedLocked) return;
    applyMaterialToSelected({
      id: mat.id,
      name: mat.name,
      color: mat.color,
      roughness: 0.8,
      metalness: 0.1,
    });
  };

  // Handle lock toggle
  const handleLockToggle = () => {
    const id = selectedWall || selectedDoor || selectedWindow || selectedObject;
    if (!id) return;
    
    if (isLocked(id)) {
      unlockElement(id);
    } else {
      lockElement(id);
    }
  };

  // Handle export
  const handleExportJSON = () => {
    const json = saveProject();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${projectName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImportJSON = () => {
    try {
      loadProject(loadJson);
      setShowLoadDialog(false);
      setLoadJson('');
    } catch (e) {
      alert('קובץ לא תקין');
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        loadProject(json);
        setShowLoadDialog(false);
      } catch (err) {
        alert('קובץ לא תקין');
      }
    };
    reader.readAsText(file);
  };

  // Render properties based on selected element type
  const renderSelectedProperties = () => {
    const { type, element } = selectedElementInfo;
    
    if (!element) return null;

    switch (type) {
      case 'wall': {
        const wall = element as Wall3D;
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">גובה (מ)</Label>
              <Input
                type="number"
                value={wall.height}
                step={0.1}
                min={1}
                max={5}
                disabled={isSelectedLocked}
                onChange={(e) => updateWall(wall.id, { height: parseFloat(e.target.value) || 2.7 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">עובי (מ)</Label>
              <Input
                type="number"
                value={wall.thickness}
                step={0.05}
                min={0.1}
                max={0.5}
                disabled={isSelectedLocked}
                onChange={(e) => updateWall(wall.id, { thickness: parseFloat(e.target.value) || 0.2 })}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>מתחיל: ({wall.start.x.toFixed(2)}, {wall.start.y.toFixed(2)})</p>
              <p>מסיים: ({wall.end.x.toFixed(2)}, {wall.end.y.toFixed(2)})</p>
              <p className="mt-1 font-medium">אורך: {Math.sqrt(
                Math.pow(wall.end.x - wall.start.x, 2) +
                Math.pow(wall.end.y - wall.start.y, 2)
              ).toFixed(2)} מ'</p>
            </div>
          </>
        );
      }
      case 'door': {
        const door = element as Door3D;
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">רוחב (מ)</Label>
              <Input
                type="number"
                value={door.width}
                step={0.1}
                min={0.6}
                max={2}
                disabled={isSelectedLocked}
                onChange={(e) => updateDoor(door.id, { width: parseFloat(e.target.value) || 0.9 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">גובה (מ)</Label>
              <Input
                type="number"
                value={door.height}
                step={0.1}
                min={1.8}
                max={2.5}
                disabled={isSelectedLocked}
                onChange={(e) => updateDoor(door.id, { height: parseFloat(e.target.value) || 2.1 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">סיבוב (מעלות)</Label>
              <Slider
                value={[door.rotation]}
                max={360}
                step={15}
                disabled={isSelectedLocked}
                onValueChange={([val]) => updateDoor(door.id, { rotation: val })}
              />
              <span className="text-xs text-muted-foreground">{door.rotation}°</span>
            </div>
          </>
        );
      }
      case 'window': {
        const win = element as Window3D;
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">רוחב (מ)</Label>
              <Input
                type="number"
                value={win.width}
                step={0.1}
                min={0.4}
                max={3}
                disabled={isSelectedLocked}
                onChange={(e) => updateWindow(win.id, { width: parseFloat(e.target.value) || 1.2 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">גובה (מ)</Label>
              <Input
                type="number"
                value={win.height}
                step={0.1}
                min={0.4}
                max={2}
                disabled={isSelectedLocked}
                onChange={(e) => updateWindow(win.id, { height: parseFloat(e.target.value) || 1.0 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">גובה מהרצפה (מ)</Label>
              <Input
                type="number"
                value={win.position.y}
                step={0.1}
                min={0.5}
                max={2}
                disabled={isSelectedLocked}
                onChange={(e) => updateWindow(win.id, { 
                  position: { ...win.position, y: parseFloat(e.target.value) || 1.2 } 
                })}
              />
            </div>
          </>
        );
      }
      case 'object': {
        const obj = element as Object3D;
        return (
          <>
            <div className="space-y-2">
              <Label className="text-xs">מיקום X</Label>
              <Input
                type="number"
                value={obj.position.x.toFixed(2)}
                step={0.1}
                disabled={isSelectedLocked}
                onChange={(e) => updateObject(obj.id, { 
                  position: { ...obj.position, x: parseFloat(e.target.value) || 0 } 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">מיקום Z</Label>
              <Input
                type="number"
                value={obj.position.z.toFixed(2)}
                step={0.1}
                disabled={isSelectedLocked}
                onChange={(e) => updateObject(obj.id, { 
                  position: { ...obj.position, z: parseFloat(e.target.value) || 0 } 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">סיבוב Y (מעלות)</Label>
              <Slider
                value={[obj.rotation?.y || 0]}
                max={360}
                step={15}
                disabled={isSelectedLocked}
                onValueChange={([val]) => updateObject(obj.id, { 
                  rotation: { ...(obj.rotation || { x: 0, y: 0, z: 0 }), y: val } 
                })}
              />
              <span className="text-xs text-muted-foreground">{obj.rotation?.y || 0}°</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">קנה מידה</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-[10px]">X</Label>
                  <Input
                    type="number"
                    value={(obj.scale?.x || 1).toFixed(1)}
                    step={0.1}
                    min={0.1}
                    max={3}
                    disabled={isSelectedLocked}
                    onChange={(e) => updateObject(obj.id, { 
                      scale: { ...(obj.scale || { x: 1, y: 1, z: 1 }), x: parseFloat(e.target.value) || 1 } 
                    })}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Y</Label>
                  <Input
                    type="number"
                    value={(obj.scale?.y || 1).toFixed(1)}
                    step={0.1}
                    min={0.1}
                    max={3}
                    disabled={isSelectedLocked}
                    onChange={(e) => updateObject(obj.id, { 
                      scale: { ...(obj.scale || { x: 1, y: 1, z: 1 }), y: parseFloat(e.target.value) || 1 } 
                    })}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Z</Label>
                  <Input
                    type="number"
                    value={(obj.scale?.z || 1).toFixed(1)}
                    step={0.1}
                    min={0.1}
                    max={3}
                    disabled={isSelectedLocked}
                    onChange={(e) => updateObject(obj.id, { 
                      scale: { ...(obj.scale || { x: 1, y: 1, z: 1 }), z: parseFloat(e.target.value) || 1 } 
                    })}
                  />
                </div>
              </div>
            </div>
          </>
        );
      }
      default:
        return null;
    }
  };

  const getSelectionTypeName = () => {
    const { type } = selectedElementInfo;
    switch (type) {
      case 'wall': return 'קיר';
      case 'door': return 'דלת';
      case 'window': return 'חלון';
      case 'object': return 'אובייקט';
      default: return '';
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Tools Panel */}
        <div className="w-16 border-l bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
          <div className="p-2 space-y-1">
            {tools.map((tool) => (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={currentTool === tool.id ? 'secondary' : 'ghost'}
                    size="icon"
                    className="w-full"
                    onClick={() => setCurrentTool(tool.id as typeof currentTool)}
                  >
                    <tool.icon className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{tool.label} <span className="text-muted-foreground">({tool.shortcut})</span></p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator className="my-2" />

          <div className="p-2 space-y-1">
            {viewModes.map((mode) => (
              <Tooltip key={mode.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === mode.id ? 'default' : 'ghost'}
                    size="icon"
                    className="w-full"
                    onClick={() => setViewMode(mode.id as typeof viewMode)}
                  >
                    <mode.icon className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{mode.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <Separator className="my-2" />

          {/* Transform mode buttons */}
          <div className="p-2 space-y-1">
            {transformModes.map((mode) => (
              <Tooltip key={mode.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={transformMode === mode.id ? 'secondary' : 'ghost'}
                    size="icon"
                    className="w-full"
                    onClick={() => setTransformMode(mode.id as typeof transformMode)}
                    disabled={!hasSelection || isSelectedLocked}
                  >
                    <mode.icon className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>{mode.label} <span className="text-muted-foreground">({mode.shortcut})</span></p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          <div className="mt-auto p-2 space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-full"
                  onClick={undo}
                  disabled={!canUndo()}
                >
                  <Undo2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>בטל <span className="text-muted-foreground">(Ctrl+Z)</span></p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-full"
                  onClick={redo}
                  disabled={!canRedo()}
                >
                  <Redo2 className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>חזור <span className="text-muted-foreground">(Ctrl+Y)</span></p>
              </TooltipContent>
            </Tooltip>
            
            <Separator className="my-2" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-full"
                  onClick={() => setShowKeyboardDialog(true)}
                >
                  <Keyboard className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>קיצורי מקלדת</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* 3D Canvas / 2D Floor Plan */}
        <div className="flex-1 relative bg-slate-800">
          {currentRoom ? (
            <>
              {viewMode === '2d' ? (
                <FloorPlan2D />
              ) : (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="size-12 animate-spin text-cyan-500" />
                    </div>
                  }
                >
                  <Scene3D />
                </Suspense>
              )}
              
              {/* Floating Toolbar */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copy}
                        disabled={!hasSelection}
                        className="text-white hover:bg-white/10"
                      >
                        <Copy className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>העתק (Ctrl+C)</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={paste}
                        className="text-white hover:bg-white/10"
                      >
                        <Clipboard className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>הדבק (Ctrl+V)</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={duplicate}
                        disabled={!hasSelection}
                        className="text-white hover:bg-white/10"
                      >
                        <Layers className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>שכפל (Ctrl+D)</TooltipContent>
                  </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-6 bg-slate-600" />
                
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLockToggle}
                        disabled={!hasSelection}
                        className="text-white hover:bg-white/10"
                      >
                        {isSelectedLocked ? <Lock className="size-4 text-amber-400" /> : <Unlock className="size-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isSelectedLocked ? 'בטל נעילה' : 'נעל אלמנט'}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deleteSelected}
                        disabled={!hasSelection || isSelectedLocked}
                        className="text-white hover:bg-white/10"
                      >
                        <Trash2 className="size-4 text-red-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>מחק (Delete)</TooltipContent>
                  </Tooltip>
                </div>
                
                <Separator orientation="vertical" className="h-6 bg-slate-600" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Download className="size-4 ml-1" />
                      ייצוא
                      <ChevronDown className="size-3 mr-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportJSON}>
                      <FileJson className="size-4 ml-2" />
                      ייצא כ-JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <ImageIcon className="size-4 ml-2" />
                      ייצא כתמונה
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      <Upload className="size-4 ml-1" />
                      ייבוא
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ייבוא פרויקט</DialogTitle>
                      <DialogDescription>
                        העלה קובץ JSON או הדבק את תוכן הפרויקט
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="size-4 ml-2" />
                          בחר קובץ JSON
                        </Button>
                      </div>
                      <div className="text-center text-sm text-muted-foreground">או</div>
                      <textarea
                        className="w-full h-32 p-2 border rounded-md text-sm font-mono"
                        placeholder="הדבק JSON כאן..."
                        value={loadJson}
                        onChange={(e) => setLoadJson(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLoadDialog(false)}>
                        ביטול
                      </Button>
                      <Button onClick={handleImportJSON} disabled={!loadJson}>
                        ייבא
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Minimap toggle */}
              <div className="absolute top-4 right-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMinimap(!showMinimap)}
                      className="bg-slate-900/80 text-white hover:bg-slate-800"
                    >
                      {showMinimap ? <EyeOff className="size-4" /> : <Map className="size-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showMinimap ? 'הסתר מפה מקטנה' : 'הצג מפה מקטנה'}</TooltipContent>
                </Tooltip>
              </div>
              
              {/* Minimap (only in 3D/walk mode) */}
              {showMinimap && viewMode !== '2d' && (
                <div className="absolute top-14 right-4 w-48 h-48 bg-slate-900/90 rounded-lg overflow-hidden border border-slate-700">
                  <div className="absolute top-2 left-2 text-xs text-slate-400">מפה</div>
                  <canvas
                    className="w-full h-full"
                    style={{ imageRendering: 'pixelated' }}
                    ref={(canvas) => {
                      if (!canvas || !currentRoom) return;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) return;
                      
                      canvas.width = 192;
                      canvas.height = 192;
                      
                      ctx.fillStyle = '#1e293b';
                      ctx.fillRect(0, 0, 192, 192);
                      
                      // Draw walls
                      currentRoom.walls.forEach((wall) => {
                        const scale = 15;
                        const offsetX = 96;
                        const offsetY = 96;
                        
                        ctx.strokeStyle = selectedWall === wall.id ? '#06b6d4' : '#9CA3AF';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(wall.start.x * scale + offsetX, -wall.start.y * scale + offsetY);
                        ctx.lineTo(wall.end.x * scale + offsetX, -wall.end.y * scale + offsetY);
                        ctx.stroke();
                      });
                      
                      // Draw objects
                      currentRoom.objects.forEach((obj) => {
                        const scale = 15;
                        const offsetX = 96;
                        const offsetY = 96;
                        
                        ctx.fillStyle = selectedObject === obj.id ? '#06b6d4' : '#6B7280';
                        ctx.fillRect(
                          obj.position.x * scale + offsetX - 3,
                          -obj.position.z * scale + offsetY - 3,
                          6,
                          6
                        );
                      });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Move3d className="size-24 mb-6 text-slate-600" />
              <h2 className="text-2xl font-bold mb-2">עורך תלת מימד</h2>
              <p className="text-slate-400 mb-6">צור חלל חדש והתחל לעצב</p>
              <Button
                onClick={() => createNewRoom('חדר חדש')}
                className="bg-gradient-to-r from-cyan-500 to-teal-600"
              >
                <Layers className="size-4 ml-2" />
                צור חלל חדש
              </Button>
            </div>
          )}

          {/* Placement Mode Indicator */}
          {placementObject && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <Package className="size-4" />
              <span>לחץ על הרצפה להצבת האובייקט</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 hover:bg-cyan-600"
                onClick={cancelPlacement}
              >
                <X className="size-4" />
              </Button>
            </div>
          )}

          {/* Tool hint for door/window */}
          {(currentTool === 'door' || currentTool === 'window') && currentRoom && !hasSelection && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              {currentTool === 'door' ? <DoorOpen className="size-4" /> : <Maximize2 className="size-4" />}
              <span>לחץ על קיר להוספת {currentTool === 'door' ? 'דלת' : 'חלון'}</span>
            </div>
          )}

          {/* Walk mode instructions */}
          {viewMode === 'walk' && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-lg flex items-center gap-4 shadow-lg text-sm">
              <span>WASD / חצים - תנועה</span>
              <span>עכבר - סיבוב</span>
              <span>ESC - יציאה ממצב סיור</span>
            </div>
          )}

          {/* Status Bar */}
          {currentRoom && (
            <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-white border-white/20">
                  {viewMode === '2d' ? 'תוכנית קומה' : viewMode === '3d' ? 'תלת מימד' : 'סיור'}
                </Badge>
                <span>קירות: {currentRoom.walls.length}</span>
                <span>דלתות: {currentRoom.doors.length}</span>
                <span>חלונות: {currentRoom.windows.length}</span>
                <span>אובייקטים: {currentRoom.objects.length}</span>
                {currentRoom.walls.length >= 3 && (
                  <span className="text-cyan-400">שטח: {calculateRoomArea().toFixed(2)} מ"ר</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setShowMeasurements(!showMeasurements)}
                    >
                      <Ruler className={`size-4 ${showMeasurements ? 'text-cyan-400' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showMeasurements ? 'הסתר מידות' : 'הצג מידות'}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setShowGrid(!showGrid)}
                    >
                      <Grid3X3 className={`size-4 ${showGrid ? 'text-cyan-400' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showGrid ? 'הסתר רשת' : 'הצג רשת'}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setSnapToGrid(!snapToGrid)}
                    >
                      <span className={`text-xs ${snapToGrid ? 'text-cyan-400' : ''}`}>
                        Snap: {snapToGrid ? 'ON' : 'OFF'}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{snapToGrid ? 'בטל הצמדה לרשת' : 'הפעל הצמדה לרשת'}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-r bg-white dark:bg-slate-950">
          <Tabs defaultValue="objects" className="h-full flex flex-col">
            <TabsList className="m-2 grid grid-cols-4">
              <TabsTrigger value="objects">אובייקטים</TabsTrigger>
              <TabsTrigger value="materials">חומרים</TabsTrigger>
              <TabsTrigger value="textures">טקסטורות</TabsTrigger>
              <TabsTrigger value="properties">מאפיינים</TabsTrigger>
            </TabsList>

            <TabsContent value="objects" className="flex-1 p-0 m-0">
              <div className="p-2 border-b">
                <div className="flex gap-1 flex-wrap">
                  {['all', 'fixtures', 'furniture', 'electrical'].map(
                    (cat) => (
                      <Badge
                        key={cat}
                        variant={objectCategory === cat ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => setObjectCategory(cat)}
                      >
                        {cat === 'all'
                          ? 'הכל'
                          : cat === 'fixtures'
                          ? 'אביזרים'
                          : cat === 'furniture'
                          ? 'ריהוט'
                          : 'חשמל'}
                      </Badge>
                    )
                  )}
                </div>
              </div>
              <ScrollArea className="h-[calc(100vh-14rem)]">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {filteredObjects.map((obj) => (
                    <Card
                      key={obj.id}
                      className={`cursor-pointer transition-colors ${
                        placementObject === obj.id 
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950' 
                          : 'hover:border-cyan-500'
                      } ${!currentRoom ? 'opacity-50 pointer-events-none' : ''}`}
                      onClick={() => handleObjectClick(obj)}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="w-full h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2 flex items-center justify-center">
                          <Package className={`size-8 ${placementObject === obj.id ? 'text-cyan-500' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-xs font-medium truncate">{obj.name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="materials" className="flex-1 p-0 m-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="p-2 space-y-2">
                  {!hasSelection && (
                    <div className="p-3 text-sm text-muted-foreground text-center bg-slate-50 dark:bg-slate-900 rounded-lg">
                      בחר אלמנט כדי להחיל עליו חומר
                    </div>
                  )}
                  {isSelectedLocked && (
                    <div className="p-3 text-sm text-amber-600 text-center bg-amber-50 dark:bg-amber-950 rounded-lg flex items-center justify-center gap-2">
                      <Lock className="size-4" />
                      האלמנט נעול
                    </div>
                  )}
                  {materials.map((mat) => (
                    <Card
                      key={mat.id}
                      className={`cursor-pointer transition-colors ${
                        hasSelection && !isSelectedLocked ? 'hover:border-cyan-500' : 'opacity-50 pointer-events-none'
                      }`}
                      onClick={() => handleMaterialClick(mat)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border"
                          style={{ backgroundColor: mat.color }}
                        />
                        <span className="font-medium">{mat.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="textures" className="flex-1 p-0 m-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="p-4 space-y-6">
                  {/* Floor Texture */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">טקסטורת רצפה</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {floorTextures.map((tex) => (
                        <div
                          key={tex.id}
                          className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                            floorTexture === tex.id ? 'border-cyan-500' : 'border-transparent hover:border-slate-300'
                          }`}
                          onClick={() => setFloorTexture(tex.id)}
                        >
                          <div
                            className="w-full h-12 rounded mb-1"
                            style={{ backgroundColor: tex.color }}
                          />
                          <p className="text-xs text-center">{tex.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Wall Texture */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">טקסטורת קירות</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {wallTextures.map((tex) => (
                        <div
                          key={tex.id}
                          className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                            wallTexture === tex.id ? 'border-cyan-500' : 'border-transparent hover:border-slate-300'
                          }`}
                          onClick={() => setWallTexture(tex.id)}
                        >
                          <div
                            className="w-full h-12 rounded mb-1"
                            style={{ backgroundColor: tex.color }}
                          />
                          <p className="text-xs text-center">{tex.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="properties" className="flex-1 p-0 m-0">
              <ScrollArea className="h-[calc(100vh-10rem)]">
                <div className="p-4 space-y-4">
                  {hasSelection ? (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{getSelectionTypeName()} נבחר</span>
                              {isSelectedLocked && <Lock className="size-3 text-amber-500" />}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6"
                                    onClick={handleLockToggle}
                                  >
                                    {isSelectedLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>{isSelectedLocked ? 'בטל נעילה' : 'נעל'}</TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6"
                                onClick={clearSelection}
                              >
                                <X className="size-4" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {renderSelectedProperties()}
                          <Separator className="my-3" />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={duplicate}
                              disabled={isSelectedLocked}
                            >
                              <Layers className="size-4 ml-1" />
                              שכפל
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                              onClick={deleteSelected}
                              disabled={isSelectedLocked}
                            >
                              <Trash2 className="size-4 ml-1" />
                              מחק
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">פרטי פרויקט</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">שם הפרויקט</Label>
                            <Input
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">הגדרות ברירת מחדל</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs">גובה קיר (מ)</Label>
                            <Input
                              type="number"
                              value={defaultWallHeight}
                              step={0.1}
                              min={2}
                              max={5}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">עובי קיר (מ)</Label>
                            <Input
                              type="number"
                              value={defaultWallThickness}
                              step={0.05}
                              min={0.1}
                              max={0.5}
                              readOnly
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">גודל רשת (מ)</Label>
                            <Input
                              type="number"
                              value={gridSize}
                              onChange={(e) => setGridSize(parseFloat(e.target.value) || 0.1)}
                              step={0.05}
                              min={0.05}
                              max={1}
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">פעולות</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={handleExportJSON}
                          >
                            <Save className="size-4 ml-2" />
                            שמור פרויקט (JSON)
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setShowLoadDialog(true)}
                          >
                            <Upload className="size-4 ml-2" />
                            טען פרויקט
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={clearMeasurements}
                          >
                            <Ruler className="size-4 ml-2" />
                            נקה מדידות
                          </Button>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600"
                          >
                            <Calculator className="size-4 ml-2" />
                            חשב עלויות
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Quick tips */}
                      <Card className="bg-slate-50 dark:bg-slate-900">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs text-muted-foreground">טיפים</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-muted-foreground space-y-1">
                          <p>• Ctrl+Z / Ctrl+Y - בטל/חזור</p>
                          <p>• Ctrl+C / Ctrl+V - העתק/הדבק</p>
                          <p>• Ctrl+D - שכפל אובייקט</p>
                          <p>• G/R/S - הזז/סובב/שנה גודל</p>
                          <p>• Delete - מחק נבחר</p>
                          <p>• WASD - תנועה במצב סיור</p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardDialog} onOpenChange={setShowKeyboardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="size-5" />
              קיצורי מקלדת
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {keyboardShortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

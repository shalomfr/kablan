'use client';

import { useState, Suspense, useMemo } from 'react';
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
import { useBuilderStore } from '@/stores/builder-store';
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
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Eye,
  Layers,
  Move3d,
  Box,
  Save,
  Download,
  Calculator,
  Loader2,
  Trash2,
  X,
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
  { id: 'select', icon: MousePointer2, label: 'בחירה' },
  { id: 'wall', icon: Square, label: 'קיר' },
  { id: 'door', icon: DoorOpen, label: 'דלת' },
  { id: 'window', icon: Maximize2, label: 'חלון' },
  { id: 'object', icon: Package, label: 'אובייקט' },
  { id: 'measure', icon: Ruler, label: 'מדידה' },
  { id: 'material', icon: Palette, label: 'חומר' },
  { id: 'camera', icon: Camera, label: 'מצלמה' },
] as const;

const viewModes = [
  { id: '2d', icon: Grid3X3, label: '2D' },
  { id: '3d', icon: Box, label: '3D' },
  { id: 'walk', icon: Eye, label: 'סיור' },
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

export function Builder3DInterface() {
  const {
    currentRoom,
    currentTool,
    viewMode,
    gridSize,
    snapToGrid,
    showGrid,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedObject,
    defaultWallHeight,
    defaultWallThickness,
    placementObject,
    setCurrentTool,
    setViewMode,
    setGridSize,
    setSnapToGrid,
    setShowGrid,
    createNewRoom,
    clearSelection,
    deleteSelected,
    startPlacingObject,
    cancelPlacement,
    getSelectedElement,
    updateWall,
    updateDoor,
    updateWindow,
    updateObject,
    applyMaterialToSelected,
  } = useBuilderStore();

  const [objectCategory, setObjectCategory] = useState<string>('all');

  const filteredObjects =
    objectCategory === 'all'
      ? objectLibrary
      : objectLibrary.filter((obj) => obj.category === objectCategory);

  const hasSelection = selectedWall || selectedDoor || selectedWindow || selectedObject;
  
  // Get the selected element details
  const selectedElementInfo = useMemo(() => {
    return getSelectedElement();
  }, [selectedWall, selectedDoor, selectedWindow, selectedObject, currentRoom, getSelectedElement]);

  // Handle object click in library
  const handleObjectClick = (obj: typeof objectLibrary[0]) => {
    if (!currentRoom) return;
    startPlacingObject(obj.id, obj.builderCategory);
  };

  // Handle material application
  const handleMaterialClick = (mat: typeof materials[0]) => {
    if (!hasSelection) return;
    applyMaterialToSelected({
      id: mat.id,
      name: mat.name,
      color: mat.color,
      roughness: 0.8,
      metalness: 0.1,
    });
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
                onChange={(e) => updateWall(wall.id, { thickness: parseFloat(e.target.value) || 0.2 })}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              <p>מתחיל: ({wall.start.x.toFixed(2)}, {wall.start.y.toFixed(2)})</p>
              <p>מסיים: ({wall.end.x.toFixed(2)}, {wall.end.y.toFixed(2)})</p>
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
                onChange={(e) => updateDoor(door.id, { height: parseFloat(e.target.value) || 2.1 })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">סיבוב (מעלות)</Label>
              <Slider
                value={[door.rotation]}
                max={360}
                step={15}
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
                onValueChange={([val]) => updateObject(obj.id, { 
                  rotation: { ...(obj.rotation || { x: 0, y: 0, z: 0 }), y: val } 
                })}
              />
              <span className="text-xs text-muted-foreground">{obj.rotation?.y || 0}°</span>
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
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Tools Panel */}
      <div className="w-16 border-l bg-slate-50/50 dark:bg-slate-900/50 flex flex-col">
        <div className="p-2 space-y-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={currentTool === tool.id ? 'secondary' : 'ghost'}
              size="icon"
              className="w-full"
              onClick={() => setCurrentTool(tool.id as typeof currentTool)}
              title={tool.label}
            >
              <tool.icon className="size-5" />
            </Button>
          ))}
        </div>

        <Separator className="my-2" />

        <div className="p-2 space-y-1">
          {viewModes.map((mode) => (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'ghost'}
              size="icon"
              className="w-full"
              onClick={() => setViewMode(mode.id as typeof viewMode)}
              title={mode.label}
            >
              <mode.icon className="size-5" />
            </Button>
          ))}
        </div>

        <div className="mt-auto p-2 space-y-1">
          <Button variant="ghost" size="icon" className="w-full" title="שחזר תצוגה">
            <RotateCcw className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-full" title="הגדל">
            <ZoomIn className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-full" title="הקטן">
            <ZoomOut className="size-5" />
          </Button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative bg-slate-800">
        {currentRoom ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-12 animate-spin text-cyan-500" />
              </div>
            }
          >
            <Scene3D />
          </Suspense>
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
            {currentTool === 'door' ? <DoorOpen className="size-4" /> : <Maximize2 className="size-4" />}
            <span>לחץ על קיר להוספת {currentTool === 'door' ? 'דלת' : 'חלון'}</span>
          </div>
        )}

        {/* Status Bar */}
        {currentRoom && (
          <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm rounded-lg p-2 text-white text-sm">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-white border-white/20">
                {viewMode.toUpperCase()}
              </Badge>
              <span>קירות: {currentRoom.walls.length}</span>
              <span>דלתות: {currentRoom.doors.length}</span>
              <span>חלונות: {currentRoom.windows.length}</span>
              <span>אובייקטים: {currentRoom.objects.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className={`size-4 ${showGrid ? 'text-cyan-400' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                onClick={() => setSnapToGrid(!snapToGrid)}
              >
                Snap: {snapToGrid ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="w-80 border-r bg-white dark:bg-slate-950">
        <Tabs defaultValue="objects" className="h-full flex flex-col">
          <TabsList className="m-2 grid grid-cols-3">
            <TabsTrigger value="objects">אובייקטים</TabsTrigger>
            <TabsTrigger value="materials">חומרים</TabsTrigger>
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
                {materials.map((mat) => (
                  <Card
                    key={mat.id}
                    className={`cursor-pointer transition-colors ${
                      hasSelection ? 'hover:border-cyan-500' : 'opacity-50 pointer-events-none'
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

          <TabsContent value="properties" className="flex-1 p-0 m-0">
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <div className="p-4 space-y-4">
                {hasSelection ? (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center justify-between">
                          <span>{getSelectionTypeName()} נבחר</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={clearSelection}
                          >
                            <X className="size-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {renderSelectedProperties()}
                        <Separator className="my-3" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={deleteSelected}
                        >
                          <Trash2 className="size-4 ml-2" />
                          מחק
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
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
                        <Button variant="outline" size="sm" className="w-full">
                          <Save className="size-4 ml-2" />
                          שמור פרויקט
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          <Download className="size-4 ml-2" />
                          ייצא תמונה
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
                        <p>• בחר כלי קיר וצייר על הרצפה</p>
                        <p>• בחר כלי דלת/חלון ולחץ על קיר</p>
                        <p>• בחר אובייקט מהרשימה והצב על הרצפה</p>
                        <p>• לחץ על אלמנט לעריכה</p>
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
  );
}

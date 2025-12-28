'use client';

import { useState, Suspense } from 'react';
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

const objectLibrary = [
  { id: 'door-standard', name: 'דלת רגילה', category: 'doors' },
  { id: 'door-sliding', name: 'דלת הזזה', category: 'doors' },
  { id: 'door-security', name: 'דלת ביטחונית', category: 'doors' },
  { id: 'window-single', name: 'חלון יחיד', category: 'windows' },
  { id: 'window-double', name: 'חלון כפול', category: 'windows' },
  { id: 'window-sliding', name: 'חלון הזזה', category: 'windows' },
  { id: 'toilet', name: 'אסלה', category: 'fixtures' },
  { id: 'sink', name: 'כיור', category: 'fixtures' },
  { id: 'shower', name: 'מקלחון', category: 'fixtures' },
  { id: 'bathtub', name: 'אמבטיה', category: 'fixtures' },
  { id: 'kitchen-lower', name: 'ארון מטבח תחתון', category: 'furniture' },
  { id: 'kitchen-upper', name: 'ארון מטבח עליון', category: 'furniture' },
  { id: 'closet', name: 'ארון', category: 'furniture' },
  { id: 'bed-single', name: 'מיטה יחיד', category: 'furniture' },
  { id: 'bed-double', name: 'מיטה זוגית', category: 'furniture' },
  { id: 'sofa', name: 'ספה', category: 'furniture' },
  { id: 'table', name: 'שולחן', category: 'furniture' },
  { id: 'chair', name: 'כיסא', category: 'furniture' },
  { id: 'ac-unit', name: 'מזגן', category: 'electrical' },
  { id: 'outlet', name: 'שקע', category: 'electrical' },
  { id: 'switch', name: 'מתג', category: 'electrical' },
  { id: 'light', name: 'גוף תאורה', category: 'electrical' },
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
    setCurrentTool,
    setViewMode,
    setGridSize,
    setSnapToGrid,
    setShowGrid,
    createNewRoom,
    clearSelection,
  } = useBuilderStore();

  const [objectCategory, setObjectCategory] = useState<string>('all');

  const filteredObjects =
    objectCategory === 'all'
      ? objectLibrary
      : objectLibrary.filter((obj) => obj.category === objectCategory);

  const hasSelection = selectedWall || selectedDoor || selectedWindow || selectedObject;

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
                {['all', 'doors', 'windows', 'fixtures', 'furniture', 'electrical'].map(
                  (cat) => (
                    <Badge
                      key={cat}
                      variant={objectCategory === cat ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setObjectCategory(cat)}
                    >
                      {cat === 'all'
                        ? 'הכל'
                        : cat === 'doors'
                        ? 'דלתות'
                        : cat === 'windows'
                        ? 'חלונות'
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
                    className="cursor-pointer hover:border-cyan-500 transition-colors"
                  >
                    <CardContent className="p-3 text-center">
                      <div className="w-full h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2 flex items-center justify-center">
                        <Package className="size-8 text-slate-400" />
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
                {materials.map((mat) => (
                  <Card
                    key={mat.id}
                    className="cursor-pointer hover:border-cyan-500 transition-colors"
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
                        <CardTitle className="text-sm">אובייקט נבחר</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">מיקום X</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">מיקום Y</Label>
                          <Input type="number" placeholder="0" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">סיבוב</Label>
                          <Slider defaultValue={[0]} max={360} step={1} />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="w-full"
                          onClick={clearSelection}
                        >
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



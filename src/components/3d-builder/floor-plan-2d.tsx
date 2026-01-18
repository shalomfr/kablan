'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useBuilderStore } from '@/stores/builder-store';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut, Maximize2, Printer, FileText } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const SCALE = 50; // pixels per meter
const WALL_WIDTH = 8; // pixels
const GRID_SIZE = 0.5; // meters
const PADDING = 100;

// Professional architectural colors
const COLORS = {
  background: '#ffffff',
  grid: '#e5e7eb',
  gridMajor: '#d1d5db',
  wall: '#1f2937',
  wallFill: '#374151',
  wallSelected: '#0891b2',
  door: '#92400e',
  doorArc: '#d97706',
  window: '#0ea5e9',
  windowGlass: '#bae6fd',
  dimension: '#dc2626',
  dimensionText: '#1f2937',
  areaText: '#059669',
  furniture: '#6b7280',
  furnitureSelected: '#0891b2',
  compass: '#1f2937',
};

// Furniture icons for 2D representation
const FURNITURE_SYMBOLS: Record<string, (ctx: CanvasRenderingContext2D, w: number, h: number, selected: boolean) => void> = {
  'toilet': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected : '#f3f4f6';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    // Bowl
    ctx.beginPath();
    ctx.ellipse(0, h * 0.15, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Tank
    ctx.fillRect(-w * 0.35, -h * 0.5, w * 0.7, h * 0.25);
    ctx.strokeRect(-w * 0.35, -h * 0.5, w * 0.7, h * 0.25);
  },
  'sink': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected : '#f3f4f6';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    // Basin
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.4, h * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Faucet
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(0, -h * 0.25, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  'shower': (ctx, w, h, selected) => {
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.setLineDash([]);
    // Drain
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.1, 0, Math.PI * 2);
    ctx.stroke();
    // Shower head
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(-w * 0.35, -h * 0.35, w * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  'bathtub': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '40' : '#f3f4f6';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 2;
    // Outer
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h / 2, w, h, 8);
    ctx.fill();
    ctx.stroke();
    // Inner
    ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8);
    // Faucet
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(w * 0.35, 0, 4, 0, Math.PI * 2);
    ctx.fill();
  },
  'bed-single': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#fef3c7';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    // Mattress
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Pillow
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w - 8, h * 0.18);
    ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w - 8, h * 0.18);
    // Headboard
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-w / 2 - 3, -h / 2, 3, h * 0.1);
    ctx.fillRect(w / 2, -h / 2, 3, h * 0.1);
  },
  'bed-double': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#fef3c7';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Pillows
    ctx.fillStyle = '#fff';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 4, w * 0.45 - 6, h * 0.15);
    ctx.strokeRect(-w / 2 + 4, -h / 2 + 4, w * 0.45 - 6, h * 0.15);
    ctx.fillRect(w * 0.05 + 2, -h / 2 + 4, w * 0.45 - 6, h * 0.15);
    ctx.strokeRect(w * 0.05 + 2, -h / 2 + 4, w * 0.45 - 6, h * 0.15);
  },
  'sofa': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '40' : '#d1d5db';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    // Base
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Back cushion
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '60' : '#9ca3af';
    ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h * 0.25);
    // Armrests
    ctx.fillRect(-w / 2, -h / 2, w * 0.08, h);
    ctx.fillRect(w / 2 - w * 0.08, -h / 2, w * 0.08, h);
  },
  'table': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#fef3c7';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : '#92400e';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Legs
    const legSize = 4;
    ctx.fillStyle = '#92400e';
    [[-w / 2 + 6, -h / 2 + 6], [w / 2 - 6, -h / 2 + 6],
     [-w / 2 + 6, h / 2 - 6], [w / 2 - 6, h / 2 - 6]].forEach(([x, y]) => {
      ctx.fillRect(x - legSize / 2, y - legSize / 2, legSize, legSize);
    });
  },
  'chair': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '40' : '#e5e7eb';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    // Seat
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Back
    ctx.fillStyle = selected ? COLORS.furnitureSelected : '#92400e';
    ctx.fillRect(-w / 2 + 2, -h / 2 - 4, w - 4, 4);
  },
  'kitchen-lower': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#f3f4f6';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Counter top
    ctx.fillStyle = '#374151';
    ctx.fillRect(-w / 2, -h / 2, w, 3);
    // Doors
    ctx.strokeRect(-w / 2 + 2, -h / 2 + 5, w / 2 - 3, h - 7);
    ctx.strokeRect(2, -h / 2 + 5, w / 2 - 3, h - 7);
  },
  'kitchen-upper': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#e5e7eb';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.setLineDash([]);
  },
  'closet': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#d4a574';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : '#92400e';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Doors
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, h / 2);
    ctx.stroke();
    // Handles
    ctx.fillStyle = '#9ca3af';
    ctx.beginPath();
    ctx.arc(-4, 0, 2, 0, Math.PI * 2);
    ctx.arc(4, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  },
  'ac-unit': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected + '30' : '#f3f4f6';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : COLORS.furniture;
    ctx.lineWidth = 1;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    // Vents
    for (let i = -w / 2 + 4; i < w / 2 - 4; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -h / 4);
      ctx.lineTo(i, h / 4);
      ctx.stroke();
    }
  },
  'light': (ctx, w, h, selected) => {
    ctx.fillStyle = selected ? COLORS.furnitureSelected : '#fbbf24';
    ctx.strokeStyle = selected ? COLORS.furnitureSelected : '#92400e';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Rays
    ctx.strokeStyle = '#fbbf24';
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * w * 0.4, Math.sin(angle) * w * 0.4);
      ctx.lineTo(Math.cos(angle) * w * 0.6, Math.sin(angle) * w * 0.6);
      ctx.stroke();
    }
  },
};

export function FloorPlan2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPrintMode, setIsPrintMode] = useState(false);

  const {
    currentRoom,
    selectedWall,
    selectedDoor,
    selectedWindow,
    selectedObject,
    setSelectedWall,
    setSelectedDoor,
    setSelectedWindow,
    setSelectedObject,
    calculateRoomArea,
    showMeasurements,
  } = useBuilderStore();

  // Convert world coordinates to canvas coordinates
  const worldToCanvas = useCallback((point: Point, canvasWidth: number, canvasHeight: number) => {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    return {
      x: centerX + (point.x * SCALE * zoom) + offset.x,
      y: centerY - (point.y * SCALE * zoom) + offset.y,
    };
  }, [zoom, offset]);

  // Draw architectural dimension line with arrows
  const drawDimensionLine = useCallback((
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    distance: number,
    offsetDistance: number = 25
  ) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1) return;

    // Perpendicular direction
    const perpX = -dy / len;
    const perpY = dx / len;

    // Offset points for dimension line
    const offset1 = {
      x: start.x + perpX * offsetDistance,
      y: start.y + perpY * offsetDistance,
    };
    const offset2 = {
      x: end.x + perpX * offsetDistance,
      y: end.y + perpY * offsetDistance,
    };

    ctx.strokeStyle = COLORS.dimension;
    ctx.fillStyle = COLORS.dimension;
    ctx.lineWidth = 1;

    // Extension lines
    ctx.beginPath();
    ctx.moveTo(start.x + perpX * 5, start.y + perpY * 5);
    ctx.lineTo(offset1.x + perpX * 5, offset1.y + perpY * 5);
    ctx.moveTo(end.x + perpX * 5, end.y + perpY * 5);
    ctx.lineTo(offset2.x + perpX * 5, offset2.y + perpY * 5);
    ctx.stroke();

    // Main dimension line
    ctx.beginPath();
    ctx.moveTo(offset1.x, offset1.y);
    ctx.lineTo(offset2.x, offset2.y);
    ctx.stroke();

    // Arrows
    const arrowSize = 6;
    const angle = Math.atan2(dy, dx);

    // Arrow at start
    ctx.beginPath();
    ctx.moveTo(offset1.x, offset1.y);
    ctx.lineTo(offset1.x + Math.cos(angle + Math.PI * 0.85) * arrowSize,
               offset1.y + Math.sin(angle + Math.PI * 0.85) * arrowSize);
    ctx.lineTo(offset1.x + Math.cos(angle - Math.PI * 0.85) * arrowSize,
               offset1.y + Math.sin(angle - Math.PI * 0.85) * arrowSize);
    ctx.closePath();
    ctx.fill();

    // Arrow at end
    ctx.beginPath();
    ctx.moveTo(offset2.x, offset2.y);
    ctx.lineTo(offset2.x + Math.cos(angle + Math.PI + Math.PI * 0.85) * arrowSize,
               offset2.y + Math.sin(angle + Math.PI + Math.PI * 0.85) * arrowSize);
    ctx.lineTo(offset2.x + Math.cos(angle + Math.PI - Math.PI * 0.85) * arrowSize,
               offset2.y + Math.sin(angle + Math.PI - Math.PI * 0.85) * arrowSize);
    ctx.closePath();
    ctx.fill();

    // Dimension text
    const midX = (offset1.x + offset2.x) / 2;
    const midY = (offset1.y + offset2.y) / 2;

    ctx.save();
    ctx.translate(midX, midY);

    // Rotate text to be readable
    let textAngle = angle;
    if (textAngle > Math.PI / 2 || textAngle < -Math.PI / 2) {
      textAngle += Math.PI;
    }
    ctx.rotate(textAngle);

    // Text background
    const text = `${distance.toFixed(2)}`;
    ctx.font = `bold ${Math.max(10, 11 * zoom)}px Arial`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-textWidth / 2 - 4, -8, textWidth + 8, 16);

    // Text
    ctx.fillStyle = COLORS.dimensionText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  }, [zoom]);

  // Draw compass rose
  const drawCompass = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Circle
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.strokeStyle = COLORS.compass;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // North arrow
    ctx.beginPath();
    ctx.moveTo(0, -size + 5);
    ctx.lineTo(-5, 0);
    ctx.lineTo(0, -size * 0.3);
    ctx.lineTo(5, 0);
    ctx.closePath();
    ctx.fillStyle = COLORS.compass;
    ctx.fill();

    // N label
    ctx.fillStyle = COLORS.compass;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', 0, -size - 10);

    ctx.restore();
  }, []);

  // Draw the floor plan
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !currentRoom) return;

    const { width, height } = canvas;
    const bgColor = isPrintMode ? '#ffffff' : COLORS.background;

    // Clear canvas
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    if (!isPrintMode) {
      const gridSpacing = GRID_SIZE * SCALE * zoom;
      const startX = (offset.x % gridSpacing + width / 2) % gridSpacing;
      const startY = (offset.y % gridSpacing + height / 2) % gridSpacing;

      // Minor grid
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 0.5;
      for (let x = startX; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = startY; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Major grid (every meter)
      const majorGridSpacing = 1 * SCALE * zoom;
      ctx.strokeStyle = COLORS.gridMajor;
      ctx.lineWidth = 1;
      const startMajorX = (offset.x % majorGridSpacing + width / 2) % majorGridSpacing;
      const startMajorY = (offset.y % majorGridSpacing + height / 2) % majorGridSpacing;
      for (let x = startMajorX; x < width; x += majorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = startMajorY; y < height; y += majorGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw walls with proper architectural representation
    currentRoom.walls.forEach((wall, index) => {
      const start = worldToCanvas(wall.start, width, height);
      const end = worldToCanvas(wall.end, width, height);

      const isSelected = selectedWall === wall.id;
      const wallThickness = (wall.thickness || 0.2) * SCALE * zoom;

      // Calculate perpendicular offset for wall thickness
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 1) return;

      const perpX = (-dy / len) * (wallThickness / 2);
      const perpY = (dx / len) * (wallThickness / 2);

      // Wall fill
      ctx.fillStyle = isSelected ? COLORS.wallSelected + '40' : COLORS.wallFill;
      ctx.beginPath();
      ctx.moveTo(start.x + perpX, start.y + perpY);
      ctx.lineTo(end.x + perpX, end.y + perpY);
      ctx.lineTo(end.x - perpX, end.y - perpY);
      ctx.lineTo(start.x - perpX, start.y - perpY);
      ctx.closePath();
      ctx.fill();

      // Wall outline
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.wall;
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.stroke();

      // Draw dimension line if measurements are enabled
      if (showMeasurements) {
        const length = Math.sqrt(
          Math.pow(wall.end.x - wall.start.x, 2) +
          Math.pow(wall.end.y - wall.start.y, 2)
        );
        drawDimensionLine(ctx, start, end, length, 35 * zoom);
      }
    });

    // Draw doors with architectural symbol
    currentRoom.doors.forEach((door) => {
      const pos = worldToCanvas({ x: door.position.x, y: door.position.z }, width, height);
      const isSelected = selectedDoor === door.id;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate((-door.rotation * Math.PI) / 180);

      const doorWidth = door.width * SCALE * zoom;

      // Clear wall area for door opening
      ctx.fillStyle = isPrintMode ? '#ffffff' : COLORS.background;
      ctx.fillRect(-doorWidth / 2 - 2, -8, doorWidth + 4, 16);

      // Door swing arc (90 degrees)
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.doorArc;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(-doorWidth / 2, 0, doorWidth, 0, Math.PI / 2, false);
      ctx.stroke();
      ctx.setLineDash([]);

      // Door panel (open position)
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.door;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-doorWidth / 2, 0);
      const openAngle = Math.PI / 4; // 45 degrees open
      ctx.lineTo(-doorWidth / 2 + Math.cos(openAngle) * doorWidth,
                 Math.sin(openAngle) * doorWidth);
      ctx.stroke();

      // Hinge point
      ctx.fillStyle = isSelected ? COLORS.wallSelected : COLORS.door;
      ctx.beginPath();
      ctx.arc(-doorWidth / 2, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Door frame
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.door;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-doorWidth / 2 - 3, -6);
      ctx.lineTo(-doorWidth / 2 - 3, 6);
      ctx.moveTo(doorWidth / 2 + 3, -6);
      ctx.lineTo(doorWidth / 2 + 3, 6);
      ctx.stroke();

      ctx.restore();
    });

    // Draw windows with architectural symbol
    currentRoom.windows.forEach((win) => {
      const pos = worldToCanvas({ x: win.position.x, y: win.position.z }, width, height);
      const isSelected = selectedWindow === win.id;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate((-win.rotation * Math.PI) / 180);

      const windowWidth = win.width * SCALE * zoom;

      // Clear wall area
      ctx.fillStyle = isPrintMode ? '#ffffff' : COLORS.background;
      ctx.fillRect(-windowWidth / 2 - 2, -8, windowWidth + 4, 16);

      // Window frame (outer)
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.window;
      ctx.lineWidth = 2;
      ctx.strokeRect(-windowWidth / 2, -4, windowWidth, 8);

      // Glass pattern
      ctx.fillStyle = COLORS.windowGlass;
      ctx.fillRect(-windowWidth / 2 + 2, -2, windowWidth - 4, 4);

      // Center mullion for double windows
      if (win.type === 'double') {
        ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.window;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(0, 4);
        ctx.stroke();
      }

      // Opening indicator lines
      ctx.strokeStyle = isSelected ? COLORS.wallSelected : COLORS.window;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-windowWidth / 4, -3);
      ctx.lineTo(-windowWidth / 4, 3);
      ctx.moveTo(windowWidth / 4, -3);
      ctx.lineTo(windowWidth / 4, 3);
      ctx.stroke();

      ctx.restore();
    });

    // Draw objects/furniture
    currentRoom.objects.forEach((obj) => {
      const pos = worldToCanvas({ x: obj.position.x, y: obj.position.z }, width, height);
      const isSelected = selectedObject === obj.id;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(-((obj.rotation?.y || 0) * Math.PI) / 180);

      // Get object dimensions
      const getDimensions = () => {
        switch (obj.type) {
          case 'toilet': return { w: 0.4, h: 0.6 };
          case 'sink': return { w: 0.5, h: 0.5 };
          case 'shower': return { w: 0.9, h: 0.9 };
          case 'bathtub': return { w: 0.7, h: 1.7 };
          case 'kitchen-lower': return { w: 0.6, h: 0.6 };
          case 'kitchen-upper': return { w: 0.6, h: 0.35 };
          case 'closet': return { w: 1.2, h: 0.6 };
          case 'bed-single': return { w: 0.95, h: 1.95 };
          case 'bed-double': return { w: 1.65, h: 2.05 };
          case 'sofa': return { w: 2.0, h: 0.9 };
          case 'table': return { w: 1.2, h: 0.8 };
          case 'chair': return { w: 0.45, h: 0.45 };
          case 'ac-unit': return { w: 0.8, h: 0.2 };
          case 'light': return { w: 0.4, h: 0.4 };
          default: return { w: 0.5, h: 0.5 };
        }
      };

      const dim = getDimensions();
      const scale = obj.scale || { x: 1, y: 1, z: 1 };
      const w = dim.w * scale.x * SCALE * zoom;
      const h = dim.h * scale.z * SCALE * zoom;

      // Draw furniture symbol if available
      const drawSymbol = FURNITURE_SYMBOLS[obj.type];
      if (drawSymbol) {
        drawSymbol(ctx, w, h, isSelected);
      } else {
        // Default rectangle
        ctx.fillStyle = isSelected ? COLORS.furnitureSelected + '30' : '#e5e7eb';
        ctx.strokeStyle = isSelected ? COLORS.furnitureSelected : COLORS.furniture;
        ctx.lineWidth = 1.5;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }

      ctx.restore();
    });

    // Draw room area
    if (showMeasurements && currentRoom.walls.length >= 3) {
      const area = calculateRoomArea();
      if (area > 0) {
        ctx.fillStyle = COLORS.areaText;
        ctx.font = `bold ${Math.max(14, 16 * zoom)}px Arial`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(`שטח: ${area.toFixed(2)} מ"ר`, width - 20, 20);

        // Perimeter
        const perimeter = currentRoom.walls.reduce((acc, wall) => {
          return acc + Math.sqrt(
            Math.pow(wall.end.x - wall.start.x, 2) +
            Math.pow(wall.end.y - wall.start.y, 2)
          );
        }, 0);
        ctx.fillText(`היקף: ${perimeter.toFixed(2)} מ'`, width - 20, 45);
      }
    }

    // Draw compass if not in print mode
    if (!isPrintMode) {
      drawCompass(ctx, width - 50, height - 80, 25);
    }

    // Draw scale bar
    const scaleBarLength = 1 * SCALE * zoom; // 1 meter
    const scaleBarY = height - 30;

    ctx.strokeStyle = COLORS.wall;
    ctx.fillStyle = COLORS.wall;
    ctx.lineWidth = 2;

    // Scale bar line
    ctx.beginPath();
    ctx.moveTo(20, scaleBarY);
    ctx.lineTo(20 + scaleBarLength, scaleBarY);
    ctx.stroke();

    // End ticks
    ctx.beginPath();
    ctx.moveTo(20, scaleBarY - 5);
    ctx.lineTo(20, scaleBarY + 5);
    ctx.moveTo(20 + scaleBarLength, scaleBarY - 5);
    ctx.lineTo(20 + scaleBarLength, scaleBarY + 5);
    ctx.stroke();

    // Scale text
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('1 מטר', 20 + scaleBarLength / 2, scaleBarY + 8);

    // Scale ratio
    ctx.textAlign = 'left';
    ctx.fillText(`קנה מידה 1:${Math.round(100 / zoom)}`, 20, scaleBarY - 20);

    // Title block for print mode
    if (isPrintMode) {
      ctx.strokeStyle = COLORS.wall;
      ctx.lineWidth = 2;
      ctx.strokeRect(width - 220, height - 100, 200, 80);

      ctx.fillStyle = COLORS.wall;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText('תוכנית קומה', width - 30, height - 80);

      ctx.font = '12px Arial';
      ctx.fillText(`תאריך: ${new Date().toLocaleDateString('he-IL')}`, width - 30, height - 60);
      ctx.fillText(`שטח: ${calculateRoomArea().toFixed(2)} מ"ר`, width - 30, height - 40);
    }

  }, [currentRoom, worldToCanvas, zoom, offset, selectedWall, selectedDoor, selectedWindow, selectedObject, showMeasurements, calculateRoomArea, isPrintMode, drawDimensionLine, drawCompass]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  // Redraw on state changes
  useEffect(() => {
    draw();
  }, [draw, currentRoom, selectedWall, selectedDoor, selectedWindow, selectedObject, zoom, offset, isPrintMode]);

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.min(Math.max(prev * delta, 0.2), 5));
  };

  // Handle click to select elements
  const handleClick = (e: React.MouseEvent) => {
    if (!currentRoom || isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check objects
    for (const obj of currentRoom.objects) {
      const pos = worldToCanvas({ x: obj.position.x, y: obj.position.z }, canvas.width, canvas.height);
      const dim = { w: 50 * zoom, h: 50 * zoom };

      if (x >= pos.x - dim.w / 2 && x <= pos.x + dim.w / 2 &&
          y >= pos.y - dim.h / 2 && y <= pos.y + dim.h / 2) {
        setSelectedObject(obj.id);
        return;
      }
    }

    // Check doors
    for (const door of currentRoom.doors) {
      const pos = worldToCanvas({ x: door.position.x, y: door.position.z }, canvas.width, canvas.height);
      const hitRadius = 30 * zoom;

      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist <= hitRadius) {
        setSelectedDoor(door.id);
        return;
      }
    }

    // Check windows
    for (const win of currentRoom.windows) {
      const pos = worldToCanvas({ x: win.position.x, y: win.position.z }, canvas.width, canvas.height);
      const hitRadius = 30 * zoom;

      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist <= hitRadius) {
        setSelectedWindow(win.id);
        return;
      }
    }

    // Check walls
    for (const wall of currentRoom.walls) {
      const start = worldToCanvas(wall.start, canvas.width, canvas.height);
      const end = worldToCanvas(wall.end, canvas.width, canvas.height);

      // Point-to-line distance
      const A = x - start.x;
      const B = y - start.y;
      const C = end.x - start.x;
      const D = end.y - start.y;

      const dot = A * C + B * D;
      const lenSq = C * C + D * D;
      let param = -1;

      if (lenSq !== 0) param = dot / lenSq;

      let xx, yy;

      if (param < 0) {
        xx = start.x;
        yy = start.y;
      } else if (param > 1) {
        xx = end.x;
        yy = end.y;
      } else {
        xx = start.x + param * C;
        yy = start.y + param * D;
      }

      const dist = Math.sqrt(Math.pow(x - xx, 2) + Math.pow(y - yy, 2));

      if (dist <= WALL_WIDTH * zoom + 5) {
        setSelectedWall(wall.id);
        return;
      }
    }
  };

  // Export to PNG
  const handleExportPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create high-resolution export
    const exportCanvas = document.createElement('canvas');
    const scale = 2; // 2x resolution
    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `floor-plan-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  // Export to PDF (using print dialog)
  const handleExportPDF = () => {
    setIsPrintMode(true);
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  };

  // Reset view
  const handleResetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={handleClick}
      />

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/95 dark:bg-slate-800/95 rounded-lg p-2 shadow-lg border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((prev) => Math.min(prev * 1.2, 5))}
          title="הגדל"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom((prev) => Math.max(prev * 0.8, 0.2))}
          title="הקטן"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetView}
          title="אפס תצוגה"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <div className="w-px bg-slate-300 dark:bg-slate-600" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPNG}
          title="ייצא כתמונה"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportPDF}
          title="הדפס / PDF"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 rounded px-3 py-1.5 text-sm font-medium shadow border">
        {Math.round(zoom * 100)}%
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .floor-plan-print, .floor-plan-print * {
            visibility: visible;
          }
          .floor-plan-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          canvas {
            width: 100% !important;
            height: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

// PBR Texture configurations for realistic materials
// All textures use procedural generation or external URLs

export interface PBRMaterial {
  color: string;
  roughness: number;
  metalness: number;
  normalScale?: number;
  aoIntensity?: number;
  bumpScale?: number;
  envMapIntensity?: number;
}

// Floor textures with PBR properties
export const FLOOR_MATERIALS: Record<string, PBRMaterial> = {
  default: {
    color: '#f5f5f5',
    roughness: 0.8,
    metalness: 0,
    normalScale: 0.5,
  },
  wood: {
    color: '#8B4513',
    roughness: 0.7,
    metalness: 0,
    normalScale: 1.0,
    bumpScale: 0.02,
  },
  'wood-light': {
    color: '#D2B48C',
    roughness: 0.65,
    metalness: 0,
    normalScale: 0.8,
  },
  'wood-dark': {
    color: '#4a3728',
    roughness: 0.75,
    metalness: 0,
    normalScale: 1.0,
  },
  tile: {
    color: '#d4d4d4',
    roughness: 0.3,
    metalness: 0.1,
    normalScale: 0.3,
  },
  'tile-ceramic': {
    color: '#e8e8e8',
    roughness: 0.2,
    metalness: 0.15,
    normalScale: 0.2,
  },
  marble: {
    color: '#f0f0f0',
    roughness: 0.15,
    metalness: 0.2,
    normalScale: 0.4,
    envMapIntensity: 0.8,
  },
  'marble-dark': {
    color: '#2a2a2a',
    roughness: 0.15,
    metalness: 0.2,
    envMapIntensity: 0.9,
  },
  concrete: {
    color: '#9CA3AF',
    roughness: 0.9,
    metalness: 0,
    normalScale: 1.2,
    bumpScale: 0.03,
  },
  carpet: {
    color: '#6B7280',
    roughness: 0.95,
    metalness: 0,
    normalScale: 0.3,
  },
  'carpet-beige': {
    color: '#C4A484',
    roughness: 0.95,
    metalness: 0,
  },
};

// Wall textures with PBR properties
export const WALL_MATERIALS: Record<string, PBRMaterial> = {
  default: {
    color: '#e5e5e5',
    roughness: 0.9,
    metalness: 0,
    normalScale: 0.2,
  },
  white: {
    color: '#ffffff',
    roughness: 0.85,
    metalness: 0,
  },
  cream: {
    color: '#f5f5dc',
    roughness: 0.85,
    metalness: 0,
  },
  gray: {
    color: '#9CA3AF',
    roughness: 0.8,
    metalness: 0,
  },
  'gray-light': {
    color: '#D1D5DB',
    roughness: 0.85,
    metalness: 0,
  },
  brick: {
    color: '#8B4513',
    roughness: 0.95,
    metalness: 0,
    normalScale: 1.5,
    bumpScale: 0.05,
  },
  'brick-red': {
    color: '#A0522D',
    roughness: 0.92,
    metalness: 0,
    normalScale: 1.5,
  },
  'brick-white': {
    color: '#F5F5F5',
    roughness: 0.9,
    metalness: 0,
    normalScale: 1.2,
  },
  plaster: {
    color: '#FAF0E6',
    roughness: 0.88,
    metalness: 0,
    normalScale: 0.4,
  },
  concrete: {
    color: '#808080',
    roughness: 0.85,
    metalness: 0,
    normalScale: 0.8,
  },
};

// Furniture material presets
export const FURNITURE_MATERIALS: Record<string, PBRMaterial> = {
  // Woods
  'oak': {
    color: '#8B7355',
    roughness: 0.6,
    metalness: 0,
    normalScale: 0.5,
  },
  'walnut': {
    color: '#5D4037',
    roughness: 0.55,
    metalness: 0,
    normalScale: 0.6,
  },
  'pine': {
    color: '#D4A574',
    roughness: 0.65,
    metalness: 0,
    normalScale: 0.4,
  },
  'mahogany': {
    color: '#4A1C1C',
    roughness: 0.5,
    metalness: 0,
    normalScale: 0.7,
  },
  // Fabrics
  'fabric-gray': {
    color: '#6B7280',
    roughness: 0.95,
    metalness: 0,
    normalScale: 0.2,
  },
  'fabric-beige': {
    color: '#C4A484',
    roughness: 0.95,
    metalness: 0,
  },
  'fabric-blue': {
    color: '#4A5568',
    roughness: 0.92,
    metalness: 0,
  },
  'leather-brown': {
    color: '#6B4423',
    roughness: 0.7,
    metalness: 0.1,
    normalScale: 0.3,
  },
  'leather-black': {
    color: '#1a1a1a',
    roughness: 0.65,
    metalness: 0.15,
    envMapIntensity: 0.4,
  },
  // Metals
  'chrome': {
    color: '#C0C0C0',
    roughness: 0.1,
    metalness: 0.95,
    envMapIntensity: 1.0,
  },
  'brushed-steel': {
    color: '#808080',
    roughness: 0.4,
    metalness: 0.9,
    envMapIntensity: 0.7,
  },
  'brass': {
    color: '#B5A642',
    roughness: 0.3,
    metalness: 0.85,
    envMapIntensity: 0.8,
  },
  'matte-black': {
    color: '#1a1a1a',
    roughness: 0.7,
    metalness: 0.8,
  },
  // Ceramics
  'porcelain': {
    color: '#F8F8FF',
    roughness: 0.15,
    metalness: 0.1,
    envMapIntensity: 0.6,
  },
  'ceramic-white': {
    color: '#FFFFFF',
    roughness: 0.2,
    metalness: 0.05,
  },
  // Glass
  'glass-clear': {
    color: '#FFFFFF',
    roughness: 0.05,
    metalness: 0.1,
    envMapIntensity: 1.0,
  },
  'glass-frosted': {
    color: '#E8E8E8',
    roughness: 0.4,
    metalness: 0.05,
  },
};

// Door and window materials
export const DOOR_MATERIALS: Record<string, PBRMaterial> = {
  'wood-natural': {
    color: '#A0522D',
    roughness: 0.6,
    metalness: 0,
    normalScale: 0.5,
  },
  'wood-dark': {
    color: '#4A3728',
    roughness: 0.55,
    metalness: 0,
    normalScale: 0.6,
  },
  'wood-white': {
    color: '#F5F5F5',
    roughness: 0.65,
    metalness: 0,
  },
  'wood-gray': {
    color: '#808080',
    roughness: 0.6,
    metalness: 0,
  },
};

export const WINDOW_MATERIALS: Record<string, PBRMaterial> = {
  'frame-white': {
    color: '#FFFFFF',
    roughness: 0.3,
    metalness: 0.05,
  },
  'frame-black': {
    color: '#1a1a1a',
    roughness: 0.35,
    metalness: 0.1,
  },
  'frame-aluminum': {
    color: '#C0C0C0',
    roughness: 0.25,
    metalness: 0.8,
    envMapIntensity: 0.6,
  },
  'glass': {
    color: '#87CEEB',
    roughness: 0.05,
    metalness: 0.1,
    envMapIntensity: 0.8,
  },
};

// Helper function to get material by ID
export function getMaterial(category: 'floor' | 'wall' | 'furniture' | 'door' | 'window', id: string): PBRMaterial {
  switch (category) {
    case 'floor':
      return FLOOR_MATERIALS[id] || FLOOR_MATERIALS.default;
    case 'wall':
      return WALL_MATERIALS[id] || WALL_MATERIALS.default;
    case 'furniture':
      return FURNITURE_MATERIALS[id] || FURNITURE_MATERIALS['oak'];
    case 'door':
      return DOOR_MATERIALS[id] || DOOR_MATERIALS['wood-natural'];
    case 'window':
      return WINDOW_MATERIALS[id] || WINDOW_MATERIALS['frame-white'];
    default:
      return { color: '#808080', roughness: 0.5, metalness: 0 };
  }
}

// Texture repeat settings for different materials
export const TEXTURE_REPEAT: Record<string, { x: number; y: number }> = {
  wood: { x: 2, y: 2 },
  tile: { x: 4, y: 4 },
  marble: { x: 1, y: 1 },
  brick: { x: 3, y: 3 },
  concrete: { x: 2, y: 2 },
  carpet: { x: 3, y: 3 },
  fabric: { x: 5, y: 5 },
};

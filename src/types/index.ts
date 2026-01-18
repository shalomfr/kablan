// Types for Contractor SaaS Platform

// ==================== Organization & Users ====================

export type UserRole = 'admin' | 'contractor' | 'employee';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  plan: PlanType;
  settings: OrganizationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  currency: string;
  language: string;
  taxRate: number;
  defaultWasteFactor: number;
  defaultContingency: number;
  logo?: string;
  companyInfo: {
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    licenseNumber?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== Projects ====================

export type ProjectStatus = 'draft' | 'quoted' | 'approved' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  address?: string;
  status: ProjectStatus;
  organizationId: string;
  userId: string;
  totalCost: number;
  rooms: Room[];
  workItems: WorkItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  width: number;
  length: number;
  height: number;
  projectId: string;
  workItems: WorkItem[];
}

// ==================== Work Categories ====================

export type WorkCategory =
  | 'earthwork'           // עבודות עפר וחפירה
  | 'concrete'            // בטון ויציקות
  | 'construction'        // בנייה ומבנה
  | 'waterproofing'       // איטום ובידוד
  | 'plaster'             // טיח ושליכט
  | 'drywall'             // גבס וקונסטרוקציות יבשות
  | 'flooring'            // ריצוף וחיפוי
  | 'painting'            // צבע וגימורים
  | 'carpentry'           // נגרות ועץ
  | 'aluminum'            // אלומיניום וחלונות
  | 'metalwork'           // נירוסטה ומתכת
  | 'roofing'             // גגות
  | 'plumbing'            // אינסטלציה
  | 'electrical'          // חשמל ותאורה
  | 'hvac'                // מיזוג ואוורור
  | 'security'            // בטיחות ואבטחה
  | 'pool'                // בריכות וספא
  | 'landscaping'         // פיתוח שטח וגינון
  | 'elevator'            // מעליות
  | 'special'             // עבודות מיוחדות
  | 'demolition';         // הריסה ופירוק

export type MeasurementUnit = 'sqm' | 'lm' | 'cbm' | 'unit' | 'kg' | 'liter' | 'kwh' | 'ton' | 'point';

export interface WorkSubcategory {
  id: string;
  category: WorkCategory;
  nameHe: string;
  nameEn: string;
  parameters: WorkParameter[];
  unit: MeasurementUnit;
  defaultMaterials: string[];
  wasteFactor: number;
  laborRate: number;
}

export interface WorkParameter {
  id: string;
  nameHe: string;
  nameEn: string;
  type: 'number' | 'select' | 'boolean' | 'text';
  options?: string[];
  defaultValue?: string | number | boolean;
  unit?: string;
  required: boolean;
}

// ==================== Work Items ====================

export interface WorkItem {
  id: string;
  projectId: string;
  roomId?: string;
  category: WorkCategory;
  subcategory: string;
  description?: string;
  measurements: Measurements;
  materials: MaterialSelection[];
  laborType: LaborType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  wasteFactor: number;
  contingency: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  parameters: Record<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Measurements {
  quantity: number;
  unit: MeasurementUnit;
  width?: number;
  length?: number;
  height?: number;
  depth?: number;
  area?: number;
  volume?: number;
}

export type LaborType = 'self' | 'subcontractor' | 'employee';

// ==================== Materials ====================

export interface Material {
  id: string;
  name: string;
  nameHe: string;
  category: WorkCategory;
  subcategory?: string;
  unit: MeasurementUnit;
  basePrice: number;
  specifications: Record<string, unknown>;
  imageUrl?: string;
  model3dUrl?: string;
  suppliers: Supplier[];
}

export interface MaterialSelection {
  materialId: string;
  material: Material;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  price: number;
  deliveryTime: number;
  minOrder: number;
  rating: number;
}

export interface MaterialPrice {
  id: string;
  materialId: string;
  organizationId: string;
  customPrice: number;
  supplierId?: string;
  notes?: string;
  updatedAt: Date;
}

// ==================== Quotes ====================

export interface Quote {
  id: string;
  projectId: string;
  version: number;
  totalMaterials: number;
  totalLabor: number;
  totalContingency: number;
  discount: number;
  tax: number;
  grandTotal: number;
  validUntil: Date;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  createdAt: Date;
}

// ==================== 3D Builder ====================

export interface Room3D {
  id: string;
  name: string;
  walls: Wall3D[];
  floor: Floor3D;
  ceiling: Ceiling3D;
  doors: Door3D[];
  windows: Window3D[];
  objects: Object3D[];
}

export interface Wall3D {
  id: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  height: number;
  thickness: number;
  material?: Material3D;
  openings: WallOpening[];
}

export interface WallOpening {
  id: string;
  type: 'door' | 'window';
  position: number;
  width: number;
  height: number;
  fromFloor: number;
}

export interface Floor3D {
  material?: Material3D;
  area: number;
}

export interface Ceiling3D {
  height: number;
  material?: Material3D;
}

export interface Door3D {
  id: string;
  type: 'standard' | 'sliding' | 'pivot' | 'security' | 'barn' | 'folding';
  width: number;
  height: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  wallId?: string;
  material?: Material3D;
}

export interface Window3D {
  id: string;
  type: 'single' | 'double' | 'sliding' | 'skylight' | 'tilt_turn';
  width: number;
  height: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  glazing: 'single' | 'double' | 'triple';
  wallId?: string;
  material?: Material3D;
}

export interface Object3D {
  id: string;
  type: string;
  category: 'furniture' | 'fixture' | 'electrical' | 'hvac' | 'decoration';
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
  modelUrl?: string;
  material?: Material3D;
}

export interface Material3D {
  id: string;
  name: string;
  color: string;
  textureUrl?: string;
  roughness: number;
  metalness: number;
  linkedMaterial?: Material;
}

// ==================== Dashboard ====================

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  pendingQuotes: number;
  acceptedQuotes: number;
  averageProjectValue: number;
}

export interface ProjectSummary {
  id: string;
  name: string;
  clientName: string;
  status: ProjectStatus;
  totalCost: number;
  progress: number;
  updatedAt: Date;
}

// ==================== Calculator State ====================

export interface CalculatorState {
  currentProject: Project | null;
  selectedCategory: WorkCategory | null;
  selectedSubcategory: string | null;
  workItems: WorkItem[];
  totalMaterials: number;
  totalLabor: number;
  grandTotal: number;
}

// ==================== API Response ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}



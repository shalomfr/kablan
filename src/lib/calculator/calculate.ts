import { WorkItem, WorkSubcategory, MeasurementUnit } from '@/types';
import { getSubcategoryByIdFromAll } from '@/data';

export interface CalculationInput {
  subcategoryId: string;
  quantity: number;
  laborRate: number;
  materialCostPerUnit: number;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  customWasteFactor?: number;
  customContingency?: number;
  parameters?: Record<string, unknown>;
}

export interface CalculationOutput {
  subcategoryId: string;
  subcategoryName: string;
  quantity: number;
  unit: MeasurementUnit;
  laborCost: number;
  baseMaterialCost: number;
  wasteCost: number;
  materialCostWithWaste: number;
  subtotal: number;
  contingencyCost: number;
  totalCost: number;
  breakdown: {
    wasteFactor: number;
    contingency: number;
    difficultyMultiplier: number;
  };
}

export interface ProjectCalculation {
  items: CalculationOutput[];
  summary: {
    totalLabor: number;
    totalMaterials: number;
    totalWaste: number;
    totalContingency: number;
    subtotal: number;
    grandTotal: number;
  };
}

// Difficulty multipliers for labor costs
const difficultyMultipliers: Record<number, number> = {
  1: 0.8,  // Very easy
  2: 0.9,  // Easy
  3: 1.0,  // Normal
  4: 1.2,  // Hard
  5: 1.5,  // Very hard
};

/**
 * Calculate costs for a single work item
 */
export function calculateItem(input: CalculationInput): CalculationOutput | null {
  const subcategory = getSubcategoryByIdFromAll(input.subcategoryId);
  
  if (!subcategory) {
    return null;
  }

  const difficulty = input.difficulty || 3;
  const difficultyMultiplier = difficultyMultipliers[difficulty];
  const wasteFactor = input.customWasteFactor ?? subcategory.wasteFactor ?? 0.1;
  const contingency = input.customContingency ?? 0.1;

  // Calculate labor cost with difficulty multiplier
  const laborCost = input.quantity * input.laborRate * difficultyMultiplier;

  // Calculate material costs
  const baseMaterialCost = input.quantity * input.materialCostPerUnit;
  const wasteCost = baseMaterialCost * wasteFactor;
  const materialCostWithWaste = baseMaterialCost + wasteCost;

  // Calculate subtotal and contingency
  const subtotal = laborCost + materialCostWithWaste;
  const contingencyCost = subtotal * contingency;
  const totalCost = subtotal + contingencyCost;

  return {
    subcategoryId: input.subcategoryId,
    subcategoryName: subcategory.nameHe,
    quantity: input.quantity,
    unit: subcategory.unit,
    laborCost,
    baseMaterialCost,
    wasteCost,
    materialCostWithWaste,
    subtotal,
    contingencyCost,
    totalCost,
    breakdown: {
      wasteFactor,
      contingency,
      difficultyMultiplier,
    },
  };
}

/**
 * Calculate costs for multiple work items (full project)
 */
export function calculateProject(inputs: CalculationInput[]): ProjectCalculation {
  const items: CalculationOutput[] = [];
  let totalLabor = 0;
  let totalMaterials = 0;
  let totalWaste = 0;
  let totalContingency = 0;

  for (const input of inputs) {
    const result = calculateItem(input);
    if (result) {
      items.push(result);
      totalLabor += result.laborCost;
      totalMaterials += result.baseMaterialCost;
      totalWaste += result.wasteCost;
      totalContingency += result.contingencyCost;
    }
  }

  const subtotal = totalLabor + totalMaterials + totalWaste;
  const grandTotal = subtotal + totalContingency;

  return {
    items,
    summary: {
      totalLabor,
      totalMaterials,
      totalWaste,
      totalContingency,
      subtotal,
      grandTotal,
    },
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'ILS'): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate area from dimensions
 */
export function calculateArea(width: number, length: number): number {
  return width * length;
}

/**
 * Calculate volume from dimensions
 */
export function calculateVolume(width: number, length: number, height: number): number {
  return width * length * height;
}

/**
 * Calculate perimeter
 */
export function calculatePerimeter(width: number, length: number): number {
  return 2 * (width + length);
}

/**
 * Calculate wall area (perimeter * height - openings)
 */
export function calculateWallArea(
  width: number,
  length: number,
  height: number,
  openingsArea: number = 0
): number {
  const perimeter = calculatePerimeter(width, length);
  const totalWallArea = perimeter * height;
  return Math.max(0, totalWallArea - openingsArea);
}

/**
 * Estimate materials needed based on quantity and unit
 */
export function estimateMaterials(
  quantity: number,
  unit: MeasurementUnit,
  materialType: string
): { quantity: number; unit: string }[] {
  // This is a simplified estimation - in production, this would be more sophisticated
  const estimates: Record<string, { quantity: number; unit: string }[]> = {
    'block-20': [
      { quantity: quantity * 12.5, unit: 'יח\'' }, // blocks per sqm
      { quantity: quantity * 0.02, unit: 'מ"ק' },   // mortar
    ],
    'concrete-floor': [
      { quantity: quantity, unit: 'מ"ק' },          // concrete
      { quantity: quantity * 0.1, unit: 'מ"ק' },    // rebar steel
    ],
    'tile-ceramic': [
      { quantity: quantity * 1.1, unit: 'מ"ר' },    // tiles with waste
      { quantity: quantity * 5, unit: 'ק"ג' },      // adhesive
      { quantity: quantity * 0.5, unit: 'ק"ג' },    // grout
    ],
  };

  return estimates[materialType] || [];
}

/**
 * Get unit label in Hebrew
 */
export function getUnitLabel(unit: MeasurementUnit): string {
  const labels: Record<MeasurementUnit, string> = {
    sqm: 'מ"ר',
    lm: 'מ"א',
    cbm: 'מ"ק',
    unit: 'יחידה',
    kg: 'ק"ג',
    liter: 'ליטר',
    kwh: 'קוו"ט',
    ton: 'טון',
    point: 'נקודה',
  };
  return labels[unit];
}


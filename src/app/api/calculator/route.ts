import { NextRequest, NextResponse } from 'next/server';
import { getSubcategoryByIdFromAll } from '@/data';
import { WorkItem, MeasurementUnit } from '@/types';

interface CalculationRequest {
  items: {
    subcategoryId: string;
    quantity: number;
    laborRate: number;
    materialCost: number;
    parameters?: Record<string, unknown>;
  }[];
}

interface CalculationResult {
  items: {
    subcategoryId: string;
    subcategoryName: string;
    quantity: number;
    unit: MeasurementUnit;
    laborCost: number;
    materialCost: number;
    wasteFactor: number;
    contingency: number;
    totalCost: number;
  }[];
  summary: {
    totalLabor: number;
    totalMaterials: number;
    totalWaste: number;
    totalContingency: number;
    grandTotal: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculationRequest = await request.json();

    if (!body.items || !Array.isArray(body.items)) {
      return NextResponse.json(
        { success: false, error: 'Items array is required' },
        { status: 400 }
      );
    }

    const calculatedItems: CalculationResult['items'] = [];
    let totalLabor = 0;
    let totalMaterials = 0;
    let totalWaste = 0;
    let totalContingency = 0;

    for (const item of body.items) {
      const subcategory = getSubcategoryByIdFromAll(item.subcategoryId);

      if (!subcategory) {
        continue;
      }

      const wasteFactor = subcategory.wasteFactor || 0.1;
      const contingency = 0.1;

      const laborCost = item.quantity * item.laborRate;
      const baseMaterialCost = item.quantity * item.materialCost;
      const wasteAmount = baseMaterialCost * wasteFactor;
      const materialWithWaste = baseMaterialCost + wasteAmount;
      const subtotal = laborCost + materialWithWaste;
      const contingencyAmount = subtotal * contingency;
      const itemTotal = subtotal + contingencyAmount;

      calculatedItems.push({
        subcategoryId: item.subcategoryId,
        subcategoryName: subcategory.nameHe,
        quantity: item.quantity,
        unit: subcategory.unit,
        laborCost,
        materialCost: materialWithWaste,
        wasteFactor,
        contingency,
        totalCost: itemTotal,
      });

      totalLabor += laborCost;
      totalMaterials += baseMaterialCost;
      totalWaste += wasteAmount;
      totalContingency += contingencyAmount;
    }

    const result: CalculationResult = {
      items: calculatedItems,
      summary: {
        totalLabor,
        totalMaterials: totalMaterials + totalWaste,
        totalWaste,
        totalContingency,
        grandTotal: totalLabor + totalMaterials + totalWaste + totalContingency,
      },
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate' },
      { status: 500 }
    );
  }
}



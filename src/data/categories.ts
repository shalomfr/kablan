import { WorkCategory, MeasurementUnit, WorkSubcategory } from '@/types';

// Category metadata
export const categoryMetadata: Record<WorkCategory, { nameHe: string; nameEn: string; icon: string }> = {
  earthwork: { nameHe: 'עבודות עפר וחפירה', nameEn: 'Earthwork', icon: 'Shovel' },
  concrete: { nameHe: 'בטון ויציקות', nameEn: 'Concrete', icon: 'Box' },
  construction: { nameHe: 'בנייה ומבנה', nameEn: 'Construction', icon: 'Brick' },
  waterproofing: { nameHe: 'איטום ובידוד', nameEn: 'Waterproofing', icon: 'Droplet' },
  plaster: { nameHe: 'טיח ושליכט', nameEn: 'Plaster', icon: 'PaintBucket' },
  drywall: { nameHe: 'גבס וקונסטרוקציות', nameEn: 'Drywall', icon: 'Layers' },
  flooring: { nameHe: 'ריצוף וחיפוי', nameEn: 'Flooring', icon: 'Grid3x3' },
  painting: { nameHe: 'צבע וגימורים', nameEn: 'Painting', icon: 'Paintbrush' },
  carpentry: { nameHe: 'נגרות ועץ', nameEn: 'Carpentry', icon: 'TreeDeciduous' },
  aluminum: { nameHe: 'אלומיניום וחלונות', nameEn: 'Aluminum', icon: 'Square' },
  metalwork: { nameHe: 'נירוסטה ומתכת', nameEn: 'Metalwork', icon: 'CircleDot' },
  roofing: { nameHe: 'גגות', nameEn: 'Roofing', icon: 'Home' },
  plumbing: { nameHe: 'אינסטלציה', nameEn: 'Plumbing', icon: 'Droplets' },
  electrical: { nameHe: 'חשמל ותאורה', nameEn: 'Electrical', icon: 'Zap' },
  hvac: { nameHe: 'מיזוג ואוורור', nameEn: 'HVAC', icon: 'Wind' },
  security: { nameHe: 'בטיחות ואבטחה', nameEn: 'Security', icon: 'Shield' },
  pool: { nameHe: 'בריכות וספא', nameEn: 'Pool & Spa', icon: 'Waves' },
  landscaping: { nameHe: 'פיתוח שטח וגינון', nameEn: 'Landscaping', icon: 'Trees' },
  elevator: { nameHe: 'מעליות', nameEn: 'Elevator', icon: 'ArrowUpDown' },
  special: { nameHe: 'עבודות מיוחדות', nameEn: 'Special Works', icon: 'Star' },
  demolition: { nameHe: 'הריסה ופירוק', nameEn: 'Demolition', icon: 'Hammer' },
};

// Subcategories for each category
export const subcategories: WorkSubcategory[] = [
  // ========== EARTHWORK ==========
  { id: 'earth-dig-soft', category: 'earthwork', nameHe: 'חפירה בקרקע רכה', nameEn: 'Soft ground excavation', unit: 'cbm', wasteFactor: 0, laborRate: 45, parameters: [{ id: 'depth', nameHe: 'עומק', nameEn: 'Depth', type: 'number', unit: 'מ', required: true }, { id: 'area', nameHe: 'שטח', nameEn: 'Area', type: 'number', unit: 'מ"ר', required: true }], defaultMaterials: [] },
  { id: 'earth-dig-rock', category: 'earthwork', nameHe: 'חפירה בסלע', nameEn: 'Rock excavation', unit: 'cbm', wasteFactor: 0, laborRate: 120, parameters: [{ id: 'depth', nameHe: 'עומק', nameEn: 'Depth', type: 'number', unit: 'מ', required: true }, { id: 'hardness', nameHe: 'קשיות', nameEn: 'Hardness', type: 'select', options: ['רך', 'בינוני', 'קשה'], required: true }], defaultMaterials: [] },
  { id: 'earth-fill', category: 'earthwork', nameHe: 'מילוי והידוק', nameEn: 'Fill and compaction', unit: 'cbm', wasteFactor: 0.1, laborRate: 35, parameters: [{ id: 'fillType', nameHe: 'סוג מילוי', nameEn: 'Fill type', type: 'select', options: ['חול', 'חצץ', 'אבן מחצבה'], required: true }], defaultMaterials: ['fill-sand', 'fill-gravel'] },
  { id: 'earth-level', category: 'earthwork', nameHe: 'פילוס שטח', nameEn: 'Ground leveling', unit: 'sqm', wasteFactor: 0, laborRate: 15, parameters: [], defaultMaterials: [] },
  { id: 'earth-foundation', category: 'earthwork', nameHe: 'חפירת יסודות', nameEn: 'Foundation excavation', unit: 'cbm', wasteFactor: 0, laborRate: 55, parameters: [{ id: 'foundationType', nameHe: 'סוג יסוד', nameEn: 'Foundation type', type: 'select', options: ['רגליים', 'רצף', 'רפסודה'], required: true }], defaultMaterials: [] },
  { id: 'earth-pit', category: 'earthwork', nameHe: 'חפירת בורות', nameEn: 'Pit excavation', unit: 'unit', wasteFactor: 0, laborRate: 250, parameters: [{ id: 'diameter', nameHe: 'קוטר', nameEn: 'Diameter', type: 'number', unit: 'מ', required: true }, { id: 'depth', nameHe: 'עומק', nameEn: 'Depth', type: 'number', unit: 'מ', required: true }], defaultMaterials: [] },
  { id: 'earth-drainage', category: 'earthwork', nameHe: 'ניקוז שטח', nameEn: 'Ground drainage', unit: 'lm', wasteFactor: 0.05, laborRate: 65, parameters: [], defaultMaterials: ['drainage-pipe'] },
  { id: 'earth-waste', category: 'earthwork', nameHe: 'הרחקת פסולת בניין', nameEn: 'Construction waste removal', unit: 'cbm', wasteFactor: 0, laborRate: 85, parameters: [], defaultMaterials: [] },

  // ========== CONCRETE ==========
  { id: 'concrete-foundation', category: 'concrete', nameHe: 'בטון יסודות', nameEn: 'Foundation concrete', unit: 'cbm', wasteFactor: 0.05, laborRate: 180, parameters: [{ id: 'strength', nameHe: 'חוזק', nameEn: 'Strength', type: 'select', options: ['B20', 'B25', 'B30', 'B40'], required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-floor', category: 'concrete', nameHe: 'רצפת בטון', nameEn: 'Concrete floor', unit: 'cbm', wasteFactor: 0.05, laborRate: 150, parameters: [{ id: 'thickness', nameHe: 'עובי', nameEn: 'Thickness', type: 'number', unit: 'ס"מ', required: true }], defaultMaterials: ['concrete-b25', 'mesh-wire'] },
  { id: 'concrete-wall', category: 'concrete', nameHe: 'קירות בטון', nameEn: 'Concrete walls', unit: 'cbm', wasteFactor: 0.05, laborRate: 220, parameters: [{ id: 'thickness', nameHe: 'עובי', nameEn: 'Thickness', type: 'number', unit: 'ס"מ', required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-column', category: 'concrete', nameHe: 'עמודים', nameEn: 'Columns', unit: 'unit', wasteFactor: 0.05, laborRate: 350, parameters: [{ id: 'height', nameHe: 'גובה', nameEn: 'Height', type: 'number', unit: 'מ', required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-beam', category: 'concrete', nameHe: 'קורות', nameEn: 'Beams', unit: 'lm', wasteFactor: 0.05, laborRate: 280, parameters: [{ id: 'section', nameHe: 'חתך', nameEn: 'Section', type: 'text', required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-slab', category: 'concrete', nameHe: 'תקרת בטון יצוקה', nameEn: 'Cast concrete slab', unit: 'sqm', wasteFactor: 0.05, laborRate: 180, parameters: [{ id: 'thickness', nameHe: 'עובי', nameEn: 'Thickness', type: 'number', unit: 'ס"מ', required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-pal-kal', category: 'concrete', nameHe: 'תקרת פלדל', nameEn: 'Pal-Kal slab', unit: 'sqm', wasteFactor: 0.03, laborRate: 120, parameters: [{ id: 'type', nameHe: 'סוג פלדל', nameEn: 'Pal-Kal type', type: 'select', options: ['23', '25', '30'], required: true }], defaultMaterials: ['pal-kal', 'concrete-b25', 'mesh-wire'] },
  { id: 'concrete-stairs', category: 'concrete', nameHe: 'מדרגות בטון', nameEn: 'Concrete stairs', unit: 'unit', wasteFactor: 0.05, laborRate: 450, parameters: [{ id: 'steps', nameHe: 'מספר מדרגות', nameEn: 'Number of steps', type: 'number', required: true }], defaultMaterials: ['concrete-b30', 'rebar', 'formwork'] },
  { id: 'concrete-pool', category: 'concrete', nameHe: 'בריכת שחייה', nameEn: 'Swimming pool', unit: 'cbm', wasteFactor: 0.05, laborRate: 300, parameters: [], defaultMaterials: ['concrete-waterproof', 'rebar'] },
  { id: 'concrete-polished', category: 'concrete', nameHe: 'בטון מוחלק', nameEn: 'Polished concrete', unit: 'sqm', wasteFactor: 0.03, laborRate: 95, parameters: [], defaultMaterials: ['concrete-b25', 'polisher'] },
  { id: 'concrete-stamped', category: 'concrete', nameHe: 'בטון מוטבע', nameEn: 'Stamped concrete', unit: 'sqm', wasteFactor: 0.03, laborRate: 120, parameters: [{ id: 'pattern', nameHe: 'דוגמה', nameEn: 'Pattern', type: 'select', options: ['אבן', 'לבנים', 'עץ', 'אחר'], required: true }], defaultMaterials: ['concrete-b25', 'stamp-color'] },
  { id: 'concrete-lean', category: 'concrete', nameHe: 'בטון רזה', nameEn: 'Lean concrete', unit: 'sqm', wasteFactor: 0.03, laborRate: 35, parameters: [{ id: 'thickness', nameHe: 'עובי', nameEn: 'Thickness', type: 'number', unit: 'ס"מ', required: true }], defaultMaterials: ['concrete-lean'] },
  { id: 'concrete-light', category: 'concrete', nameHe: 'בטון קל', nameEn: 'Lightweight concrete', unit: 'sqm', wasteFactor: 0.05, laborRate: 65, parameters: [{ id: 'thickness', nameHe: 'עובי', nameEn: 'Thickness', type: 'number', unit: 'ס"מ', required: true }], defaultMaterials: ['concrete-light'] },
];

export function getSubcategoriesByCategory(category: WorkCategory): WorkSubcategory[] {
  return subcategories.filter(sub => sub.category === category);
}

export function getSubcategoryById(id: string): WorkSubcategory | undefined {
  return subcategories.find(sub => sub.id === id);
}


// Export all data
export { categoryMetadata, subcategories, getSubcategoriesByCategory, getSubcategoryById } from './categories';
export { constructionSubcategories } from './subcategories-construction';
export { finishesSubcategories } from './subcategories-finishes';
export { systemsSubcategories } from './subcategories-systems';
export { utilitiesSubcategories } from './subcategories-utilities';

import { subcategories } from './categories';
import { constructionSubcategories } from './subcategories-construction';
import { finishesSubcategories } from './subcategories-finishes';
import { systemsSubcategories } from './subcategories-systems';
import { utilitiesSubcategories } from './subcategories-utilities';
import { WorkCategory, WorkSubcategory } from '@/types';

// All subcategories combined
export const allSubcategories: WorkSubcategory[] = [
  ...subcategories,
  ...constructionSubcategories,
  ...finishesSubcategories,
  ...systemsSubcategories,
  ...utilitiesSubcategories,
];

// Get all subcategories for a category
export function getAllSubcategoriesByCategory(category: WorkCategory): WorkSubcategory[] {
  return allSubcategories.filter(sub => sub.category === category);
}

// Get subcategory by ID from all
export function getSubcategoryByIdFromAll(id: string): WorkSubcategory | undefined {
  return allSubcategories.find(sub => sub.id === id);
}

// Get all categories list
export function getAllCategories(): WorkCategory[] {
  return [
    'earthwork', 'concrete', 'construction', 'waterproofing', 'plaster',
    'drywall', 'flooring', 'painting', 'carpentry', 'aluminum',
    'metalwork', 'roofing', 'plumbing', 'electrical', 'hvac',
    'security', 'pool', 'landscaping', 'elevator', 'special', 'demolition'
  ];
}



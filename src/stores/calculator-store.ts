'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WorkCategory, WorkItem, Project, Room, MaterialSelection } from '@/types';

interface CalculatorState {
  // Current project
  currentProject: Partial<Project> | null;
  
  // Current room
  currentRoom: Partial<Room> | null;
  
  // Work items being calculated
  workItems: Partial<WorkItem>[];
  
  // Selected category and subcategory
  selectedCategory: WorkCategory | null;
  selectedSubcategory: string | null;
  
  // Current work item being edited
  currentWorkItem: Partial<WorkItem> | null;
  
  // Totals
  totalMaterials: number;
  totalLabor: number;
  grandTotal: number;
  
  // Actions
  setCurrentProject: (project: Partial<Project> | null) => void;
  setCurrentRoom: (room: Partial<Room> | null) => void;
  setSelectedCategory: (category: WorkCategory | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;
  setCurrentWorkItem: (item: Partial<WorkItem> | null) => void;
  
  addWorkItem: (item: Partial<WorkItem>) => void;
  updateWorkItem: (id: string, item: Partial<WorkItem>) => void;
  removeWorkItem: (id: string) => void;
  clearWorkItems: () => void;
  
  calculateTotals: () => void;
  reset: () => void;
}

const initialState = {
  currentProject: null,
  currentRoom: null,
  workItems: [],
  selectedCategory: null,
  selectedSubcategory: null,
  currentWorkItem: null,
  totalMaterials: 0,
  totalLabor: 0,
  grandTotal: 0,
};

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setCurrentProject: (project) => set({ currentProject: project }),
      
      setCurrentRoom: (room) => set({ currentRoom: room }),
      
      setSelectedCategory: (category) => set({ 
        selectedCategory: category,
        selectedSubcategory: null,
        currentWorkItem: null,
      }),
      
      setSelectedSubcategory: (subcategory) => set({ 
        selectedSubcategory: subcategory,
        currentWorkItem: {
          category: get().selectedCategory!,
          subcategory: subcategory!,
          measurements: {
            quantity: 0,
            unit: 'sqm',
          },
          difficulty: 3,
          wasteFactor: 0.1,
          contingency: 0.1,
          materialCost: 0,
          laborCost: 0,
          totalCost: 0,
          parameters: {},
          materials: [],
          laborType: 'subcontractor',
        },
      }),
      
      setCurrentWorkItem: (item) => set({ currentWorkItem: item }),
      
      addWorkItem: (item) => {
        const id = crypto.randomUUID();
        const newItem = { ...item, id };
        set((state) => ({
          workItems: [...state.workItems, newItem],
          currentWorkItem: null,
          selectedSubcategory: null,
        }));
        get().calculateTotals();
      },
      
      updateWorkItem: (id, item) => {
        set((state) => ({
          workItems: state.workItems.map((w) => 
            w.id === id ? { ...w, ...item } : w
          ),
        }));
        get().calculateTotals();
      },
      
      removeWorkItem: (id) => {
        set((state) => ({
          workItems: state.workItems.filter((w) => w.id !== id),
        }));
        get().calculateTotals();
      },
      
      clearWorkItems: () => {
        set({ workItems: [] });
        get().calculateTotals();
      },
      
      calculateTotals: () => {
        const { workItems } = get();
        const totalMaterials = workItems.reduce((sum, item) => sum + (item.materialCost || 0), 0);
        const totalLabor = workItems.reduce((sum, item) => sum + (item.laborCost || 0), 0);
        const grandTotal = workItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
        set({ totalMaterials, totalLabor, grandTotal });
      },
      
      reset: () => set(initialState),
    }),
    {
      name: 'calculator-storage',
      partialize: (state) => ({
        currentProject: state.currentProject,
        workItems: state.workItems,
      }),
    }
  )
);


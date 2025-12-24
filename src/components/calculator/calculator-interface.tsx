'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalculatorStore } from '@/stores/calculator-store';
import { categoryMetadata } from '@/data/categories';
import { getAllSubcategoriesByCategory } from '@/data';
import { WorkCategory, WorkSubcategory, MeasurementUnit } from '@/types';
import {
  Calculator,
  Plus,
  Trash2,
  Save,
  FileText,
  ChevronLeft,
  Package,
  Wrench,
  DollarSign,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const unitLabels: Record<MeasurementUnit, string> = {
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

export function CalculatorInterface() {
  const {
    selectedCategory,
    selectedSubcategory,
    workItems,
    currentWorkItem,
    totalMaterials,
    totalLabor,
    grandTotal,
    setSelectedCategory,
    setSelectedSubcategory,
    setCurrentWorkItem,
    addWorkItem,
    removeWorkItem,
    calculateTotals,
  } = useCalculatorStore();

  const [quantity, setQuantity] = useState<number>(0);
  const [laborRate, setLaborRate] = useState<number>(0);
  const [materialCost, setMaterialCost] = useState<number>(0);

  const categories = Object.entries(categoryMetadata) as [WorkCategory, { nameHe: string; nameEn: string; icon: string }][];

  const subcategories = selectedCategory
    ? getAllSubcategoriesByCategory(selectedCategory)
    : [];

  const selectedSubcategoryData = subcategories.find(
    (s) => s.id === selectedSubcategory
  );

  const handleAddItem = () => {
    if (!selectedSubcategoryData || quantity <= 0) return;

    const laborCost = quantity * laborRate;
    const totalMaterialCost = quantity * materialCost;
    const wasteFactor = selectedSubcategoryData.wasteFactor || 0.1;
    const contingency = 0.1;

    const materialWithWaste = totalMaterialCost * (1 + wasteFactor);
    const subtotal = materialWithWaste + laborCost;
    const total = subtotal * (1 + contingency);

    addWorkItem({
      category: selectedCategory!,
      subcategory: selectedSubcategory!,
      description: selectedSubcategoryData.nameHe,
      measurements: {
        quantity,
        unit: selectedSubcategoryData.unit,
      },
      laborCost,
      materialCost: materialWithWaste,
      totalCost: total,
      wasteFactor,
      contingency,
      difficulty: 3,
      parameters: {},
      materials: [],
      laborType: 'subcontractor',
    });

    // Reset form
    setQuantity(0);
    setLaborRate(selectedSubcategoryData.laborRate || 0);
    setMaterialCost(0);
  };

  const handleSelectSubcategory = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
    const subcat = subcategories.find((s) => s.id === subcategoryId);
    if (subcat) {
      setLaborRate(subcat.laborRate || 0);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon || LucideIcons.Box;
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Categories Panel */}
      <div className="w-64 border-l bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b">
          <h2 className="font-semibold">קטגוריות עבודה</h2>
        </div>
        <ScrollArea className="h-[calc(100%-4rem)]">
          <div className="p-2 space-y-1">
            {categories.map(([key, value]) => {
              const IconComponent = getIconComponent(value.icon);
              return (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => setSelectedCategory(key)}
                >
                  <IconComponent className="size-4" />
                  <span className="truncate">{value.nameHe}</span>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="input" className="flex-1 flex flex-col">
          <div className="border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="input" className="gap-2">
                <Plus className="size-4" />
                הוספת פריט
              </TabsTrigger>
              <TabsTrigger value="items" className="gap-2">
                <Package className="size-4" />
                פריטים ({workItems.length})
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2">
                <Calculator className="size-4" />
                סיכום
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="input" className="flex-1 p-4 m-0">
            {selectedCategory ? (
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Subcategories */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {(() => {
                        const IconComponent = getIconComponent(categoryMetadata[selectedCategory].icon);
                        return <IconComponent className="size-5" />;
                      })()}
                      {categoryMetadata[selectedCategory].nameHe}
                    </CardTitle>
                    <CardDescription>
                      בחר סוג עבודה מהרשימה
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[400px]">
                      <div className="p-4 space-y-1">
                        {subcategories.map((subcat) => (
                          <Button
                            key={subcat.id}
                            variant={selectedSubcategory === subcat.id ? 'secondary' : 'ghost'}
                            className="w-full justify-between text-right"
                            onClick={() => handleSelectSubcategory(subcat.id)}
                          >
                            <span className="truncate">{subcat.nameHe}</span>
                            <Badge variant="outline" className="mr-2">
                              {unitLabels[subcat.unit]}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Input Form */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wrench className="size-5" />
                      פרטי העבודה
                    </CardTitle>
                    {selectedSubcategoryData && (
                      <CardDescription>
                        {selectedSubcategoryData.nameHe}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedSubcategoryData ? (
                      <>
                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>כמות ({unitLabels[selectedSubcategoryData.unit]})</Label>
                          <Input
                            type="number"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                            placeholder="הזן כמות"
                            min={0}
                            step={0.1}
                          />
                        </div>

                        {/* Parameters */}
                        {selectedSubcategoryData.parameters.map((param) => (
                          <div key={param.id} className="space-y-2">
                            <Label>{param.nameHe}</Label>
                            {param.type === 'select' ? (
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {param.options?.map((opt) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : param.type === 'boolean' ? (
                              <Select>
                                <SelectTrigger>
                                  <SelectValue placeholder="בחר..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">כן</SelectItem>
                                  <SelectItem value="false">לא</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type={param.type === 'number' ? 'number' : 'text'}
                                placeholder={param.unit ? `(${param.unit})` : ''}
                              />
                            )}
                          </div>
                        ))}

                        <Separator />

                        {/* Costs */}
                        <div className="space-y-2">
                          <Label>עלות עבודה ל{unitLabels[selectedSubcategoryData.unit]} (₪)</Label>
                          <Input
                            type="number"
                            value={laborRate || ''}
                            onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                            min={0}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>עלות חומרים ל{unitLabels[selectedSubcategoryData.unit]} (₪)</Label>
                          <Input
                            type="number"
                            value={materialCost || ''}
                            onChange={(e) => setMaterialCost(parseFloat(e.target.value) || 0)}
                            min={0}
                          />
                        </div>

                        {/* Calculated Preview */}
                        {quantity > 0 && (
                          <Card className="bg-slate-50 dark:bg-slate-900">
                            <CardContent className="p-4 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>עבודה:</span>
                                <span>₪{(quantity * laborRate).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>חומרים (כולל פחת {(selectedSubcategoryData.wasteFactor * 100).toFixed(0)}%):</span>
                                <span>
                                  ₪{(quantity * materialCost * (1 + selectedSubcategoryData.wasteFactor)).toLocaleString()}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-semibold">
                                <span>סה"כ (כולל 10% רזרבה):</span>
                                <span className="text-cyan-600">
                                  ₪{(
                                    (quantity * laborRate +
                                      quantity * materialCost * (1 + selectedSubcategoryData.wasteFactor)) *
                                    1.1
                                  ).toLocaleString()}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        <Button
                          onClick={handleAddItem}
                          className="w-full bg-gradient-to-r from-cyan-500 to-teal-600"
                          disabled={quantity <= 0}
                        >
                          <Plus className="size-4 ml-2" />
                          הוסף לחישוב
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <ChevronLeft className="size-8 mb-2" />
                        <p>בחר סוג עבודה מהרשימה</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Calculator className="size-16 mb-4" />
                <h3 className="text-lg font-medium mb-2">בחר קטגוריית עבודה</h3>
                <p>בחר קטגוריה מהרשימה בצד ימין כדי להתחיל</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="items" className="flex-1 p-4 m-0">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">פריטים בחישוב</CardTitle>
                <CardDescription>
                  {workItems.length} פריטים
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[500px]">
                  <div className="p-4 space-y-2">
                    {workItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <Package className="size-12 mb-2" />
                        <p>אין פריטים עדיין</p>
                        <p className="text-sm">הוסף פריטים מלשונית "הוספת פריט"</p>
                      </div>
                    ) : (
                      workItems.map((item) => (
                        <Card key={item.id} className="bg-slate-50 dark:bg-slate-900">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{item.description}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {item.measurements?.quantity} {unitLabels[item.measurements?.unit as MeasurementUnit]}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-left">
                                  <div className="text-sm text-muted-foreground">
                                    עבודה: ₪{item.laborCost?.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    חומרים: ₪{item.materialCost?.toLocaleString()}
                                  </div>
                                  <div className="font-semibold text-cyan-600">
                                    סה"כ: ₪{item.totalCost?.toLocaleString()}
                                  </div>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => removeWorkItem(item.id!)}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="flex-1 p-4 m-0">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5" />
                    סיכום עלויות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between py-2 border-b">
                    <span>סה"כ עבודה:</span>
                    <span className="font-medium">₪{totalLabor.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span>סה"כ חומרים:</span>
                    <span className="font-medium">₪{totalMaterials.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 text-xl font-bold">
                    <span>סה"כ לפרויקט:</span>
                    <span className="text-cyan-600">₪{grandTotal.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>פעולות</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Save className="size-4 ml-2" />
                    שמור כפרויקט
                  </Button>
                  <Button className="w-full" variant="outline">
                    <FileText className="size-4 ml-2" />
                    צור הצעת מחיר
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-teal-600">
                    <FileText className="size-4 ml-2" />
                    ייצא ל-PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


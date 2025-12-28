'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoryMetadata } from '@/data/categories';
import { WorkCategory } from '@/types';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Package,
  DollarSign,
  TrendingUp,
  Building2,
} from 'lucide-react';

interface Material {
  id: string;
  name: string;
  category: WorkCategory;
  subcategory: string;
  unit: string;
  basePrice: number;
  lastUpdated: string;
  supplier?: string;
}

// Mock data
const mockMaterials: Material[] = [
  { id: '1', name: 'בטון B30', category: 'concrete', subcategory: 'בטון יסודות', unit: 'מ"ק', basePrice: 450, lastUpdated: '2024-12-01', supplier: 'רדימיקס' },
  { id: '2', name: 'ברזל זיון 12 מ"מ', category: 'concrete', subcategory: 'בטון יסודות', unit: 'טון', basePrice: 4200, lastUpdated: '2024-12-15', supplier: 'פלדות הברזל' },
  { id: '3', name: 'בלוק 20 ס"מ', category: 'construction', subcategory: 'בלוקים', unit: 'יח\'', basePrice: 8.5, lastUpdated: '2024-12-10', supplier: 'אייר בלוק' },
  { id: '4', name: 'מלט פורטלנד', category: 'construction', subcategory: 'בנייה', unit: 'שק', basePrice: 32, lastUpdated: '2024-12-20', supplier: 'נשר' },
  { id: '5', name: 'אריחי פורצלן 60x60', category: 'flooring', subcategory: 'ריצוף', unit: 'מ"ר', basePrice: 85, lastUpdated: '2024-12-18', supplier: 'קרמיקה ישראלית' },
  { id: '6', name: 'לוח גבס רגיל', category: 'drywall', subcategory: 'גבס', unit: 'לוח', basePrice: 42, lastUpdated: '2024-12-12', supplier: 'קנוף' },
  { id: '7', name: 'צבע פלסטי לבן', category: 'painting', subcategory: 'צבע', unit: 'ליטר', basePrice: 25, lastUpdated: '2024-12-05', supplier: 'טמבור' },
  { id: '8', name: 'צינור PPR 20 מ"מ', category: 'plumbing', subcategory: 'צנרת', unit: 'מ"א', basePrice: 12, lastUpdated: '2024-12-08', supplier: 'פלסאון' },
  { id: '9', name: 'כבל חשמל 2.5 מ"מ', category: 'electrical', subcategory: 'כבילה', unit: 'מ"א', basePrice: 4.5, lastUpdated: '2024-12-14', supplier: 'כבלי ציון' },
  { id: '10', name: 'יריעת איטום ביטומנית', category: 'waterproofing', subcategory: 'איטום', unit: 'מ"ר', basePrice: 35, lastUpdated: '2024-12-11', supplier: 'פזקר' },
];

interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  categories: string[];
  rating: number;
}

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'רדימיקס', contact: 'משה לוי', phone: '03-1234567', email: 'info@readymix.co.il', categories: ['בטון'], rating: 4.5 },
  { id: '2', name: 'פלדות הברזל', contact: 'יוסי כהן', phone: '04-9876543', email: 'sales@steel.co.il', categories: ['ברזל', 'פלדה'], rating: 4.8 },
  { id: '3', name: 'אייר בלוק', contact: 'דוד ישראלי', phone: '08-5555555', email: 'info@airblock.co.il', categories: ['בלוקים', 'בנייה'], rating: 4.2 },
  { id: '4', name: 'קרמיקה ישראלית', contact: 'רחל אברהם', phone: '09-1111111', email: 'info@ceramic.co.il', categories: ['ריצוף', 'חיפוי'], rating: 4.6 },
  { id: '5', name: 'טמבור', contact: 'שרה גולן', phone: '03-2222222', email: 'info@tambour.co.il', categories: ['צבע', 'גימורים'], rating: 4.9 },
];

export function MaterialsContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.entries(categoryMetadata) as [WorkCategory, { nameHe: string }][];

  const filteredMaterials = mockMaterials.filter((material) => {
    const matchesCategory = selectedCategory === 'all' || material.category === selectedCategory;
    const matchesSearch = material.name.includes(searchQuery) || material.subcategory.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">סה"כ חומרים</CardTitle>
            <Package className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMaterials.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">ספקים</CardTitle>
            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSuppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">עדכון אחרון</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">היום</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">שינויי מחירים</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+3.2%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="materials" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="materials">מחירון חומרים</TabsTrigger>
            <TabsTrigger value="suppliers">ספקים</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="size-4 ml-2" />
              ייבוא
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-4 ml-2" />
              ייצוא
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-teal-600">
              <Plus className="size-4 ml-2" />
              הוסף חומר
            </Button>
          </div>
        </div>

        <TabsContent value="materials" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש חומרים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.nameHe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Materials Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>שם החומר</TableHead>
                    <TableHead>קטגוריה</TableHead>
                    <TableHead>תת-קטגוריה</TableHead>
                    <TableHead>יחידה</TableHead>
                    <TableHead>מחיר</TableHead>
                    <TableHead>ספק</TableHead>
                    <TableHead>עדכון אחרון</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryMetadata[material.category]?.nameHe}
                        </Badge>
                      </TableCell>
                      <TableCell>{material.subcategory}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="font-semibold">
                        ₪{material.basePrice.toLocaleString()}
                      </TableCell>
                      <TableCell>{material.supplier || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(material.lastUpdated).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{supplier.name}</CardTitle>
                    <div className="flex items-center gap-1 text-amber-500">
                      <span className="text-sm font-semibold">{supplier.rating}</span>
                      <span className="text-xs">★</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1 text-sm">
                    <div className="text-muted-foreground">איש קשר: {supplier.contact}</div>
                    <div className="text-muted-foreground">טלפון: {supplier.phone}</div>
                    <div className="text-muted-foreground">{supplier.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {supplier.categories.map((cat) => (
                      <Badge key={cat} variant="secondary" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="size-3 ml-1" />
                      עריכה
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      צפה בחומרים
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}



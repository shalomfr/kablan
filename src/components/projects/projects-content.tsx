'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Clock,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  Copy,
  FileText,
  Calculator,
  Box,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  address?: string;
  status: string;
  totalCost: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'שיפוץ דירה - רמת גן',
    clientName: 'יוסי כהן',
    clientPhone: '050-1234567',
    clientEmail: 'yossi@email.com',
    address: 'רחוב הרצל 15, רמת גן',
    status: 'in_progress',
    totalCost: 85000,
    progress: 65,
    createdAt: '2024-11-15',
    updatedAt: '2024-12-22',
  },
  {
    id: '2',
    name: 'בנייה חדשה - הרצליה',
    clientName: 'מיכל לוי',
    clientPhone: '052-9876543',
    clientEmail: 'michal@email.com',
    address: 'רחוב הים 8, הרצליה',
    status: 'quoted',
    totalCost: 450000,
    progress: 0,
    createdAt: '2024-12-10',
    updatedAt: '2024-12-21',
  },
  {
    id: '3',
    name: 'תוספת בנייה - תל אביב',
    clientName: 'דוד ישראלי',
    clientPhone: '054-5555555',
    clientEmail: 'david@email.com',
    address: 'רחוב דיזנגוף 100, תל אביב',
    status: 'in_progress',
    totalCost: 180000,
    progress: 30,
    createdAt: '2024-12-01',
    updatedAt: '2024-12-20',
  },
  {
    id: '4',
    name: 'שיפוץ מטבח - רעננה',
    clientName: 'שרה אברהם',
    clientPhone: '053-1111111',
    clientEmail: 'sara@email.com',
    address: 'רחוב אחוזה 50, רעננה',
    status: 'approved',
    totalCost: 45000,
    progress: 0,
    createdAt: '2024-12-18',
    updatedAt: '2024-12-22',
  },
  {
    id: '5',
    name: 'בניית פרגולה - כפר סבא',
    clientName: 'אבי מזרחי',
    clientPhone: '058-2222222',
    address: 'רחוב ויצמן 25, כפר סבא',
    status: 'draft',
    totalCost: 25000,
    progress: 0,
    createdAt: '2024-12-20',
    updatedAt: '2024-12-22',
  },
  {
    id: '6',
    name: 'שיפוץ אמבטיות - נתניה',
    clientName: 'רונית שמעון',
    clientPhone: '050-3333333',
    clientEmail: 'ronit@email.com',
    address: 'רחוב הרב קוק 12, נתניה',
    status: 'completed',
    totalCost: 35000,
    progress: 100,
    createdAt: '2024-10-01',
    updatedAt: '2024-11-30',
  },
];

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'טיוטה', color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  quoted: { label: 'הוצעה הצעה', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  approved: { label: 'אושר', color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  in_progress: { label: 'בביצוע', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
  completed: { label: 'הושלם', color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30' },
  cancelled: { label: 'בוטל', color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
};

const kanbanColumns = [
  { id: 'draft', title: 'טיוטה' },
  { id: 'quoted', title: 'הוצעה הצעה' },
  { id: 'approved', title: 'אושר' },
  { id: 'in_progress', title: 'בביצוע' },
  { id: 'completed', title: 'הושלם' },
];

function ProjectCard({ project, viewMode }: { project: Project; viewMode: 'grid' | 'list' | 'kanban' }) {
  const status = statusConfig[project.status] || statusConfig.draft;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{project.name}</h3>
                  <Badge className={`${status.bgColor} ${status.color}`}>
                    {status.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{project.clientName}</span>
                  {project.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {project.address}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-left">
                <div className="font-semibold">₪{project.totalCost.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(project.updatedAt).toLocaleDateString('he-IL')}
                </div>
              </div>
              {project.progress > 0 && project.progress < 100 && (
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span>התקדמות</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-cyan-500 to-teal-600 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <ProjectActions project={project} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge className={`${status.bgColor} ${status.color}`}>
            {status.label}
          </Badge>
          <ProjectActions project={project} />
        </div>
        <CardTitle className="text-base mt-2">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-1 text-sm">
          <div className="font-medium">{project.clientName}</div>
          {project.clientPhone && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="size-3" />
              {project.clientPhone}
            </div>
          )}
          {project.address && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-3" />
              <span className="truncate">{project.address}</span>
            </div>
          )}
        </div>

        {project.progress > 0 && project.progress < 100 && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>התקדמות</span>
              <span>{project.progress}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-cyan-500 to-teal-600 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="pt-2 border-t flex items-center justify-between">
          <div className="font-semibold text-cyan-600">
            ₪{project.totalCost.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            {new Date(project.updatedAt).toLocaleDateString('he-IL')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectActions({ project }: { project: Project }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <Link href={`/projects/${project.id}`}>
            <Eye className="size-4 ml-2" />
            צפייה
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/projects/${project.id}/edit`}>
            <Edit className="size-4 ml-2" />
            עריכה
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/calculator?project=${project.id}`}>
            <Calculator className="size-4 ml-2" />
            מחשבון
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/builder-3d?project=${project.id}`}>
            <Box className="size-4 ml-2" />
            עורך 3D
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FileText className="size-4 ml-2" />
          צור הצעת מחיר
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="size-4 ml-2" />
          שכפל
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <Trash2 className="size-4 ml-2" />
          מחק
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectsContent() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = mockProjects.filter(
    (project) =>
      project.name.includes(searchQuery) ||
      project.clientName.includes(searchQuery) ||
      project.address?.includes(searchQuery)
  );

  const getProjectsByStatus = (status: string) =>
    filteredProjects.filter((p) => p.status === status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש פרויקטים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <TabsList>
              <TabsTrigger value="grid">
                <LayoutGrid className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="size-4" />
              </TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="bg-gradient-to-r from-cyan-500 to-teal-600" asChild>
            <Link href="/projects/new">
              <Plus className="size-4 ml-2" />
              פרויקט חדש
            </Link>
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'kanban' ? (
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
            {kanbanColumns.map((column) => {
              const projects = getProjectsByStatus(column.id);
              return (
                <div key={column.id} className="w-80 flex-shrink-0">
                  <Card className="bg-slate-50/50 dark:bg-slate-900/50">
                    <CardHeader className="p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {column.title}
                        </CardTitle>
                        <Badge variant="secondary">{projects.length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-2 space-y-2">
                      {projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          viewMode="kanban"
                        />
                      ))}
                      {projects.length === 0 && (
                        <div className="text-center text-muted-foreground py-8 text-sm">
                          אין פרויקטים
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode="list" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} viewMode="grid" />
          ))}
        </div>
      )}
    </div>
  );
}


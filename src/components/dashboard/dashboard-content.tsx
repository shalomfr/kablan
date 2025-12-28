'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calculator,
  Box,
  FolderKanban,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowLeft,
} from 'lucide-react';

const stats = [
  {
    title: 'פרויקטים פעילים',
    value: '12',
    change: '+2 החודש',
    icon: FolderKanban,
    color: 'from-cyan-500 to-teal-600',
  },
  {
    title: 'הצעות מחיר ממתינות',
    value: '5',
    change: '3 חדשות',
    icon: FileText,
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'הכנסות החודש',
    value: '₪125,400',
    change: '+15%',
    icon: TrendingUp,
    color: 'from-emerald-500 to-green-600',
  },
  {
    title: 'פרויקטים שהושלמו',
    value: '48',
    change: 'השנה',
    icon: CheckCircle,
    color: 'from-violet-500 to-purple-600',
  },
];

const quickActions = [
  {
    title: 'מחשבון חכם',
    description: 'חשב עלויות פרויקט חדש',
    icon: Calculator,
    href: '/calculator',
    color: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20',
  },
  {
    title: 'עורך תלת מימד',
    description: 'צור מודל של החלל',
    icon: Box,
    href: '/builder-3d',
    color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20',
  },
  {
    title: 'פרויקט חדש',
    description: 'התחל פרויקט מאפס',
    icon: Plus,
    href: '/projects/new',
    color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
  {
    title: 'הצעת מחיר',
    description: 'צור הצעת מחיר חדשה',
    icon: FileText,
    href: '/quotes/new',
    color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
  },
];

const recentProjects = [
  {
    id: '1',
    name: 'שיפוץ דירה - רמת גן',
    client: 'יוסי כהן',
    status: 'in_progress',
    value: 85000,
    progress: 65,
    updatedAt: 'לפני שעתיים',
  },
  {
    id: '2',
    name: 'בנייה חדשה - הרצליה',
    client: 'מיכל לוי',
    status: 'quoted',
    value: 450000,
    progress: 0,
    updatedAt: 'לפני יום',
  },
  {
    id: '3',
    name: 'תוספת בנייה - תל אביב',
    client: 'דוד ישראלי',
    status: 'in_progress',
    value: 180000,
    progress: 30,
    updatedAt: 'לפני 3 ימים',
  },
];

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  draft: { label: 'טיוטה', variant: 'secondary' },
  quoted: { label: 'הוצעה הצעה', variant: 'outline' },
  approved: { label: 'אושר', variant: 'default' },
  in_progress: { label: 'בביצוע', variant: 'default' },
  completed: { label: 'הושלם', variant: 'secondary' },
  cancelled: { label: 'בוטל', variant: 'destructive' },
};

export function DashboardContent() {
  return (
    <div className="p-6 space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="size-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">פעולות מהירות</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color} transition-colors`}>
                    <action.icon className="size-6" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardTitle className="text-base flex items-center gap-2">
                    {action.title}
                    <ArrowLeft className="size-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">פרויקטים אחרונים</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/projects">
              צפה בכל הפרויקטים
              <ArrowLeft className="size-4 mr-2" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4">
          {recentProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FolderKanban className="size-6 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="font-semibold">
                        ₪{project.value.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {project.updatedAt}
                      </div>
                    </div>
                    <Badge variant={statusLabels[project.status]?.variant || 'default'}>
                      {statusLabels[project.status]?.label || project.status}
                    </Badge>
                    {project.progress > 0 && (
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>התקדמות</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-l from-cyan-500 to-teal-600 rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertCircle className="size-5" />
            תזכורות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
            <span className="text-sm">הצעת מחיר לדירה ברמת גן מחכה לאישור לקוח</span>
            <Button size="sm" variant="outline">פרטים</Button>
          </div>
          <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg">
            <span className="text-sm">עדכון מחירון חומרים - חודש דצמבר</span>
            <Button size="sm" variant="outline">עדכן</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



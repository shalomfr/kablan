import { AppSidebar } from '@/components/shared/app-sidebar';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Builder3DInterface } from '@/components/3d-builder/builder-interface';

export default function Builder3DPage() {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-mr-1" />
          <Separator orientation="vertical" className="ml-2 h-4" />
          <h1 className="text-lg font-semibold">עורך תלת מימד</h1>
        </header>
        <Builder3DInterface />
      </SidebarInset>
    </>
  );
}



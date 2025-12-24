import { AnimatedBuildings } from '@/components/auth/animated-buildings';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen h-screen w-screen flex overflow-hidden" dir="ltr">
      {/* Left side - Animated buildings */}
      <div className="hidden lg:block flex-1 h-full relative">
        <AnimatedBuildings />
      </div>
      
      {/* Right side - Auth form */}
      <div className="w-full lg:w-[480px] h-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative shrink-0 shadow-2xl" dir="rtl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        <div className="relative w-full max-w-md mx-4 py-8 z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

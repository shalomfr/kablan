'use client';

export function AnimatedBuildings() {
  return (
    <div className="w-full h-full overflow-hidden relative">
      {/* Sky gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 via-cyan-500 to-cyan-600" />

      {/* Animated Clouds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud cloud-1">
          <div className="relative">
            <div className="w-24 h-14 bg-white rounded-full shadow-lg" />
            <div className="absolute -top-4 left-4 w-14 h-14 bg-white rounded-full" />
            <div className="absolute -top-2 left-12 w-10 h-10 bg-white rounded-full" />
          </div>
        </div>

        <div className="cloud cloud-2">
          <div className="relative">
            <div className="w-20 h-12 bg-white rounded-full shadow-lg opacity-90" />
            <div className="absolute -top-3 left-3 w-12 h-12 bg-white rounded-full" />
            <div className="absolute -top-1 left-9 w-8 h-8 bg-white rounded-full" />
          </div>
        </div>

        <div className="cloud cloud-3">
          <div className="relative">
            <div className="w-28 h-16 bg-white rounded-full shadow-lg opacity-95" />
            <div className="absolute -top-5 left-5 w-16 h-16 bg-white rounded-full" />
            <div className="absolute -top-3 left-14 w-12 h-12 bg-white rounded-full" />
          </div>
        </div>

        <div className="cloud cloud-4">
          <div className="relative">
            <div className="w-16 h-10 bg-white rounded-full shadow-lg opacity-85" />
            <div className="absolute -top-2 left-2 w-10 h-10 bg-white rounded-full" />
            <div className="absolute -top-1 left-7 w-7 h-7 bg-white rounded-full" />
          </div>
        </div>
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[12%] bg-gradient-to-t from-gray-200 to-gray-100" />

      {/* Buildings */}
      <div className="absolute bottom-[10%] left-0 right-0 flex items-end justify-center gap-3 px-8">
        {/* Building 1 */}
        <div className="building building-1">
          <div className="w-28 bg-white rounded-t-lg shadow-2xl relative" style={{ height: '400px' }}>
            <div className="pt-8 px-4 grid grid-cols-2 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-10 bg-cyan-500/70 rounded-sm shadow-inner" />
              ))}
            </div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex gap-1">
              <div className="w-1 h-40 bg-cyan-600/30 rounded-full" />
              <div className="w-1 h-40 bg-cyan-600/30 rounded-full" />
            </div>
          </div>
        </div>

        {/* Building 2 - Triangle top */}
        <div className="building building-2">
          <div className="w-24 bg-white shadow-2xl relative" style={{ height: '300px' }}>
            <div className="absolute -top-20 left-0 right-0 flex justify-center">
              <div className="w-0 h-0 border-l-[48px] border-r-[48px] border-b-[80px] border-l-transparent border-r-transparent border-b-white" 
                   style={{ filter: 'drop-shadow(0 -4px 6px rgba(0,0,0,0.1))' }} />
            </div>
            <div className="pt-6 px-3 grid grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-9 bg-cyan-500/70 rounded-sm shadow-inner" />
              ))}
            </div>
          </div>
        </div>

        {/* Building 3 - Wide */}
        <div className="building building-3">
          <div className="w-32 bg-white rounded-t-lg shadow-2xl relative" style={{ height: '240px' }}>
            <div className="pt-6 px-4 grid grid-cols-3 gap-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="h-7 bg-cyan-500/70 rounded-sm shadow-inner" />
              ))}
            </div>
            <div className="absolute bottom-16 left-4 right-4 space-y-2">
              <div className="h-1.5 bg-cyan-600/20 rounded-full" />
              <div className="h-1.5 bg-cyan-600/20 rounded-full" />
              <div className="h-1.5 bg-cyan-600/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Building 4 - Slanted */}
        <div className="building building-4">
          <div className="w-24 bg-white shadow-2xl relative" 
               style={{ height: '360px', clipPath: 'polygon(0 12%, 100% 0, 100% 100%, 0 100%)' }}>
            <div className="pt-20 px-3 grid grid-cols-2 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-9 bg-cyan-500/70 rounded-sm shadow-inner" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Car */}
      <div className="car-container">
        <div className="relative">
          <div className="w-24 h-10 bg-white rounded-lg shadow-lg" />
          <div className="absolute -top-5 left-5 w-14 h-6 bg-white rounded-t-lg" />
          <div className="absolute -top-4 left-6 w-5 h-4 bg-cyan-500/50 rounded-sm" />
          <div className="absolute -top-4 left-12 w-5 h-4 bg-cyan-500/50 rounded-sm" />
          <div className="absolute -bottom-2 left-3 w-6 h-6 bg-gray-300 rounded-full border-2 border-gray-400" />
          <div className="absolute -bottom-2 right-3 w-6 h-6 bg-gray-300 rounded-full border-2 border-gray-400" />
        </div>
      </div>

      {/* Birds */}
      <svg className="bird bird-1" width="28" height="14" viewBox="0 0 28 14">
        <path d="M0 7 Q7 0 14 7 Q21 0 28 7" stroke="#475569" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <svg className="bird bird-2" width="22" height="11" viewBox="0 0 28 14">
        <path d="M0 7 Q7 0 14 7 Q21 0 28 7" stroke="#64748b" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
      <svg className="bird bird-3" width="18" height="9" viewBox="0 0 28 14">
        <path d="M0 7 Q7 0 14 7 Q21 0 28 7" stroke="#94a3b8" fill="none" strokeWidth="2" strokeLinecap="round"/>
      </svg>

      {/* Sun glow */}
      <div className="absolute top-[8%] left-[12%] w-20 h-20 bg-yellow-200/30 rounded-full blur-2xl animate-pulse" />

      {/* Sparkles */}
      <div className="sparkle" style={{ top: '20%', left: '15%', animationDelay: '0s' }} />
      <div className="sparkle" style={{ top: '30%', left: '35%', animationDelay: '0.5s' }} />
      <div className="sparkle" style={{ top: '25%', left: '55%', animationDelay: '1s' }} />
      <div className="sparkle" style={{ top: '35%', left: '75%', animationDelay: '1.5s' }} />
      <div className="sparkle" style={{ top: '15%', left: '85%', animationDelay: '2s' }} />

      {/* Gradient to form */}
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      {/* Text Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
        <div className="bg-white/25 backdrop-blur-md rounded-3xl p-8 max-w-md text-center border border-white/40 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              ContractorPro
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-700 mb-6">
            הפלטפורמה המתקדמת לניהול פרויקטים וחישוב עלויות לקבלנים
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-md">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">מחשבון חכם</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-md">
              <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700" dir="rtl">עורך <span dir="ltr">3D</span></span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 px-4 py-2 rounded-full shadow-md">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-slate-700">ניהול פרויקטים</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cloud {
          position: absolute;
        }
        .cloud-1 {
          top: 8%;
          animation: drift-right 50s linear infinite;
        }
        .cloud-2 {
          top: 5%;
          animation: drift-left 60s linear infinite;
          animation-delay: 10s;
        }
        .cloud-3 {
          top: 14%;
          animation: drift-right 45s linear infinite;
          animation-delay: 20s;
        }
        .cloud-4 {
          top: 18%;
          animation: drift-left 55s linear infinite;
          animation-delay: 5s;
        }

        @keyframes drift-right {
          0% { left: -150px; }
          100% { left: calc(100% + 150px); }
        }
        @keyframes drift-left {
          0% { left: calc(100% + 150px); }
          100% { left: -150px; }
        }

        .building {
          transform-origin: bottom center;
        }
        .building-1 {
          animation: sway 7s ease-in-out infinite;
        }
        .building-2 {
          animation: sway 6s ease-in-out infinite reverse;
          animation-delay: 0.5s;
        }
        .building-3 {
          animation: sway 8s ease-in-out infinite;
          animation-delay: 1s;
        }
        .building-4 {
          animation: sway 6.5s ease-in-out infinite reverse;
          animation-delay: 1.5s;
        }

        @keyframes sway {
          0%, 100% { transform: rotate(-0.3deg); }
          50% { transform: rotate(0.3deg); }
        }

        .car-container {
          position: absolute;
          bottom: 8%;
          animation: drive 18s linear infinite;
        }

        @keyframes drive {
          0% { left: -120px; }
          100% { left: calc(100% + 120px); }
        }

        .bird {
          position: absolute;
        }
        .bird-1 {
          top: 20%;
          animation: fly-right 14s linear infinite, flap 0.3s ease-in-out infinite;
        }
        .bird-2 {
          top: 16%;
          animation: fly-left 18s linear infinite, flap 0.25s ease-in-out infinite;
          animation-delay: 5s;
        }
        .bird-3 {
          top: 24%;
          animation: fly-right 20s linear infinite, flap 0.35s ease-in-out infinite;
          animation-delay: 10s;
        }

        @keyframes fly-right {
          0% { left: -50px; transform: translateY(0); }
          25% { transform: translateY(-15px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-10px); }
          100% { left: calc(100% + 50px); transform: translateY(0); }
        }
        @keyframes fly-left {
          0% { left: calc(100% + 50px); transform: translateY(0) scaleX(-1); }
          25% { transform: translateY(-12px) scaleX(-1); }
          50% { transform: translateY(0) scaleX(-1); }
          75% { transform: translateY(-8px) scaleX(-1); }
          100% { left: -50px; transform: translateY(0) scaleX(-1); }
        }
        @keyframes flap {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.7); }
        }

        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: twinkle 2.5s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

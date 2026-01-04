'use client';

import { useRouter } from 'next/navigation';

export default function VendorLogin() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black relative flex flex-col px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 flex-1 flex flex-col justify-end pb-12 w-full max-w-md mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Vendor Portal</span>
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-3 leading-[1.1]">
            Run your <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">venue smarter.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xs font-medium leading-relaxed">
            Automated menu management and live orders for the best spots.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all active:scale-[0.98] flex justify-between items-center px-6"
            >
              <span>Access Dashboard</span>
              <span className="text-gray-400">→</span>
            </button>

            <button
              onClick={() => router.push('/onboarding')}
              className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]"
            >
              Register New Venue
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center gap-1">
              <span className="text-xl">🔔</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Live Orders</span>
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center gap-1">
              <span className="text-xl">✨</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Smart Menu</span>
            </div>
            <div className="bg-white/5 rounded-lg p-3 flex flex-col items-center gap-1">
              <span className="text-xl">🏁</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">Tables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




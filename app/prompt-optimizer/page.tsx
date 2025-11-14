'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';

export default function PromptOptimizerPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-forge-orange to-forge-red mb-4">
              Kommer Snart
            </h1>
            <p className="text-xl md:text-2xl text-white/60">
              Vi arbejder på noget fantastisk
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      <InteractiveBackground />

      <div className="relative z-10">
        <Header />

        <main className="flex items-center justify-center min-h-screen">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-forge-orange to-forge-red mb-4">
              Coming Soon
            </h1>
            <p className="text-xl md:text-2xl text-white/60">
              Vi er i gang med at bygge noget fantastisk
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

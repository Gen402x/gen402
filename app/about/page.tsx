'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-24 px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto">
          
          {/* Hero Section */}
          <div className={`max-w-4xl mb-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block px-4 py-2 bg-forge-orange/10 border border-forge-orange/30 rounded-full mb-8 hover:bg-forge-orange/20 hover:scale-105 transition-all duration-300">
              <span className="text-sm text-forge-orange font-bold uppercase tracking-wider">About Gen402</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              Professional AI<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-forge-orange to-forge-red animate-gradient-x">
                Generation Studio
              </span>
            </h1>
            <p className="text-2xl text-white/60 leading-relaxed font-light">
              Gen402 provides direct access to the world's most advanced AI models through blockchain-verified payments on Solana.
            </p>
          </div>

          {/* Mission Statement - Full Width Card */}
          <div className="group mb-32 p-12 bg-gradient-to-br from-forge-orange/5 to-forge-red/5 border border-forge-orange/20 rounded-3xl hover:border-forge-orange/40 hover:from-forge-orange/10 hover:to-forge-red/10 transition-all duration-500 cursor-pointer">
            <h2 className="text-4xl font-black mb-6 group-hover:text-forge-orange transition-colors duration-300">Our Mission</h2>
            <p className="text-xl text-white/70 leading-relaxed max-w-3xl group-hover:text-white/90 transition-colors duration-300">
              We believe access to cutting-edge AI should be straightforward and transparent. Gen402 eliminates barriers between creators and premium AI models through blockchain-verified payments. No subscriptions, no complexity—just direct access to professional-grade AI generation.
            </p>
          </div>

          {/* Why Different - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-12 mb-32">
            <div>
              <h2 className="text-4xl font-black mb-8">Why Gen402</h2>
              <div className="space-y-6">
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-orange/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-orange transition-colors duration-300">Protocol-First Architecture</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">Built natively on HTTP 402 Payment Required. Every request, every payment, every verification follows the standard.</p>
                </div>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-amber/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-amber transition-colors duration-300">Blockchain Security</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">All transactions verified on Solana mainnet. Complete transparency with immutable payment records.</p>
                </div>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-red/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-red transition-colors duration-300">True Pay-Per-Use</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">No monthly fees, no hidden costs. Pay exactly for what you generate, when you generate it.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black mb-8">What We Provide</h2>
              <div className="space-y-6">
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-orange/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-orange transition-colors duration-300">Premium Model Access</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">Direct API access to Sora 2, Veo 3.1, GPT-Image, Ideogram, and Qwen through a unified interface.</p>
                </div>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-amber/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-amber transition-colors duration-300">Instant Verification</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">Payments confirmed in seconds on Solana. Start generating immediately after blockchain confirmation.</p>
                </div>
                <div className="group p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-forge-red/30 transition-all duration-500 cursor-pointer hover:scale-105 hover:-translate-y-1">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-forge-red transition-colors duration-300">Full Transparency</h3>
                  <p className="text-white/60 group-hover:text-white/80 transition-colors duration-300">Every transaction is viewable on-chain. Track payments, fees, and buybacks in real-time.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technology Stack - Compact List */}
          <div className="mb-32">
            <h2 className="text-4xl font-black mb-12">Built With</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">Frontend</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-orange rounded-full" />
                    <span>Next.js 14 with App Router</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-orange rounded-full" />
                    <span>React 18 with TypeScript</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-orange rounded-full" />
                    <span>Tailwind CSS for styling</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">Blockchain</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-amber rounded-full" />
                    <span>Solana Mainnet for payments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-amber rounded-full" />
                    <span>Solana Web3.js SDK</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-amber rounded-full" />
                    <span>Wallet Adapter integration</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">Backend</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-red rounded-full" />
                    <span>Next.js API Routes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-red rounded-full" />
                    <span>Supabase database & storage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-red rounded-full" />
                    <span>Serverless architecture</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">AI Integration</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-yellow rounded-full" />
                    <span>OpenAI API for Sora & GPT-Image</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-yellow rounded-full" />
                    <span>Google AI for Veo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-forge-yellow rounded-full" />
                    <span>Ideogram & Alibaba APIs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="group p-12 bg-gradient-to-br from-forge-orange/10 to-forge-red/10 border border-forge-orange/20 rounded-3xl text-center hover:border-forge-orange/40 hover:from-forge-orange/15 hover:to-forge-red/15 transition-all duration-500">
            <h2 className="text-4xl font-black mb-4 group-hover:scale-105 transition-transform duration-300">Start Creating Today</h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto group-hover:text-white/80 transition-colors duration-300">
              Connect your wallet and gain instant access to premium AI models through Gen402.
            </p>
            <Link
              href="/dashboard"
              className="group/btn inline-block px-10 py-5 bg-gradient-to-r from-forge-orange to-forge-red text-white font-bold text-lg rounded-full hover:from-forge-orange hover:to-forge-red transition-all duration-300 hover:scale-105 shadow-xl shadow-forge-orange/30 hover:shadow-2xl hover:shadow-forge-orange/50 relative overflow-hidden"
            >
              <span className="relative z-10">Launch Studio</span>
              <div className="absolute inset-0 bg-gradient-to-r from-forge-red to-forge-orange opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}

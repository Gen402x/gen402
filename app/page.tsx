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

        <main className="pt-20">
          {/* Hero Section */}
          <section className="min-h-screen px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto flex items-center">
            <div className="w-full">
              <div className={`max-w-5xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                {/* Protocol Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-8">
                  <span className="text-xs text-white/60 font-mono uppercase tracking-wider">
                    HTTP 402 Payment Protocol
                  </span>
                </div>

                {/* Main Title */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[1.1] mb-8">
                  <span className="block text-white mb-2">Professional AI Generation</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-forge-orange to-forge-red">
                    Pay. Create. Own.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-white/60 max-w-3xl mb-12 leading-relaxed">
                  Access Sora 2, Veo 3.1, GPT-Image, Ideogram, and Qwen through HTTP 402 payment protocol. 
                  Pay with USDC on Solana. Verified on-chain.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <Link
                    href="/dashboard"
                    className="group px-8 py-4 bg-gradient-to-r from-forge-orange to-forge-red text-white font-bold text-base rounded-lg hover:shadow-xl hover:shadow-forge-orange/30 transition-all duration-300 hover:scale-105"
                  >
                    <span className="flex items-center gap-2">
                      Launch Studio
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/docs"
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-base rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  >
                    Documentation
                  </Link>
                </div>

                {/* Token CA */}
                <div className="mb-16 p-4 bg-white/5 border border-white/10 rounded-xl max-w-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white/50 uppercase tracking-wider font-bold mb-2">GEN402 Token CA</div>
                      <div className="font-mono text-sm text-white/80 break-all">
                        FbVjCKgm8us17ZhQCdXvwzXdeEaCPhvymvXwPJFKpump
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('FbVjCKgm8us17ZhQCdXvwzXdeEaCPhvymvXwPJFKpump');
                        const btn = document.getElementById('ca-copy-btn');
                        if (btn) {
                          btn.textContent = 'Copied!';
                          setTimeout(() => btn.textContent = 'Copy', 2000);
                        }
                      }}
                      id="ca-copy-btn"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-1">5</div>
                    <div className="text-sm text-white/50">AI Models</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-1">~1s</div>
                    <div className="text-sm text-white/50">Payment Confirm</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-1">$0.108</div>
                    <div className="text-sm text-white/50">Starting Price</div>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                    <div className="text-sm text-white/50">On-Chain</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Models Section */}
          <section id="models" className="py-32 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto border-t border-white/5">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Available Models</h2>
              <p className="text-lg text-white/50">Industry-leading AI models. Pay per generation with USDC.</p>
            </div>

            <div className="space-y-4">
              {/* Sora 2 */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-forge-red/30 hover:bg-gradient-to-r hover:from-forge-red/5 hover:to-transparent transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-forge-red/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-forge-red transition-colors duration-300">Sora 2</h3>
                      <span className="px-3 py-1 bg-forge-red/20 border border-forge-red/30 rounded-full text-xs font-bold text-forge-red group-hover:bg-forge-red/30 transition-all duration-300">VIDEO</span>
                    </div>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">OpenAI's breakthrough video generation model. Create cinematic sequences up to 15 seconds.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">$0.924</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Veo 3.1 */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-forge-red/30 hover:bg-gradient-to-r hover:from-forge-red/5 hover:to-transparent transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-forge-red/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-forge-red transition-colors duration-300">Veo 3.1</h3>
                      <span className="px-3 py-1 bg-forge-red/20 border border-forge-red/30 rounded-full text-xs font-bold text-forge-red group-hover:bg-forge-red/30 transition-all duration-300">VIDEO</span>
                    </div>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">Google's advanced video AI. Transform text and images into high-quality video content.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">$1.296</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* GPT-Image */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-forge-amber/30 hover:bg-gradient-to-r hover:from-forge-amber/5 hover:to-transparent transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-forge-amber/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-forge-amber transition-colors duration-300">GPT-Image</h3>
                      <span className="px-3 py-1 bg-forge-amber/20 border border-forge-amber/30 rounded-full text-xs font-bold text-forge-amber group-hover:bg-forge-amber/30 transition-all duration-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">OpenAI's latest image generation technology. Photorealistic results with precise control.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">$0.152</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Ideogram */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-forge-amber/30 hover:bg-gradient-to-r hover:from-forge-amber/5 hover:to-transparent transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-forge-amber/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-forge-amber transition-colors duration-300">Ideogram V3</h3>
                      <span className="px-3 py-1 bg-forge-amber/20 border border-forge-amber/30 rounded-full text-xs font-bold text-forge-amber group-hover:bg-forge-amber/30 transition-all duration-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">Perfect text rendering in images. Specialized in typography and graphic design.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">$0.292</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Qwen */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-forge-amber/30 hover:bg-gradient-to-r hover:from-forge-amber/5 hover:to-transparent transition-all duration-500 cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-forge-amber/10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-forge-amber transition-colors duration-300">Qwen</h3>
                      <span className="px-3 py-1 bg-forge-amber/20 border border-forge-amber/30 rounded-full text-xs font-bold text-forge-amber group-hover:bg-forge-amber/30 transition-all duration-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed group-hover:text-white/80 transition-colors duration-300">Alibaba Cloud's high-performance model. Fast generation with excellent quality-to-cost ratio.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1 group-hover:scale-110 transition-transform duration-300">$0.108</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* HTTP 402 Protocol Section */}
          <section className="py-32 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto border-t border-white/5">
            <div className="mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">HTTP 402 Protocol</h2>
              <p className="text-lg text-white/50">Native payment protocol integration for AI generation services.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="group p-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-forge-orange/20 border border-forge-orange/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-forge-orange/30 transition-all">
                  <svg className="w-6 h-6 text-forge-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Payment Required</h3>
                <p className="text-white/60 leading-relaxed">
                  Standard HTTP 402 status code implementation. Server responds with payment details before processing requests.
                </p>
              </div>

              <div className="group p-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-forge-amber/20 border border-forge-amber/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-forge-amber/30 transition-all">
                  <svg className="w-6 h-6 text-forge-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Blockchain Verified</h3>
                <p className="text-white/60 leading-relaxed">
                  All payments verified on Solana mainnet. Transaction signatures recorded on-chain for full transparency.
                </p>
              </div>

              <div className="group p-8 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-12 h-12 bg-forge-red/20 border border-forge-red/30 rounded-lg flex items-center justify-center mb-6 group-hover:bg-forge-red/30 transition-all">
                  <svg className="w-6 h-6 text-forge-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-3">Direct Payment</h3>
                <p className="text-white/60 leading-relaxed">
                  Pay per generation with USDC. No subscriptions. No monthly fees. Transparent pricing per model.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto">
            <div className="p-12 md:p-16 bg-white/5 border border-white/10 rounded-lg text-center hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start?</h2>
              <p className="text-base md:text-lg text-white/50 mb-8 max-w-2xl mx-auto">
                Connect your wallet and start generating with premium AI models
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-forge-orange to-forge-red text-white font-bold rounded-lg hover:shadow-lg hover:shadow-forge-orange/30 transition-all duration-300 hover:scale-105"
              >
                Launch Dashboard
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto border-t border-white/5">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <Image 
                    src="/logo.png" 
                    alt="Gen402 Logo" 
                    width={32} 
                    height={32} 
                  />
                  <span className="font-bold text-white text-lg">Gen402</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  Professional AI generation platform using HTTP 402 payment protocol.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h3>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/docs" className="text-white/60 hover:text-white transition-colors">Documentation</Link></li>
                  <li><Link href="/dashboard" className="text-white/60 hover:text-white transition-colors">Dashboard</Link></li>
                  <li><Link href="/about" className="text-white/60 hover:text-white transition-colors">About</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://docs.solana.com" className="text-white/60 hover:text-white transition-colors">Solana Docs</a></li>
                  <li><a href="https://httpwg.org/specs/rfc9110.html#status.402" className="text-white/60 hover:text-white transition-colors">HTTP 402 Spec</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Connect</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="https://github.com/Gen402x/gen402" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">GitHub</a></li>
                  <li><a href="https://x.com/gen402x" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">X</a></li>
                  <li><a href="https://gen402x.dev" className="text-white/60 hover:text-white transition-colors">Website</a></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/50 text-sm">
              <p>© 2025 Gen402. All rights reserved.</p>
              <div className="flex gap-6 text-xs">
                <span className="font-mono">HTTP 402 Protocol</span>
                <span>•</span>
                <span className="font-mono">Solana Blockchain</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

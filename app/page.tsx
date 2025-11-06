'use client';

import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <InteractiveBackground />

      <div className="relative z-10">
        <Header />

        <main className="pt-32">
          {/* Hero Section - Asymmetric Grid Layout */}
          <section className="min-h-[90vh] px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-center h-full">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider">
                    Live on Solana Mainnet
                  </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[0.9]">
                  Premium AI<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                    Through 402
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-2xl font-light">
                  Gateway to industry-leading AI models. Access Sora, Veo, GPT-Image, and more through HTTP 402 protocol with blockchain verification.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/dashboard"
                    className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-xl shadow-white/10"
                  >
                    Launch Platform
                  </Link>
                  <Link
                    href="/docs"
                    className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-full hover:bg-white/10 transition-all"
                  >
                    Documentation
                  </Link>
                </div>
              </div>

              {/* Right Stats Grid */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-4xl font-black text-white mb-2">5+</div>
                  <div className="text-sm text-white/50 uppercase tracking-wider font-semibold">AI Models</div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
                  <div className="text-4xl font-black text-white mb-2">402</div>
                  <div className="text-sm text-white/50 uppercase tracking-wider font-semibold">Protocol</div>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm col-span-2">
                  <div className="text-4xl font-black text-white mb-2">Instant</div>
                  <div className="text-sm text-white/50 uppercase tracking-wider font-semibold">Blockchain Verification</div>
                </div>
              </div>
            </div>
          </section>

          {/* Models Section - Horizontal Cards */}
          <section id="models" className="py-32 px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto border-t border-white/5">
            <div className="mb-16">
              <h2 className="text-5xl md:text-6xl font-black mb-4">Available Models</h2>
              <p className="text-xl text-white/50">Industry-leading AI accessible through one gateway</p>
            </div>

            <div className="space-y-4">
              {/* Sora 2 */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">Sora 2</h3>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">VIDEO</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">OpenAI's breakthrough video generation model. Create cinematic sequences up to 15 seconds.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1">$0.21</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Veo 3.1 */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">Veo 3.1</h3>
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-300">VIDEO</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">Google's advanced video AI. Transform text and images into high-quality video content.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1">$0.36</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* GPT-Image */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">GPT-Image</h3>
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">OpenAI's latest image generation technology. Photorealistic results with precise control.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1">$0.042</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Ideogram */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">Ideogram V3</h3>
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">Perfect text rendering in images. Specialized in typography and graphic design.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1">$0.066</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>

              {/* Qwen */}
              <div className="group p-8 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl hover:border-white/20 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-bold">Qwen</h3>
                      <span className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold text-green-300">IMAGE</span>
                    </div>
                    <p className="text-white/60 leading-relaxed">Alibaba Cloud's high-performance model. Fast generation with excellent quality-to-cost ratio.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-white mb-1">$0.030</div>
                    <div className="text-sm text-white/40">per generation</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features - 3 Column Grid */}
          <section className="py-32 px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto border-t border-white/5">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">HTTP 402 Native</h3>
                <p className="text-white/60 leading-relaxed">Built on HTTP 402 Payment Required standard. Native protocol-level payment integration.</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Blockchain Verified</h3>
                <p className="text-white/60 leading-relaxed">Every payment verified on Solana blockchain. Full transparency with on-chain proof.</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Pay Per Use</h3>
                <p className="text-white/60 leading-relaxed">No subscriptions or commitments. Pay only for the AI generations you actually create.</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-32 px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto">
            <div className="relative p-16 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 rounded-3xl overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to access premium AI?</h2>
                <p className="text-xl text-white/60 mb-8">Connect your wallet and start generating with the best AI models available.</p>
                <Link
                  href="/dashboard"
                  className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-2xl shadow-white/20"
                >
                  Open Dashboard
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" />
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 px-6 md:px-12 lg:px-16 max-w-[1800px] mx-auto border-t border-white/5">
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                    <Image 
                      src="/GATEAWAY402X.png" 
                      alt="Gateway402x Logo" 
                      width={40} 
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-bold text-white text-xl">Gateway402x</span>
                </div>
                <p className="text-white/50 leading-relaxed max-w-md">
                  Premium AI model access through HTTP 402 protocol. Powered by Solana blockchain for secure, instant payments.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Platform</h4>
                <ul className="space-y-2 text-white/60">
                  <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Resources</h4>
                <ul className="space-y-2 text-white/60">
                  <li><span>HTTP 402 Protocol</span></li>
                  <li><span>Solana Network</span></li>
                  <li><span>API Access</span></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Connect</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <a href="https://x.com/gateaway402" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                      X (Twitter)
                    </a>
                  </li>
                  <li>
                    <a href="https://github.com/Gateaway402/gateaway402x" target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a href="https://gateaway402.fun" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">
                      Website
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
              <p>2025 Gateway402x. All rights reserved.</p>
              <p>Built with Next.js and Solana</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

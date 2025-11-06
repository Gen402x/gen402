'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-24 px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto">
          
          {/* Hero Section */}
          <div className="max-w-4xl mb-32">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
              <span className="text-sm text-blue-400 font-bold uppercase tracking-wider">About Gateway402x</span>
            </div>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
              The Gateway<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                To Premium AI
              </span>
            </h1>
            <p className="text-2xl text-white/60 leading-relaxed font-light">
              Gateway402x provides direct access to the world's most advanced AI models through the HTTP 402 protocol, secured by blockchain technology.
            </p>
          </div>

          {/* Mission Statement - Full Width Card */}
          <div className="mb-32 p-12 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-white/10 rounded-3xl">
            <h2 className="text-4xl font-black mb-6">Our Mission</h2>
            <p className="text-xl text-white/70 leading-relaxed max-w-3xl">
              We believe access to cutting-edge AI should be straightforward and transparent. Gateway402x eliminates barriers between creators and premium AI models by implementing the HTTP 402 protocol with blockchain verification. No subscriptions, no complexity—just direct access to the tools you need.
            </p>
          </div>

          {/* Why Different - Side by Side */}
          <div className="grid lg:grid-cols-2 gap-12 mb-32">
            <div>
              <h2 className="text-4xl font-black mb-8">Why Gateway402x</h2>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Protocol-First Architecture</h3>
                  <p className="text-white/60">Built natively on HTTP 402 Payment Required. Every request, every payment, every verification follows the standard.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Blockchain Security</h3>
                  <p className="text-white/60">All transactions verified on Solana mainnet. Complete transparency with immutable payment records.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">True Pay-Per-Use</h3>
                  <p className="text-white/60">No monthly fees, no hidden costs. Pay exactly for what you generate, when you generate it.</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-black mb-8">What We Provide</h2>
              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Premium Model Access</h3>
                  <p className="text-white/60">Direct API access to Sora 2, Veo 3.1, GPT-Image, Ideogram, and Qwen through a unified interface.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Instant Verification</h3>
                  <p className="text-white/60">Payments confirmed in seconds on Solana. Start generating immediately after blockchain confirmation.</p>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">Full Transparency</h3>
                  <p className="text-white/60">Every transaction is viewable on-chain. Track payments, fees, and buybacks in real-time.</p>
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
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Next.js 14 with App Router</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>React 18 with TypeScript</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    <span>Tailwind CSS for styling</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">Blockchain</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    <span>Solana Mainnet for payments</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    <span>Solana Web3.js SDK</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                    <span>Wallet Adapter integration</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">Backend</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Next.js API Routes</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Supabase database & storage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span>Serverless architecture</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white/80">AI Integration</h3>
                <ul className="space-y-2 text-white/60">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                    <span>OpenAI API for Sora & GPT-Image</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                    <span>Google AI for Veo</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
                    <span>Ideogram & Alibaba APIs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="p-12 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl text-center">
            <h2 className="text-4xl font-black mb-4">Start Creating Today</h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Connect your wallet and gain instant access to premium AI models through Gateway402x.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-white/90 transition-all hover:scale-105"
            >
              Open Dashboard
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}

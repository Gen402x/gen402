'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -80% 0px' }
    );

    // Observe all sections
    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const navItems = [
    { id: 'quickstart', label: 'Quick Start' },
    { id: 'models', label: 'AI Models' },
    { id: 'payments', label: 'Payment System' },
    { id: 'protocol', label: 'HTTP 402 Protocol' },
    { id: 'wallet', label: 'Wallet Setup' },
    { id: 'api', label: 'API Reference' },
  ];

  return (
    <div className="min-h-screen bg-dark text-white">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-24 px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto">
          
          {/* Header */}
          <div className="mb-20">
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">Documentation</h1>
            <p className="text-2xl text-white/60 font-light max-w-3xl">
              Complete guide to Gateway402x platform, HTTP 402 protocol implementation, and AI model access.
            </p>
          </div>

          {/* Grid Layout - 2 columns */}
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 space-y-2">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    className={`block px-4 py-3 rounded-lg font-semibold transition ${
                      activeSection === item.id
                        ? 'text-white bg-white/10 border border-white/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* Quick Start */}
              <section id="quickstart">
                <h2 className="text-4xl font-black mb-6">Quick Start</h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    Gateway402x provides direct access to premium AI models through HTTP 402 protocol. Get started in minutes with blockchain-verified payments.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-3xl font-black text-white mb-3">01</div>
                      <h3 className="text-xl font-bold text-white mb-2">Connect Wallet</h3>
                      <p>Install a Solana wallet and connect it to Gateway402x platform.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-3xl font-black text-white mb-3">02</div>
                      <h3 className="text-xl font-bold text-white mb-2">Select Model</h3>
                      <p>Choose from Sora, Veo, GPT-Image, Ideogram, or Qwen based on your needs.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-3xl font-black text-white mb-3">03</div>
                      <h3 className="text-xl font-bold text-white mb-2">Submit Prompt</h3>
                      <p>Describe what you want to create with detailed specifications.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <div className="text-3xl font-black text-white mb-3">04</div>
                      <h3 className="text-xl font-bold text-white mb-2">Complete Payment</h3>
                      <p>Approve blockchain transaction and start generation immediately.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Models */}
              <section id="models">
                <h2 className="text-4xl font-black mb-6">AI Models</h2>
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Sora 2</h3>
                        <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold">VIDEO</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">$0.21</div>
                        <div className="text-sm text-white/40">per video</div>
                      </div>
                    </div>
                    <p className="text-white/60 mb-4">OpenAI's video generation model. Creates up to 15 seconds of high-quality video from text descriptions.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Text-to-Video</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">5-15 seconds</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Multiple aspect ratios</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Veo 3.1</h3>
                        <span className="inline-block px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold">VIDEO</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">$0.36</div>
                        <div className="text-sm text-white/40">per video</div>
                      </div>
                    </div>
                    <p className="text-white/60 mb-4">Google's video AI. Supports both text-to-video and image-to-video generation.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Text & Image input</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">High quality</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Cinematic output</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">GPT-Image</h3>
                        <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold">IMAGE</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">$0.042</div>
                        <div className="text-sm text-white/40">per image</div>
                      </div>
                    </div>
                    <p className="text-white/60 mb-4">OpenAI's image generation technology. Photorealistic results with precise prompt control.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Photorealistic</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Multiple variants</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Reference images</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Ideogram V3</h3>
                        <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold">IMAGE</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">$0.066</div>
                        <div className="text-sm text-white/40">per image</div>
                      </div>
                    </div>
                    <p className="text-white/60 mb-4">Specialized in text rendering within images. Perfect for graphics and design work.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Perfect text</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Multiple styles</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Design-focused</span>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">Qwen</h3>
                        <span className="inline-block px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs font-bold">IMAGE</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black">$0.030</div>
                        <div className="text-sm text-white/40">per image</div>
                      </div>
                    </div>
                    <p className="text-white/60 mb-4">Alibaba Cloud's model. Best quality-to-cost ratio with fast generation times.</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Cost effective</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">Fast generation</span>
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs">High quality</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment System */}
              <section id="payments">
                <h2 className="text-4xl font-black mb-6">Payment System</h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    Gateway402x uses Solana blockchain for secure, instant payments. All transactions are verified on-chain.
                  </p>
                  
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Payment Options</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span><strong className="text-white">$GATEWAY Token:</strong> Coming soon - Pay at standard 1x price</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <span><strong className="text-white">USDC:</strong> Available now - Pay at 4x premium</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Transaction Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-white/40 mb-1">Network</div>
                        <div className="font-semibold">Solana Mainnet</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/40 mb-1">Confirmation Time</div>
                        <div className="font-semibold">1-3 seconds</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/40 mb-1">Transaction Fee</div>
                        <div className="font-semibold">~0.000005 SOL</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/40 mb-1">Platform Fee</div>
                        <div className="font-semibold">10% (for buybacks)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* HTTP 402 */}
              <section id="protocol">
                <h2 className="text-4xl font-black mb-6">HTTP 402 Protocol</h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    Gateway402x implements the HTTP 402 Payment Required status code for native payment handling.
                  </p>
                  
                  <div className="p-6 bg-black/40 border border-white/10 rounded-xl font-mono text-sm overflow-x-auto">
                    <div className="text-green-400 mb-2">// Request without payment</div>
                    <div className="text-white/80">POST /api/generate</div>
                    <div className="text-blue-400 mt-4 mb-2">// Server response</div>
                    <div className="text-white/80">HTTP/1.1 402 Payment Required</div>
                    <div className="text-white/60 mt-2">{'{'}</div>
                    <div className="text-white/60 ml-4">"amount": 0.21,</div>
                    <div className="text-white/60 ml-4">"currency": "USD",</div>
                    <div className="text-white/60 ml-4">"generationId": "gen_xyz123"</div>
                    <div className="text-white/60">{'}'}</div>
                  </div>

                  <p>After receiving the 402 response, the client initiates payment through the wallet. Once confirmed on-chain, the generation request is processed.</p>
                </div>
              </section>

              {/* Wallet Setup */}
              <section id="wallet">
                <h2 className="text-4xl font-black mb-6">Wallet Setup</h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    A Solana wallet is required to use Gateway402x. We support all major Solana wallets.
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-2">Phantom</h3>
                      <p>Most popular Solana wallet. Recommended for beginners.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-2">Solflare</h3>
                      <p>Feature-rich wallet with advanced options and staking.</p>
                    </div>
                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                      <h3 className="text-xl font-bold text-white mb-2">Coinbase</h3>
                      <p>Official wallet from Coinbase exchange platform.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-4">Setup Steps</h3>
                    <ol className="space-y-3">
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-400">1.</span>
                        <span>Install your preferred wallet extension or mobile app</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-400">2.</span>
                        <span>Purchase SOL and USDC from an exchange</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-400">3.</span>
                        <span>Transfer tokens to your Solana wallet address</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-400">4.</span>
                        <span>Connect wallet to Gateway402x and start creating</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* API Reference */}
              <section id="api">
                <h2 className="text-4xl font-black mb-6">API Reference</h2>
                <div className="space-y-6 text-white/70 leading-relaxed">
                  <p className="text-lg">
                    Gateway402x provides a REST API for programmatic access to all AI models.
                  </p>
                  
                  <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                    <div className="font-bold text-white mb-4">Generate Content</div>
                    <div className="font-mono text-sm space-y-2">
                      <div><span className="text-green-400">POST</span> <span className="text-white/80">/api/generate</span></div>
                      <div className="text-white/60 mt-4">Request Body:</div>
                      <div className="text-white/60">{'{'}</div>
                      <div className="text-white/60 ml-4">"model": "sora-2",</div>
                      <div className="text-white/60 ml-4">"prompt": "Your description",</div>
                      <div className="text-white/60 ml-4">"type": "video"</div>
                      <div className="text-white/60">{'}'}</div>
                    </div>
                  </div>

                  <div className="p-6 bg-black/40 border border-white/10 rounded-xl">
                    <div className="font-bold text-white mb-4">Check Status</div>
                    <div className="font-mono text-sm space-y-2">
                      <div><span className="text-blue-400">GET</span> <span className="text-white/80">/api/generate/:id</span></div>
                      <div className="text-white/60 mt-4">Response:</div>
                      <div className="text-white/60">{'{'}</div>
                      <div className="text-white/60 ml-4">"status": "completed",</div>
                      <div className="text-white/60 ml-4">"result": "https://..."</div>
                      <div className="text-white/60">{'}'}</div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

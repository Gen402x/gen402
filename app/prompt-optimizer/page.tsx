'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import PromptOptimizerChat from '@/components/PromptOptimizerChat';

export default function PromptOptimizerPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 pt-20">
          <div className="px-6 md:px-12 lg:px-16 max-w-[1600px] mx-auto pt-12 pb-8">
            
            {/* Hero Section */}
            <div className="max-w-5xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg mb-8">
                <span className="text-xs text-white/60 font-mono uppercase tracking-wider">
                  AI Prompt Engineering
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-8">
                <span className="block text-white mb-2">Prompt Optimizer</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-forge-orange to-forge-red">
                  Free AI Assistant
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
                Get professional help optimizing prompts for Sora, Veo, Suno, and other AI models.
                Powered by GPT-4 Turbo. Free forever.
              </p>
            </div>

            {/* Chat Component */}
            <div className="max-w-7xl mx-auto mb-16">
              <PromptOptimizerChat />
            </div>

            {/* How It Works */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <h2 className="text-3xl font-bold text-white mb-8">How It Works</h2>
                
                <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-forge-orange/20 border border-forge-orange/30 rounded-lg flex items-center justify-center text-forge-orange font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">Choose Model Type</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Select Image, Video, or Music based on your generation needs
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-forge-orange/20 border border-forge-orange/30 rounded-lg flex items-center justify-center text-forge-orange font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">Describe Your Vision</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Provide a basic description of what you want to create
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-forge-orange/20 border border-forge-orange/30 rounded-lg flex items-center justify-center text-forge-orange font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">AI Optimization</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        GPT-4 analyzes and enhances your prompt with professional details
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-forge-orange/20 border border-forge-orange/30 rounded-lg flex items-center justify-center text-forge-orange font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1 text-sm">Generate Content</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Use optimized prompts with Sora, Veo, Suno, or other models
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supported Models */}
            <div className="max-w-5xl mx-auto">
              <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300">
                <h2 className="text-2xl font-bold text-white mb-6">Supported Models</h2>
                
                <div className="space-y-6">
                  {/* Images */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-forge-amber/20 border border-forge-amber/30 rounded-full text-xs font-bold text-forge-amber">
                        IMAGE
                      </span>
                      <span className="text-sm text-white/40">Optimize prompts for image generation</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        4o Image
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Ideogram V3
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Qwen
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/40">
                        + More
                      </span>
                    </div>
                  </div>

                  {/* Videos */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-forge-red/20 border border-forge-red/30 rounded-full text-xs font-bold text-forge-red">
                        VIDEO
                      </span>
                      <span className="text-sm text-white/40">Optimize prompts for video generation</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Sora 2
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Veo 3.1
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Grok Imagine
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/40">
                        + More
                      </span>
                    </div>
                  </div>

                  {/* Music */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-400">
                        MUSIC
                      </span>
                      <span className="text-sm text-white/40">Optimize prompts for music generation</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Suno V3.5
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Suno V4.5
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/80">
                        Suno V5
                      </span>
                      <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white/40">
                        + More
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const { connected } = useWallet();
  
  return (
    <header className="fixed top-0 w-full z-50 bg-dark/90 backdrop-blur-2xl border-b border-white/10">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image 
                src="/logo.png" 
                alt="Gen402 Logo" 
                width={40} 
                height={40} 
                className="group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight">Gen402</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest font-medium">Professional AI Studio</span>
            </div>
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link 
              href="/dashboard" 
              className="px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/#models" 
              className="px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              Models
            </Link>
            <Link 
              href="/about" 
              className="px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              About
            </Link>
            <Link 
              href="/docs" 
              className="px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium"
            >
              Docs
            </Link>
            <a 
              href="https://github.com/Gen402x/gen402" 
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
          </nav>

          {/* Wallet - Right */}
          <div className="flex items-center gap-4">
            {connected && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-forge-orange/10 border border-forge-orange/30 rounded-full">
                <div className="w-2 h-2 bg-forge-orange rounded-full animate-pulse shadow-lg shadow-forge-orange/50" />
                <span className="text-xs text-forge-orange font-medium">Connected</span>
              </div>
            )}
            <WalletMultiButton className="!text-sm !py-2.5 !px-6 !rounded-full !font-semibold !bg-gradient-to-r !from-forge-orange !to-forge-red !text-white hover:!from-forge-orange/90 hover:!to-forge-red/90 !transition-all !shadow-lg !shadow-forge-orange/20" />
          </div>
        </div>
      </div>
    </header>
  );
}

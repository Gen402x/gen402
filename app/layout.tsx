import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { SolanaWalletProvider } from '@/components/WalletProvider';

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Gateway402x - Premium AI Models via HTTP 402',
  description: 'Access premium AI models through HTTP 402 protocol. Gateway to Sora, Veo, GPT-Image, and more with blockchain payments.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans">
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}

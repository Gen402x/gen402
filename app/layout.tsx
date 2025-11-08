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
  title: 'Gen402 - Professional AI Generation Platform',
  description: 'Create stunning images and videos with leading AI models. Professional-grade AI generation powered by blockchain technology.',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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

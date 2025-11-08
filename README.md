# Gen402 - Professional AI Generation Platform

Create stunning images and videos with industry-leading AI models powered by blockchain technology.

![Gen402](https://img.shields.io/badge/Gen-402-orange)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)
![Next.js](https://img.shields.io/badge/Framework-Next.js-black)

## Overview

Gen402 provides direct access to premium AI models including Sora 2, Veo 3.1, GPT-Image, Ideogram, and Qwen through blockchain-verified payments on Solana mainnet.

### Core Features

- **Professional AI Studio** - Direct access to 5+ leading AI generation models
- **Blockchain Verified** - All payments confirmed on Solana mainnet
- **Pay-Per-Use Model** - No subscriptions, pay only for generated content
- **Instant Processing** - Start generation immediately after payment confirmation
- **Transparent Pricing** - Clear pricing with on-chain payment verification

## AI Models

| Model | Type | Price | Provider |
|-------|------|-------|----------|
| Qwen | Image | $0.108 | Alibaba Cloud |
| 4o Image | Image | $0.152 | OpenAI |
| Ideogram V3 | Image | $0.292 | Ideogram |
| Sora 2 | Video | $0.924 | OpenAI |
| Veo 3.1 | Video | $1.296 | Google |

## Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet (Phantom, Solflare, or Coinbase)
- USDC or platform tokens on Solana mainnet

### Installation

```bash
git clone https://github.com/Gen402x/gen402.git
cd gen402
npm install
npm run dev
```

### Environment Setup

Copy `env.example` to `.env.local` and fill in your values:

```bash
cp env.example .env.local
```

Required environment variables:

```env
# Solana Blockchain
NEXT_PUBLIC_SOLANA_RPC_URL=your_helius_rpc_url
NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS=your_payment_wallet

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Model API Keys (via Kie.ai)
IMAGE_4O_API_KEY=your_kie_ai_key
VEO_AI_API_KEY=your_kie_ai_key
IDEOGRAM_API_KEY=your_kie_ai_key
QWEN_API_KEY=your_kie_ai_key
SORA_API_KEY=your_kie_ai_key
```

See `env.example` for complete configuration options and pricing setup.

## Architecture

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS with custom design system
- Solana Wallet Adapter

### Blockchain
- Solana Web3.js for blockchain interaction
- SPL Token for payment handling
- Helius RPC for reliable network access
- On-chain payment verification

### Backend
- Next.js API Routes (serverless)
- Supabase for database and storage
- HTTP 402 protocol implementation
- AI provider integrations

## Payment Flow

1. User selects AI model and enters prompt
2. Platform calculates generation cost
3. User approves transaction in Solana wallet
4. Payment verified on Solana blockchain
5. Generation starts automatically
6. Results delivered via chat interface

## Project Structure

```
gen402/
├── app/
│   ├── api/              # API routes & payment handlers
│   ├── dashboard/        # Main generation interface
│   ├── about/           # Platform information
│   ├── docs/            # Documentation
│   └── layout.tsx       # Root layout
├── components/
│   ├── ChatDashboard.tsx    # Chat interface
│   ├── Header.tsx           # Navigation
│   ├── PaymentModal.tsx     # Payment handling
│   └── InteractiveBackground.tsx
├── lib/
│   ├── models.ts            # AI model configurations
│   ├── solana-payment.ts    # Blockchain payment logic
│   ├── usdc-payment.ts      # USDC payment handling
│   └── [model]-ai.ts        # AI provider integrations
└── types/
    └── index.ts             # TypeScript definitions
```

## Features

### Chat Interface
- Persistent conversation history
- Model selection per chat
- Real-time progress tracking
- Transaction history with Solscan links

### Payment System
- Dual payment options (Token/USDC)
- On-chain verification
- Full transaction transparency
- Automated payment processing

### Generation Options
- Multiple aspect ratios
- Variable video length (5-15s)
- Image variants (up to 4x)
- Style presets per model
- Advanced parameter control

## Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production
npm start

# Type checking
npm run lint
```

## Security

- Wallet-based authentication
- On-chain payment verification only
- No private key storage
- Serverless API architecture
- Environment variable protection
- HTTPS-only in production

## Performance

- **Payment Confirmation:** 1-3 seconds (Solana)
- **Generation Time:** 25-240 seconds (model-dependent)
- **RPC Response:** <100ms (Helius)
- **Initial Load:** <1s (Next.js optimized)

## Technology Stack

**Core:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

**Blockchain:**
- Solana Web3.js
- SPL Token Standard
- Wallet Adapter
- Helius RPC

**AI:**
- OpenAI API
- Google AI
- Ideogram API
- Alibaba Cloud

## Contributing

Contributions welcome. Please submit Pull Requests with:
- Clear description of changes
- Updated tests if applicable
- Documentation updates

## License

MIT License - see LICENSE file

## Links

- **Website:** https://gen402x.dev
- **GitHub:** https://github.com/Gen402x/gen402
- **X/Twitter:** https://x.com/gen402x
- **Dashboard:** https://gen402x.dev/dashboard

## Support

- Network Status: 99.9% uptime on Solana mainnet
- Payment verification: 1-3 seconds
- All transactions visible on Solscan

---

Built with Next.js, Solana, and AI  
Gen402 © 2025

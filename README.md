# Gateway402x - Premium AI Models via HTTP 402

Access industry-leading AI models through HTTP 402 Payment Required protocol with Solana blockchain verification.

![Gateway402x](https://img.shields.io/badge/Gateway-402x-blue)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)
![Protocol](https://img.shields.io/badge/Protocol-HTTP%20402-black)

**Website:** [gateaway402.fun](https://gateaway402.fun)  
**Twitter/X:** [@gateaway402](https://x.com/gateaway402)

## Overview

Gateway402x provides direct access to premium AI models including Sora 2, Veo 3.1, GPT-Image, Ideogram, and Qwen through HTTP 402 protocol implementation with blockchain-verified payments on Solana.

### Core Features

- **HTTP 402 Protocol** - Native implementation of Payment Required standard
- **Premium AI Access** - Direct API access to 5+ leading AI models
- **Blockchain Verified** - All payments confirmed on Solana mainnet
- **Pay-Per-Use Model** - No subscriptions, pay only for generated content
- **Instant Processing** - Start generation immediately after payment confirmation
- **Payment Options** - $GATEWAY token (coming soon, 1x price) or USDC (available now, 4x price)

## AI Models

| Model | Type | Base Price | Provider |
|-------|------|-----------|----------|
| Qwen | Image | $0.027 | Alibaba Cloud |
| 4o Image | Image | $0.038 | OpenAI |
| Ideogram V3 | Image | $0.073 | Ideogram |
| Sora 2 | Video | $0.231 | OpenAI |
| Veo 3.1 | Video | $0.324 | Google |

## Quick Start

### Prerequisites
- Node.js 18+
- Solana wallet (Phantom, Solflare, or Coinbase)
- USDC or platform tokens on Solana mainnet

### Installation

```bash
git clone https://github.com/Gateaway402/gateaway402x.git
cd gateway402x
npm install
npm run dev
```

### Environment Setup

```env
# Solana Configuration
NEXT_PUBLIC_SOLANA_RPC_URL=your_helius_rpc_url
NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS=your_payment_wallet

# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# AI Provider APIs
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_KEY=your_google_key
IDEOGRAM_API_KEY=your_ideogram_key
ALIBABA_API_KEY=your_alibaba_key
```

## Architecture

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS with Poppins font
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

## HTTP 402 Implementation

Gateway402x implements the HTTP 402 Payment Required status code:

```typescript
// Request without payment
POST /api/generate
{
  "model": "sora-2",
  "prompt": "Your description",
  "type": "video"
}

// Server response
HTTP/1.1 402 Payment Required
{
  "amount": 0.21,
  "currency": "USD",
  "generationId": "gen_xyz123",
  "paymentRequired": true
}
```

After receiving 402, the client initiates blockchain payment. Once verified on-chain, generation begins immediately.

## Payment Flow

1. User selects AI model and enters prompt
2. Platform returns 402 Payment Required
3. User approves transaction in Solana wallet
4. Payment verified on Solana blockchain
5. Generation starts automatically
6. Results delivered via chat interface

## Project Structure

```
gateway402x/
├── app/
│   ├── api/              # API routes & HTTP 402 handlers
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
- Automated 10% buyback queue
- Full transaction transparency

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

- **Website:** [gateaway402.fun](https://gateaway402.fun)
- **Documentation:** [gateaway402.fun/docs](https://gateaway402.fun/docs)
- **Dashboard:** [gateaway402.fun/dashboard](https://gateaway402.fun/dashboard)
- **Twitter/X:** [@gateaway402](https://x.com/gateaway402)

## Support

- Network Status: 99.9% uptime on Solana mainnet
- Payment verification: 1-3 seconds
- All transactions visible on Solscan

---

Built with Next.js, Solana, and AI  
Gateway402x © 2025

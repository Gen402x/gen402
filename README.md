# Gen402 - HTTP 402 Payment Protocol for AI Generation

Professional AI generation platform implementing the HTTP 402 Payment Required protocol with blockchain verification.

![Gen402](https://img.shields.io/badge/Gen-402-orange)
![HTTP 402](https://img.shields.io/badge/Protocol-HTTP%20402-blue)
![Solana](https://img.shields.io/badge/Blockchain-Solana-purple)

## What is HTTP 402?

HTTP 402 Payment Required is a reserved HTTP status code intended for digital payment systems. Gen402 implements this protocol to provide seamless pay-per-use access to premium AI models.

### How We Use HTTP 402

Gen402 uses HTTP 402 as a protocol layer between users and AI generation services:

1. **Request** → User requests AI generation (image/video)
2. **402 Response** → Server responds with payment requirement and details
3. **Payment** → User completes blockchain payment via Solana wallet
4. **Verification** → Server verifies on-chain transaction
5. **Fulfillment** → Generation proceeds automatically after payment confirmation

This creates a trustless, transparent payment flow where:
- No subscriptions or upfront costs required
- Pay only for what you generate
- All payments verified on Solana blockchain
- Instant processing after payment confirmation

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

Gen402 implements HTTP 402 across three layers:

### 1. Protocol Layer (HTTP 402)
```
Client Request → 402 Response → Payment → Verification → Fulfillment
```
- Returns 402 status with payment details
- Includes amount, currency (USDC), and recipient wallet
- Client handles payment via blockchain
- Server verifies on-chain before proceeding

### 2. Payment Layer (Solana Blockchain)
- **Solana Web3.js** - Blockchain interaction
- **SPL Token (USDC)** - Payment token
- **Helius RPC** - Fast, reliable network access
- **On-chain verification** - Trustless payment confirmation

### 3. Application Layer
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Serverless API routes with Supabase
- **AI Integration:** OpenAI, Google AI, Ideogram, Alibaba Cloud

## HTTP 402 Payment Flow

### Step-by-Step Implementation

**1. User Request**
```
POST /api/generate
{
  "model": "veo-3.1",
  "prompt": "create amazing video",
  "options": { "aspectRatio": "16:9" }
}
```

**2. Server Returns 402 Payment Required**
```json
{
  "status": 402,
  "message": "Payment Required",
  "payment": {
    "amount": 1.296,
    "currency": "USDC",
    "model": "Veo 3.1",
    "recipient": "wallet_address"
  }
}
```

**3. Client Initiates Blockchain Payment**
- User approves transaction in Solana wallet
- USDC transferred on-chain to platform wallet
- Transaction signature returned

**4. Server Verifies Payment**
- Checks transaction on Solana blockchain
- Validates amount, recipient, and sender
- Confirms transaction finality

**5. Generation Proceeds**
- AI generation starts immediately after verification
- Real-time progress updates via chat interface
- Results delivered when complete

### Why This Matters

Traditional payment systems require:
- Credit card processing (2-3% fees)
- Monthly subscriptions
- KYC/identity verification
- Chargebacks and disputes

HTTP 402 + Blockchain enables:
- Direct peer-to-peer payments (minimal fees)
- True pay-per-use model
- Wallet-based authentication only
- Irreversible, trustless transactions

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

## Technical Implementation

### Payment Verification
```typescript
// Server-side payment verification
const transaction = await connection.getTransaction(signature);
const transfer = transaction.meta.postTokenBalances[0];

if (transfer.amount >= requiredAmount && 
    transfer.owner === platformWallet) {
  // Payment confirmed - proceed with generation
  return { verified: true, amount: transfer.amount };
}
```

### Client-Side Payment
```typescript
// User initiates USDC payment
const signature = await sendUSDCPayment(
  connection,
  publicKey,
  signTransaction,
  recipientWallet,
  amount
);

// Server verifies and processes
await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ signature, model, prompt })
});
```

### Features
- **On-chain verification only** - No database payment records needed
- **Instant confirmation** - 1-3 second payment verification on Solana
- **Full transparency** - All transactions viewable on Solscan
- **No chargebacks** - Blockchain transactions are final
- **Wallet authentication** - No passwords or user accounts required

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

**HTTP 402 Implementation:**
- Protocol-first architecture
- Blockchain payment verification
- No traditional payment processing
- Trustless transaction system

**Blockchain (Solana):**
- Solana Web3.js - Transaction handling
- SPL Token (USDC) - Payment currency
- Wallet Adapter - User authentication
- Helius RPC - Network access

**Application:**
- Next.js 14 - Full-stack framework
- React 18 + TypeScript - Frontend
- Tailwind CSS - Styling
- Supabase - Database & storage

**AI Models:**
- Sora 2, Veo 3.1 (video)
- GPT-Image, Ideogram, Qwen (image)

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

## About HTTP 402

The HTTP 402 Payment Required status code was reserved in the original HTTP specification (1997) for future digital payment systems. While never officially standardized, Gen402 implements this protocol as intended:

- **RFC 9110 Section 15.5.3:** "The 402 (Payment Required) status code is reserved for future use."
- **Original Intent:** Enable direct payment protocols without traditional payment processing
- **Gen402 Implementation:** Blockchain-verified payments using USDC on Solana

### Protocol Resources
- [HTTP 402 Specification](https://httpwg.org/specs/rfc9110.html#status.402)
- [Solana Documentation](https://docs.solana.com)
- [USDC on Solana](https://www.circle.com/en/usdc)

---

**Gen402** - Implementing HTTP 402 Payment Protocol with Blockchain  
© 2025 Gen402. Built with Next.js, Solana, and AI

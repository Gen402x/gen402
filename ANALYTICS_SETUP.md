# Analytics Dashboard Setup Guide

Analytics dashboard er nu klar! 🎉

## Setup Steps:

### 1. Run SQL Migration
Gå til din Supabase SQL Editor og kør:
```bash
supabase-analytics-migration.sql
```

Dette opretter:
- `generations` tabel til at tracke alle generations
- Indexes for hurtige queries
- RLS policies for security
- Helper function `get_user_analytics()` for analytics

### 2. Integration (Optional - for production)
For at tracke generations automatisk, tilføj til `app/api/generate/route.ts`:

```typescript
import { saveGeneration } from '@/lib/analytics-tracking';
import { getModelById } from '@/lib/models';

// Efter en generation er oprettet:
const modelInfo = getModelById(model);

await saveGeneration({
  user_wallet: userWallet,
  chat_id: chatId, // if available
  generation_id: taskId,
  model: model,
  model_name: modelInfo.name,
  provider: modelInfo.provider,
  type: type, // 'image' | 'video' | 'music'
  prompt: prompt,
  options: options,
  amount_usd: actualAmountPaid,
  payment_method: effectivePaymentMethod,
  payment_signature: paymentSignature,
  status: 'pending',
});
```

Og opdater status når generation er færdig i `app/api/generate/[id]/route.ts`:

```typescript
import { updateGenerationStatus } from '@/lib/analytics-tracking';

// Når generation er completed:
await updateGenerationStatus(
  taskId,
  'completed',
  resultUrls
);

// Når generation fejler:
await updateGenerationStatus(
  taskId,
  'failed',
  undefined,
  errorMessage
);
```

### 3. Test Analytics
1. Kør SQL migration i Supabase
2. Start dev server: `npm run dev`
3. Gå til: http://localhost:3000/dashboard/analytics
4. Connect din wallet
5. Du vil se dashboard (tom hvis ingen data endnu)

### 4. Features Included:

✅ **Stats Cards:**
- Total spent
- Total generations
- Success rate
- Average cost per generation

✅ **Charts:**
- Activity over time (last 14 days)
- Content type breakdown (pie chart)
- Top models used (bar chart)
- Payment method distribution

✅ **Savings Calculator:**
- Sammenligner med subscription costs
- Viser hvor meget du har sparet

### 5. Navigation
Analytics link er tilføjet i Header navigation.

## Testing Without Database:
For at teste UI uden database:
1. API vil returnere tom data
2. Dashboard viser "No Data Yet" state
3. Alt virker når du tilføjer tracking integration

## File Structure:
```
app/
├── api/
│   └── analytics/
│       └── route.ts          # API endpoint
└── dashboard/
    └── analytics/
        └── page.tsx          # Dashboard page

lib/
└── analytics-tracking.ts     # Helper functions

components/
└── Header.tsx                # Updated with Analytics link

supabase-analytics-migration.sql  # Database schema
```

## Next Steps:
1. Run SQL migration ✅
2. Test dashboard ✅
3. Add tracking to generate API (optional for production)
4. Enjoy your analytics! 📊





-- Gen402 Complete Database Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. GENERATIONS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_wallet TEXT NOT NULL,
  chat_id UUID REFERENCES public.chats(id) ON DELETE SET NULL,
  generation_id TEXT NOT NULL UNIQUE,
  model TEXT NOT NULL,
  model_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'music')),
  prompt TEXT NOT NULL,
  options JSONB DEFAULT '{}'::jsonb,
  
  -- Payment info
  amount_usd DECIMAL(10, 6) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('payper', 'usdc')),
  payment_signature TEXT NOT NULL,
  
  -- Generation status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result_urls TEXT[],
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_generations_user_wallet ON public.generations(user_wallet);
CREATE INDEX IF NOT EXISTS idx_generations_chat_id ON public.generations(chat_id);
CREATE INDEX IF NOT EXISTS idx_generations_generation_id ON public.generations(generation_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_type ON public.generations(type);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);
CREATE INDEX IF NOT EXISTS idx_generations_wallet_created ON public.generations(user_wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_wallet_status ON public.generations(user_wallet, status);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own generations"
  ON public.generations
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert generations"
  ON public.generations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update generations"
  ON public.generations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.generations IS 'Tracks all AI generations with payment and result info';
COMMENT ON COLUMN public.generations.user_wallet IS 'Solana wallet address of user who created generation';
COMMENT ON COLUMN public.generations.generation_id IS 'Unique generation ID (task ID from AI service)';
COMMENT ON COLUMN public.generations.amount_usd IS 'Amount paid in USD';
COMMENT ON COLUMN public.generations.result_urls IS 'Array of generated content URLs';

-- ============================================
-- 2. REFUNDS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signature TEXT NOT NULL UNIQUE,
  user_wallet TEXT NOT NULL,
  amount DECIMAL(20, 4) NOT NULL,
  token TEXT NOT NULL CHECK (token IN ('PAYPER', 'USDC')),
  reason TEXT NOT NULL,
  original_tx_signature TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_refunds_timestamp ON public.refunds(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_user_wallet ON public.refunds(user_wallet);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_original_tx ON public.refunds(original_tx_signature);
CREATE INDEX IF NOT EXISTS idx_refunds_wallet_status ON public.refunds(user_wallet, status);

-- Enable RLS
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public refunds read access" 
  ON public.refunds 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role refunds insert access" 
  ON public.refunds 
  FOR INSERT 
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.refunds IS 'Tracker alle refunds for failed generations';
COMMENT ON COLUMN public.refunds.signature IS 'Solana refund transaction signature';
COMMENT ON COLUMN public.refunds.user_wallet IS 'Brugerens wallet der modtog refund';
COMMENT ON COLUMN public.refunds.amount IS 'Refund beløb i USD';
COMMENT ON COLUMN public.refunds.token IS 'Token type der blev refunded (PAYPER eller USDC)';
COMMENT ON COLUMN public.refunds.reason IS 'Årsag til refund (fx content policy violation)';

-- ============================================
-- 3. CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chats_owner_wallet ON public.chats(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON public.chats(created_at DESC);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public chats read access"
  ON public.chats
  FOR SELECT
  USING (true);

CREATE POLICY "Service role chats insert access"
  ON public.chats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role chats update access"
  ON public.chats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role chats delete access"
  ON public.chats
  FOR DELETE
  USING (true);

COMMENT ON TABLE public.chats IS 'Wallet-baserede chats for PayPer402 dashboardet';
COMMENT ON COLUMN public.chats.owner_wallet IS 'Solana wallet adresse der ejer chatten';

-- ============================================
-- 4. CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON public.chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public chat_messages read access"
  ON public.chat_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Service role chat_messages insert access"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role chat_messages update access"
  ON public.chat_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.chat_messages IS 'Gemmer prompts, svar og statusbeskeder for hver chat';
COMMENT ON COLUMN public.chat_messages.metadata IS 'JSON metadata (model, tx, status, osv.)';

-- ============================================
-- 5. BUYBACKS TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.buybacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  signature TEXT NOT NULL UNIQUE,
  amount_sol DECIMAL(20, 9) NOT NULL,
  amount_usd DECIMAL(20, 2) NOT NULL,
  reference_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buybacks_timestamp ON public.buybacks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_buybacks_reference_id ON public.buybacks(reference_id);
CREATE INDEX IF NOT EXISTS idx_buybacks_status ON public.buybacks(status);

-- Enable RLS
ALTER TABLE public.buybacks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public buybacks read access" 
  ON public.buybacks 
  FOR SELECT 
  USING (true);

CREATE POLICY "Service role buybacks insert access" 
  ON public.buybacks 
  FOR INSERT 
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE public.buybacks IS 'Tracker alle automatiske buybacks fra 10% fee';
COMMENT ON COLUMN public.buybacks.signature IS 'Solana transaction signature';
COMMENT ON COLUMN public.buybacks.amount_sol IS 'Buyback amount i SOL';
COMMENT ON COLUMN public.buybacks.amount_usd IS 'Buyback amount i USD';
COMMENT ON COLUMN public.buybacks.reference_id IS 'Reference til original payment (generationId)';

-- ============================================
-- 6. BUYBACK CONTRIBUTIONS QUEUE
-- ============================================
CREATE TABLE IF NOT EXISTS public.buyback_contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_signature TEXT NOT NULL,
  generation_id TEXT NOT NULL,
  amount_usd DECIMAL(20, 4) NOT NULL,
  model_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  batch_signature TEXT,
  error TEXT
);

CREATE INDEX IF NOT EXISTS idx_buyback_contributions_status ON public.buyback_contributions(status);
CREATE INDEX IF NOT EXISTS idx_buyback_contributions_created_at ON public.buyback_contributions(created_at);

ALTER TABLE public.buyback_contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public buyback_contributions read access"
  ON public.buyback_contributions
  FOR SELECT
  USING (true);

CREATE POLICY "Service role buyback_contributions insert access"
  ON public.buyback_contributions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role buyback_contributions update access"
  ON public.buyback_contributions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.buyback_contributions IS 'Queue af individuelle 10% buyback-bidrag, processeres i batches';
COMMENT ON COLUMN public.buyback_contributions.payment_signature IS 'Solana payment signature fra brugeren';
COMMENT ON COLUMN public.buyback_contributions.amount_usd IS 'USD-beløb (10% af betaling) som skal buybackes';

-- ============================================
-- 7. ANALYTICS HELPER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION get_user_analytics(wallet_address TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_spent', COALESCE(SUM(amount_usd), 0),
    'total_generations', COUNT(*),
    'completed_generations', COUNT(*) FILTER (WHERE status = 'completed'),
    'failed_generations', COUNT(*) FILTER (WHERE status = 'failed'),
    'success_rate', CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'completed')::float / COUNT(*)::float * 100)
      ELSE 100 
    END,
    'avg_cost', CASE 
      WHEN COUNT(*) > 0 THEN AVG(amount_usd)
      ELSE 0 
    END,
    'by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM public.generations
        WHERE user_wallet = wallet_address
        GROUP BY type
      ) type_counts
    ),
    'by_model', (
      SELECT json_object_agg(model_name, count)
      FROM (
        SELECT model_name, COUNT(*) as count
        FROM public.generations
        WHERE user_wallet = wallet_address
        GROUP BY model_name
        ORDER BY count DESC
        LIMIT 10
      ) model_counts
    ),
    'by_payment_method', (
      SELECT json_object_agg(payment_method, count)
      FROM (
        SELECT payment_method, COUNT(*) as count
        FROM public.generations
        WHERE user_wallet = wallet_address
        GROUP BY payment_method
      ) payment_counts
    ),
    'recent_activity', (
      SELECT json_agg(day_data)
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as generations,
          SUM(amount_usd) as spent
        FROM public.generations
        WHERE user_wallet = wallet_address
          AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
      ) day_data
    ),
    'money_saved', (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.refunds
      WHERE user_wallet = wallet_address
        AND status = 'success'
    )
  ) INTO result
  FROM public.generations
  WHERE user_wallet = wallet_address;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_analytics IS 'Returns comprehensive analytics for a user wallet including refunds';

-- ============================================
-- DONE!
-- ============================================
-- Your database is now ready for Gen402 Analytics Dashboard


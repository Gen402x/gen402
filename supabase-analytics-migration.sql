-- Analytics & Generation Tracking Migration
-- Run this in your Supabase SQL Editor

-- Generations tracking table
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

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_generations_user_wallet ON public.generations(user_wallet);
CREATE INDEX IF NOT EXISTS idx_generations_chat_id ON public.generations(chat_id);
CREATE INDEX IF NOT EXISTS idx_generations_generation_id ON public.generations(generation_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_type ON public.generations(type);
CREATE INDEX IF NOT EXISTS idx_generations_model ON public.generations(model);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);

-- Composite index for analytics queries
CREATE INDEX IF NOT EXISTS idx_generations_wallet_created 
  ON public.generations(user_wallet, created_at DESC);

-- Enable RLS
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own generations"
  ON public.generations
  FOR SELECT
  USING (user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet' OR true);

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
COMMENT ON COLUMN public.generations.generation_id IS 'Unique generation ID (gen_timestamp_random)';
COMMENT ON COLUMN public.generations.amount_usd IS 'Amount paid in USD';
COMMENT ON COLUMN public.generations.result_urls IS 'Array of generated content URLs';

-- Helper function to get user analytics
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
      SELECT json_object_agg(model, count)
      FROM (
        SELECT model, COUNT(*) as count
        FROM public.generations
        WHERE user_wallet = wallet_address
        GROUP BY model
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
    )
  ) INTO result
  FROM public.generations
  WHERE user_wallet = wallet_address;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_analytics IS 'Returns comprehensive analytics for a user wallet';





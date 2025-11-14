-- Prompt Optimizer Migration
-- Kør denne SQL i din Supabase SQL Editor

-- Prompt Optimizer Chats
CREATE TABLE IF NOT EXISTS public.prompt_optimizer_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_wallet TEXT NOT NULL,
  title TEXT,
  prompt_type TEXT NOT NULL CHECK (prompt_type IN ('music', 'image', 'video')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for hurtige queries
CREATE INDEX IF NOT EXISTS idx_prompt_optimizer_chats_owner_wallet 
  ON public.prompt_optimizer_chats(owner_wallet);
CREATE INDEX IF NOT EXISTS idx_prompt_optimizer_chats_created_at 
  ON public.prompt_optimizer_chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_optimizer_chats_prompt_type 
  ON public.prompt_optimizer_chats(prompt_type);

-- Enable Row Level Security
ALTER TABLE public.prompt_optimizer_chats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own prompt optimizer chats"
  ON public.prompt_optimizer_chats
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert prompt optimizer chats"
  ON public.prompt_optimizer_chats
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update prompt optimizer chats"
  ON public.prompt_optimizer_chats
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete prompt optimizer chats"
  ON public.prompt_optimizer_chats
  FOR DELETE
  USING (true);

COMMENT ON TABLE public.prompt_optimizer_chats IS 'Prompt optimizer chats - hjælper brugere med at lave bedre prompts';
COMMENT ON COLUMN public.prompt_optimizer_chats.prompt_type IS 'Type af prompt: music, image, eller video';

-- Prompt Optimizer Messages
CREATE TABLE IF NOT EXISTS public.prompt_optimizer_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.prompt_optimizer_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Optional metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_prompt_optimizer_messages_chat_id 
  ON public.prompt_optimizer_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_prompt_optimizer_messages_created_at 
  ON public.prompt_optimizer_messages(created_at ASC);

-- Enable Row Level Security
ALTER TABLE public.prompt_optimizer_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read prompt optimizer messages"
  ON public.prompt_optimizer_messages
  FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert prompt optimizer messages"
  ON public.prompt_optimizer_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update prompt optimizer messages"
  ON public.prompt_optimizer_messages
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.prompt_optimizer_messages IS 'Beskeder i prompt optimizer chats - 100% GRATIS!';
COMMENT ON COLUMN public.prompt_optimizer_messages.metadata IS 'JSON metadata (model suggestions, tokens, osv.)';


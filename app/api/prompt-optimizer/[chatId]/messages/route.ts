import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET - Hent alle beskeder for en chat
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_optimizer_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Supabase error (fetch prompt optimizer messages):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data ?? [] });
  } catch (error: any) {
    console.error('❌ GET /api/prompt-optimizer/[chatId]/messages failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * POST - Gem en besked (bruges til at gemme user messages og assistant responses)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params;

    if (!chatId) {
      return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { role, content, metadata, amountUSD, paymentMethod, paymentSignature } = body as {
      role?: 'user' | 'assistant' | 'system';
      content?: string;
      metadata?: Record<string, unknown>;
      amountUSD?: number;
      paymentMethod?: 'payper' | 'usdc';
      paymentSignature?: string;
    };

    if (!role) {
      return NextResponse.json({ error: 'role is required' }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_optimizer_messages')
      .insert([
        {
          chat_id: chatId,
          role,
          content,
          metadata: metadata ?? null,
          amount_usd: amountUSD ?? null,
          payment_method: paymentMethod ?? null,
          payment_signature: paymentSignature ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error (create prompt optimizer message):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Opdater chat updated_at
    await supabaseAdmin
      .from('prompt_optimizer_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return NextResponse.json({ message: data });
  } catch (error: any) {
    console.error('❌ POST /api/prompt-optimizer/[chatId]/messages failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}




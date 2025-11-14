import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET - Hent alle prompt optimizer chats for en wallet
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Missing wallet parameter' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_optimizer_chats')
      .select('*')
      .eq('owner_wallet', wallet)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error (fetch prompt optimizer chats):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chats: data ?? [] });
  } catch (error: any) {
    console.error('❌ GET /api/prompt-optimizer failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * POST - Opret en ny prompt optimizer chat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { wallet, title, promptType } = body as { 
      wallet?: string; 
      title?: string;
      promptType?: 'music' | 'image' | 'video';
    };

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet is required' }, { status: 400 });
    }

    if (!promptType || !['music', 'image', 'video'].includes(promptType)) {
      return NextResponse.json({ error: 'Valid promptType is required (music, image, video)' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_optimizer_chats')
      .insert([
        {
          owner_wallet: wallet,
          title: title?.trim() || `New ${promptType} prompt`,
          prompt_type: promptType,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error (create prompt optimizer chat):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat: data });
  } catch (error: any) {
    console.error('❌ POST /api/prompt-optimizer failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * PATCH - Opdater en prompt optimizer chat
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { id, title } = body as { id?: string; title?: string };

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('prompt_optimizer_chats')
      .update({ 
        title: title?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error (update prompt optimizer chat):', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ chat: data });
  } catch (error: any) {
    console.error('❌ PATCH /api/prompt-optimizer failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}

/**
 * DELETE - Slet en prompt optimizer chat
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const wallet = searchParams.get('wallet');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    if (!wallet) {
      return NextResponse.json({ error: 'wallet is required' }, { status: 400 });
    }

    // Verificer ejerskab
    const { error: ownershipError, data: chatRecord } = await supabaseAdmin
      .from('prompt_optimizer_chats')
      .select('id, owner_wallet')
      .eq('id', id)
      .single();

    if (ownershipError) {
      console.error('❌ Supabase error (lookup chat before delete):', ownershipError);
      return NextResponse.json({ error: ownershipError.message }, { status: 500 });
    }

    if (!chatRecord) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    if (chatRecord.owner_wallet !== wallet) {
      return NextResponse.json({ error: 'Not authorized to delete this chat' }, { status: 403 });
    }

    // Slet chat (messages slettes automatisk via CASCADE)
    const { error: chatError } = await supabaseAdmin
      .from('prompt_optimizer_chats')
      .delete()
      .eq('id', id);

    if (chatError) {
      console.error('❌ Supabase error (delete prompt optimizer chat):', chatError);
      return NextResponse.json({ error: chatError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedChatId: id });
  } catch (error: any) {
    console.error('❌ DELETE /api/prompt-optimizer failed:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}




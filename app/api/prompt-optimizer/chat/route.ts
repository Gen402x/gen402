import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST - Send en besked og få AI respons (GRATIS!)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      chatId, 
      userMessage, 
      promptType,
    } = body;

    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
    }

    if (!userMessage) {
      return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    }

    if (!promptType || !['music', 'image', 'video'].includes(promptType)) {
      return NextResponse.json({ error: 'Valid promptType is required' }, { status: 400 });
    }

    console.log('🎨 Processing FREE prompt optimization request...');

    // Gem user besked
    const { data: userMessageData, error: userMessageError } = await supabaseAdmin
      .from('prompt_optimizer_messages')
      .insert([
        {
          chat_id: chatId,
          role: 'user',
          content: userMessage,
          metadata: { promptType },
        },
      ])
      .select()
      .single();

    if (userMessageError) {
      console.error('❌ Failed to save user message:', userMessageError);
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 });
    }

    // Hent alle tidligere beskeder for kontekst
    const { data: previousMessages } = await supabaseAdmin
      .from('prompt_optimizer_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    // Byg chat historik
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: getSystemPrompt(promptType as 'music' | 'image' | 'video'),
      },
    ];

    // Tilføj tidligere beskeder (undtagen den vi lige gemte)
    if (previousMessages && previousMessages.length > 1) {
      for (const msg of previousMessages.slice(0, -1)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content,
          });
        }
      }
    }

    // Tilføj den nye user besked
    messages.push({
      role: 'user',
      content: userMessage,
    });

    console.log('🤖 Calling OpenAI with', messages.length, 'messages');

    // Kald OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages,
      temperature: 0.8,
      max_tokens: 1500,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 'Jeg kunne ikke generere et svar. Prøv venligst igen.';

    // Gem assistant besked
    const { data: assistantMessageData, error: assistantMessageError } = await supabaseAdmin
      .from('prompt_optimizer_messages')
      .insert([
        {
          chat_id: chatId,
          role: 'assistant',
          content: assistantMessage,
          metadata: { 
            model: 'gpt-4-turbo-preview',
            tokens: completion.usage?.total_tokens || 0,
            promptType,
          },
        },
      ])
      .select()
      .single();

    if (assistantMessageError) {
      console.error('❌ Failed to save assistant message:', assistantMessageError);
      return NextResponse.json({ error: 'Failed to save assistant message' }, { status: 500 });
    }

    // Opdater chat updated_at
    await supabaseAdmin
      .from('prompt_optimizer_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    console.log('✅ FREE prompt optimization completed successfully!');

    return NextResponse.json({
      success: true,
      userMessage: userMessageData,
      assistantMessage: assistantMessageData,
    });

  } catch (error: any) {
    console.error('❌ POST /api/prompt-optimizer/chat failed:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * System prompts for different types
 */
function getSystemPrompt(promptType: 'music' | 'image' | 'video'): string {
  const prompts = {
    music: `You are an expert at helping users create excellent music prompts for AI music generation using Suno AI (V3.5, V4.5, V5).

Your task:
- Help users describe the music they want to create
- Suggest genres, moods, instruments, and song structures
- Provide concrete examples of effective Suno prompts
- Enhance user prompts by adding descriptive details
- Ask relevant follow-up questions to understand their vision

Example of good Suno prompt:
"[Verse] Upbeat indie pop with jangly guitars, female vocals, catchy melody [Chorus] Energetic drums, layered harmonies, bright synths [Bridge] Stripped down acoustic, emotional build-up"

Be creative, precise, and helpful!`,

    image: `You are an expert at helping users create excellent image prompts for AI image generation using 4o Image, Ideogram V3, and Qwen.

Your task:
- Help users describe the image they want to create
- Suggest artistic styles, composition, lighting, and mood
- Provide concrete examples of effective prompts
- Enhance user prompts by adding technical and descriptive details
- Ask relevant follow-up questions to understand their vision

Example of good image prompt:
"A serene mountain landscape at golden hour, dramatic clouds, volumetric lighting, wide angle shot, photorealistic, cinematic composition, 8k quality"

Be creative, precise, and helpful!`,

    video: `You are an expert at helping users create excellent video prompts for AI video generation using Sora 2, Veo 3.1, and Grok Imagine.

Your task:
- Help users describe the video they want to create
- Suggest camera angles, movements, scenes, and transitions
- Provide concrete examples of effective prompts
- Enhance user prompts by adding cinematographic details
- Ask relevant follow-up questions to understand their vision

Example of good video prompt:
"Slow motion shot of a surfer riding a massive wave, camera follows from side angle, golden sunset lighting, water droplets catching light, cinematic color grading, smooth camera movement"

Be creative, precise, and helpful!`,
  };

  return prompts[promptType];
}


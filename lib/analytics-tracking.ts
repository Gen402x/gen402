/**
 * Analytics Tracking System
 * Save generation data to Supabase for analytics
 */

import { supabaseAdmin } from './supabase';

export interface GenerationRecord {
  user_wallet: string;
  chat_id?: string | null;
  generation_id: string;
  model: string;
  model_name: string;
  provider: string;
  type: 'image' | 'video' | 'music';
  prompt: string;
  options?: Record<string, any>;
  amount_usd: number;
  payment_method: 'payper' | 'usdc';
  payment_signature: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  result_urls?: string[];
  error_message?: string;
  metadata?: Record<string, any>;
}

/**
 * Save a generation record to the database
 */
export async function saveGeneration(record: GenerationRecord): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('generations')
      .insert([
        {
          user_wallet: record.user_wallet,
          chat_id: record.chat_id || null,
          generation_id: record.generation_id,
          model: record.model,
          model_name: record.model_name,
          provider: record.provider,
          type: record.type,
          prompt: record.prompt,
          options: record.options || {},
          amount_usd: record.amount_usd,
          payment_method: record.payment_method,
          payment_signature: record.payment_signature,
          status: record.status || 'pending',
          result_urls: record.result_urls || [],
          error_message: record.error_message || null,
          metadata: record.metadata || {},
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('❌ Failed to save generation to database:', error);
      return false;
    }

    console.log('✅ Generation saved to database:', record.generation_id);
    return true;
  } catch (error) {
    console.error('❌ Error saving generation:', error);
    return false;
  }
}

/**
 * Update generation status
 */
export async function updateGenerationStatus(
  generationId: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  resultUrls?: string[],
  errorMessage?: string
): Promise<boolean> {
  try {
    const updates: any = {
      status,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
    };

    if (resultUrls) {
      updates.result_urls = resultUrls;
    }

    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .update(updates)
      .eq('generation_id', generationId);

    if (error) {
      console.error('❌ Failed to update generation status:', error);
      return false;
    }

    console.log('✅ Generation status updated:', generationId, status);
    return true;
  } catch (error) {
    console.error('❌ Error updating generation status:', error);
    return false;
  }
}

/**
 * Get generation by ID
 */
export async function getGeneration(generationId: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('generations')
      .select('*')
      .eq('generation_id', generationId)
      .single();

    if (error) {
      console.error('❌ Failed to get generation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error getting generation:', error);
    return null;
  }
}





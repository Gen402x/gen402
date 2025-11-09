import axios from 'axios';
import { Connection, VersionedTransaction } from '@solana/web3.js';
import base58 from 'bs58';

const SOL_INCINERATOR_API_URL = 'https://v1.api.sol-incinerator.com';
const SOL_INCINERATOR_API_KEY = process.env.SOL_INCINERATOR_API_KEY;
const GEN_TOKEN_MINT = 'FbVjCKgm8us17ZhQCdXvwzXdeEaCPhvymvXwPJFKpump';

if (!SOL_INCINERATOR_API_KEY) {
  console.warn('⚠️ SOL_INCINERATOR_API_KEY is not set - token burns will not work');
}

interface BurnTokensParams {
  paymentWalletPublicKey: string;  // The wallet that received the payment
  tokenAccountAddress: string;      // The token account to burn from
  amount?: number;                  // Amount to burn (in atomic units), defaults to full balance
}

interface BurnResult {
  success: boolean;
  signature?: string;
  amountBurned?: number;
  error?: string;
}

/**
 * Burns GEN tokens from the payment wallet using Sol-Incinerator API
 * This reduces token supply and creates deflationary pressure
 */
export async function burnGENTokens(params: BurnTokensParams): Promise<BurnResult> {
  try {
    if (!SOL_INCINERATOR_API_KEY) {
      console.error('❌ Cannot burn tokens: SOL_INCINERATOR_API_KEY not configured');
      return {
        success: false,
        error: 'Burn API key not configured'
      };
    }

    console.log('🔥 Initiating GEN token burn...');
    console.log('💰 Payment wallet:', params.paymentWalletPublicKey);
    console.log('📦 Token account:', params.tokenAccountAddress);
    if (params.amount) {
      console.log('🔢 Amount to burn:', params.amount);
    }

    // Request burn transaction from Sol-Incinerator
    const response = await axios.post(`${SOL_INCINERATOR_API_URL}/burn`, {
      userPublicKey: params.paymentWalletPublicKey,
      assetId: params.tokenAccountAddress,
      autoCloseTokenAccounts: false, // Keep account open for future payments
      burnAmount: params.amount, // Burn specific amount or full balance
    }, {
      headers: {
        'x-api-key': SOL_INCINERATOR_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ Burn transaction received from Sol-Incinerator');
    console.log('💎 SOL reclaimed:', response.data.solanaReclaimed);
    
    return {
      success: true,
      signature: response.data.serializedTransaction,
      amountBurned: params.amount,
    };

  } catch (error: any) {
    console.error('❌ Failed to burn GEN tokens:', error.response?.data || error.message);
    
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Unknown burn error'
    };
  }
}

/**
 * Preview how much would be burned without executing
 */
export async function previewGENBurn(params: BurnTokensParams): Promise<{
  success: boolean;
  lamportsReclaimed?: number;
  solanaReclaimed?: number;
  error?: string;
}> {
  try {
    if (!SOL_INCINERATOR_API_KEY) {
      return {
        success: false,
        error: 'Burn API key not configured'
      };
    }

    const response = await axios.post(`${SOL_INCINERATOR_API_URL}/burn/preview`, {
      userPublicKey: params.paymentWalletPublicKey,
      assetId: params.tokenAccountAddress,
      autoCloseTokenAccounts: false,
      burnAmount: params.amount,
    }, {
      headers: {
        'x-api-key': SOL_INCINERATOR_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      lamportsReclaimed: response.data.lamportsReclaimed,
      solanaReclaimed: response.data.solanaReclaimed,
    };

  } catch (error: any) {
    console.error('❌ Failed to preview burn:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

/**
 * Queue a burn operation to be executed later by a backend service
 * This allows the payment to complete quickly while burn happens asynchronously
 */
export interface BurnQueueItem {
  paymentSignature: string;
  paymentWalletPublicKey: string;
  tokenAccountAddress: string;
  amountPaid: number;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  burnSignature?: string;
  error?: string;
}

// In-memory queue (in production, use database)
const burnQueue: Map<string, BurnQueueItem> = new Map();

/**
 * Add a burn operation to the queue
 */
export function queueTokenBurn(item: Omit<BurnQueueItem, 'status' | 'timestamp'>): void {
  const queueItem: BurnQueueItem = {
    ...item,
    status: 'pending',
    timestamp: new Date(),
  };
  
  burnQueue.set(item.paymentSignature, queueItem);
  console.log('🔥 Queued GEN token burn for signature:', item.paymentSignature);
  console.log('📊 Queue size:', burnQueue.size);
}

/**
 * Get all pending burns
 */
export function getPendingBurns(): BurnQueueItem[] {
  return Array.from(burnQueue.values()).filter(item => item.status === 'pending');
}

/**
 * Process pending burns (call this from a cron job or background worker)
 */
export async function processPendingBurns(): Promise<void> {
  const pending = getPendingBurns();
  
  if (pending.length === 0) {
    console.log('✅ No pending burns to process');
    return;
  }

  console.log(`🔥 Processing ${pending.length} pending burns...`);

  for (const item of pending) {
    try {
      // Mark as processing
      item.status = 'processing';
      burnQueue.set(item.paymentSignature, item);

      // Execute burn
      const result = await burnGENTokens({
        paymentWalletPublicKey: item.paymentWalletPublicKey,
        tokenAccountAddress: item.tokenAccountAddress,
        amount: item.amountPaid,
      });

      if (result.success) {
        item.status = 'completed';
        item.burnSignature = result.signature;
        console.log(`✅ Burned tokens for payment ${item.paymentSignature}`);
      } else {
        item.status = 'failed';
        item.error = result.error;
        console.error(`❌ Failed to burn for payment ${item.paymentSignature}:`, result.error);
      }

      burnQueue.set(item.paymentSignature, item);

    } catch (error: any) {
      item.status = 'failed';
      item.error = error.message;
      burnQueue.set(item.paymentSignature, item);
      console.error(`❌ Error processing burn for ${item.paymentSignature}:`, error);
    }

    // Small delay between burns to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('✅ Finished processing burns');
}

/**
 * Get burn statistics
 */
export function getBurnStats() {
  const all = Array.from(burnQueue.values());
  return {
    total: all.length,
    pending: all.filter(i => i.status === 'pending').length,
    processing: all.filter(i => i.status === 'processing').length,
    completed: all.filter(i => i.status === 'completed').length,
    failed: all.filter(i => i.status === 'failed').length,
  };
}


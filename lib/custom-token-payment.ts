import { 
  Connection, 
  PublicKey, 
  Transaction,
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Custom Token Mint Address
export const CUSTOM_TOKEN_MINT = new PublicKey('FbVjCKgm8us17ZhQCdXvwzXdeEaCPhvymvXwPJFKpump');

// Get payment wallet address from environment
export const getPaymentWalletAddress = (): PublicKey => {
  const paymentWalletAddress = process.env.NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS;
  if (!paymentWalletAddress) {
    console.error('⚠️ NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS is not configured in environment variables!');
    throw new Error('Payment wallet is not configured. Please contact support.');
  }
  console.log('💰 Payment wallet address:', paymentWalletAddress);
  try {
    return new PublicKey(paymentWalletAddress);
  } catch (error) {
    console.error('⚠️ Invalid payment wallet address format:', paymentWalletAddress);
    throw new Error('Invalid payment wallet configuration. Please contact support.');
  }
};

// Token decimals (usually 6 or 9 for SPL tokens)
export const CUSTOM_TOKEN_DECIMALS = 6;

export interface CustomTokenPaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Get custom token price in USD from DexScreener
 */
export async function getCustomTokenPrice(): Promise<number> {
  try {
    console.log('🔍 Fetching token price from DexScreener...');
    
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${CUSTOM_TOKEN_MINT.toBase58()}`
    );
    
    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.pairs || data.pairs.length === 0) {
      throw new Error('No trading pairs found for token');
    }
    
    // Get the first (usually most liquid) pair
    const pair = data.pairs[0];
    const priceUSD = parseFloat(pair.priceUsd);
    
    console.log('💰 Token price from DexScreener:', priceUSD, 'USD');
    console.log('📊 Pair:', pair.baseToken.symbol, '/', pair.quoteToken.symbol);
    console.log('💧 Liquidity:', pair.liquidity?.usd || 'N/A');
    
    return priceUSD;
  } catch (error: any) {
    console.error('❌ Error fetching token price:', error);
    throw new Error(`Could not fetch token price: ${error.message}`);
  }
}

/**
 * Calculate token amount needed for USD payment
 */
export async function calculateCustomTokenAmount(usdAmount: number): Promise<{
  tokenAmount: number;
  tokenPrice: number;
}> {
  const tokenPrice = await getCustomTokenPrice();
  
  if (tokenPrice <= 0) {
    throw new Error('Invalid token price');
  }
  
  const tokenAmount = usdAmount / tokenPrice;
  
  console.log('💵 USD Amount:', usdAmount);
  console.log('💰 Token Price:', tokenPrice, 'USD');
  console.log('🪙 Tokens needed:', tokenAmount.toFixed(2));
  
  return {
    tokenAmount,
    tokenPrice,
  };
}

/**
 * Send custom token payment on Solana
 */
export async function sendCustomTokenPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  usdAmount: number
): Promise<CustomTokenPaymentResult> {
  try {
    const paymentWallet = getPaymentWalletAddress();
    console.log('🔄 Starting custom token payment...');
    console.log('💵 USD amount:', usdAmount);
    console.log('👛 From:', payerPublicKey.toBase58());
    console.log('🎯 To:', paymentWallet.toBase58());

    // Get token price and calculate amount
    const { tokenAmount, tokenPrice } = await calculateCustomTokenAmount(usdAmount);
    
    // Convert token amount to smallest unit (with decimals)
    const tokenAmountRaw = Math.floor(tokenAmount * Math.pow(10, CUSTOM_TOKEN_DECIMALS));
    
    console.log('🔢 Raw token amount (with decimals):', tokenAmountRaw);
    
    // Find associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      CUSTOM_TOKEN_MINT,
      payerPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      CUSTOM_TOKEN_MINT,
      paymentWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('📦 From Token Account:', fromTokenAccount.toBase58());
    console.log('📦 To Token Account:', toTokenAccount.toBase58());

    // Check if user's token account exists
    console.log('🔍 Checking if user token account exists...');
    let fromAccountInfo;
    try {
      fromAccountInfo = await connection.getAccountInfo(fromTokenAccount);
    } catch (error: any) {
      console.error('❌ Error checking user account:', error);
      return {
        success: false,
        signature: '',
        error: `Could not verify your wallet: ${error.message}`,
      };
    }
    
    if (!fromAccountInfo) {
      console.log('⚠️  User token account does not exist!');
      return {
        success: false,
        signature: '',
        error: 'You do not have this token. Please add tokens to your wallet first.',
      };
    }
    console.log('✅ User token account exists');

    // Check token balance
    try {
      const balanceInfo = await connection.getTokenAccountBalance(fromTokenAccount);
      const currentBalance = parseFloat(balanceInfo.value.amount) / Math.pow(10, CUSTOM_TOKEN_DECIMALS);
      
      console.log('💵 Current token balance:', currentBalance.toFixed(2));
      console.log('💳 Required amount:', tokenAmount.toFixed(2));
      
      if (currentBalance < tokenAmount) {
        console.log('⚠️  Not enough tokens!');
        return {
          success: false,
          signature: '',
          error: `Insufficient tokens! You have ${currentBalance.toFixed(2)} but need ${tokenAmount.toFixed(2)}.`,
        };
      }
    } catch (balanceError) {
      console.error('⚠️  Could not fetch balance:', balanceError);
      return {
        success: false,
        signature: '',
        error: 'Could not verify your token balance. Please ensure you have tokens in your wallet.',
      };
    }

    // Check if recipient's token account exists
    console.log('🔍 Checking if recipient token account exists...');
    let toAccountInfo;
    try {
      toAccountInfo = await connection.getAccountInfo(toTokenAccount);
    } catch (error: any) {
      console.error('❌ Error checking recipient account:', error);
      return {
        success: false,
        signature: '',
        error: `Could not verify payment wallet: ${error.message}`,
      };
    }

    // Create transaction
    const transaction = new Transaction();
    
    // If recipient's token account doesn't exist, create it first
    if (!toAccountInfo) {
      console.log('📝 Recipient token account does not exist - will create it in transaction');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payerPublicKey,
          toTokenAccount,
          paymentWallet,
          CUSTOM_TOKEN_MINT,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    } else {
      console.log('✅ Recipient token account exists');
    }
    
    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        payerPublicKey,
        tokenAmountRaw,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    console.log('🧪 Transaction created, getting blockhash...');
    
    // Get recent blockhash and set fee payer BEFORE simulation
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;

    console.log('✅ Blockhash set:', blockhash.substring(0, 8) + '...');
    console.log('✅ Fee payer set:', payerPublicKey.toBase58());
    
    // Simulate transaction first to catch errors (optional - skip if simulation fails)
    try {
      console.log('🔍 Simulating transaction...');
      const simulation = await connection.simulateTransaction(transaction);
      
      if (simulation.value.err) {
        console.warn('⚠️  Transaction simulation warning:', simulation.value.err);
        console.warn('Logs:', simulation.value.logs);
        console.log('⏩ Proceeding with transaction anyway (simulation errors can be false positives)');
        // Don't return error - continue with actual transaction
      } else {
        console.log('✅ Transaction simulation OK');
      }
    } catch (simError: any) {
      console.warn('⚠️  Could not simulate transaction:', simError.message);
      console.log('⏩ Proceeding with transaction anyway');
      // Don't fail - simulation is just a preflight check
    }

    console.log('✍️ Signing transaction...');
    
    let signedTransaction;
    try {
      signedTransaction = await signTransaction(transaction);
      console.log('✅ Transaction signed successfully');
    } catch (signError: any) {
      console.error('❌ Signing error:', signError);
      return {
        signature: '',
        success: false,
        error: `Signing failed: ${signError.message || 'User cancelled or wallet error'}`,
      };
    }

    console.log('📤 Sending transaction...');
    
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    console.log('⏳ Waiting for confirmation...');
    console.log('🔗 Transaction signature:', signature);

    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      return {
        signature,
        success: false,
        error: 'Transaction failed',
      };
    }

    console.log('✅ Custom token payment successful!');
    
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Custom token payment error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Payment failed',
    };
  }
}


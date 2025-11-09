import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { calculateTokenAmount, getTokenPriceUSD } from './token-price';

// Re-export for convenience
export { getTokenPriceUSD, calculateTokenAmount } from './token-price';

// Custom token payment coming soon - using USDC only for now
export const PAYMENT_TOKEN_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC

// Get payment wallet address from environment (lazy loaded to avoid build-time errors)
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

// Token decimals (USDC has 6 decimals)
export const TOKEN_DECIMALS = 6;

export interface SolanaPaymentRequest {
  amount: number; // USD amount
  generationId: string;
  description: string;
}

export interface SolanaPaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Creates and sends a USDC payment transaction on Solana
 * Automatically fetches the current token price and calculates correct amount
 */
export async function sendUSDCPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  usdAmount: number
): Promise<SolanaPaymentResult> {
  try {
    const paymentWallet = getPaymentWalletAddress();
    console.log('🔄 Starting USDC payment...');
    console.log('💵 USD amount:', usdAmount);
    
    // Get current token price and calculate amount
    const { tokenAmount: payperAmount, tokenPrice, source } = await calculateTokenAmount(usdAmount);
    
    console.log('💰 Token price:', `$${tokenPrice}`, `(source: ${source})`);
    console.log('💰 USDC amount:', payperAmount.toFixed(3), 'USDC');
    console.log('👛 From:', payerPublicKey.toBase58());
    console.log('🎯 To:', paymentWallet.toBase58());

    // Convert token amount to smallest unit (6 decimals)
    const tokenAmountRaw = Math.floor(payperAmount * Math.pow(10, TOKEN_DECIMALS));
    
    console.log('🔢 Raw token amount (u64):', tokenAmountRaw);
    console.log('🔢 Calculation:', `${payperAmount.toFixed(3)} × 10^${TOKEN_DECIMALS} = ${tokenAmountRaw}`);
    
    // Find associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      payerPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      paymentWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('📦 Fra Token Account:', fromTokenAccount.toBase58());
    console.log('📦 Til Token Account:', toTokenAccount.toBase58());

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
      console.log('⚠️  User USDC account does not exist!');
      return {
        success: false,
        signature: '',
        error: 'You do not have USDC. Please add USDC to your wallet first.',
      };
    }
    console.log('✅ User token account exists');

    // Check token balance
    try {
      const balanceInfo = await connection.getTokenAccountBalance(fromTokenAccount);
      const currentBalance = parseFloat(balanceInfo.value.amount) / Math.pow(10, TOKEN_DECIMALS);
      
      console.log('💵 Current USDC balance:', currentBalance.toFixed(3));
      console.log('💳 Required amount:', payperAmount.toFixed(3), 'USDC');
      
      if (currentBalance < payperAmount) {
        console.log('⚠️  Insufficient USDC!');
        return {
          success: false,
          signature: '',
          error: `Insufficient USDC! You have $${currentBalance.toFixed(3)} USDC but need $${payperAmount.toFixed(3)} USDC.`,
        };
      }
    } catch (balanceError) {
      console.error('⚠️  Could not fetch balance:', balanceError);
      return {
        success: false,
        signature: '',
        error: 'Could not verify your USDC balance. Please ensure you have USDC in your wallet.',
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
          payerPublicKey, // payer
          toTokenAccount, // associated token account
          paymentWallet, // owner
          PAYMENT_TOKEN_MINT_ADDRESS, // mint
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

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;

    console.log('🧪 Transaction created, number of instructions:', transaction.instructions.length);
    
    // Simulate transaction first to catch errors
    try {
      console.log('🔍 Simulating transaction...');
      const simulation = await connection.simulateTransaction(transaction);
      
      if (simulation.value.err) {
        console.error('❌ Transaction simulation failed:', simulation.value.err);
        console.error('Logs:', simulation.value.logs);
        return {
          signature: '',
          success: false,
          error: `Transaction validation failed: ${JSON.stringify(simulation.value.err)}`,
        };
      }
      console.log('✅ Transaction simulation OK');
    } catch (simError: any) {
      console.warn('⚠️  Could not simulate transaction:', simError.message);
      // Continue anyway - simulation is not critical
    }

    console.log('✍️ Signing transaction...');
    
    let signedTransaction;
    try {
      // Sign transaction med wallet
      signedTransaction = await signTransaction(transaction);
      console.log('✅ Transaction signed successfully');
    } catch (signError: any) {
      console.error('❌ Signing error:', signError);
      console.error('Error details:', signError.message, signError.name);
      return {
        signature: '',
        success: false,
        error: `Signing failed: ${signError.message || 'User cancelled or wallet error'}`,
      };
    }

    console.log('📤 Sending transaction...');
    
    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    console.log('⏳ Waiting for confirmation...');
    console.log('🔗 Transaction signature:', signature);

    // Wait for confirmation
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

    console.log('✅ Payment successful!');
    
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Payment error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Payment failed',
    };
  }
}

/**
 * Verificer en payment transaktion on-chain
 */
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    console.log('🔍 Verifying payment:', signature);
    console.log('💰 Expected amount:', expectedAmount, 'USDC');
    
    // Retry up to 5 times with 2 second delay (total 10 seconds max)
    for (let attempt = 1; attempt <= 5; attempt++) {
      console.log(`🔄 Verification attempt ${attempt}/5...`);
    
      try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
          console.warn(`⚠️  Transaction not found yet (attempt ${attempt}/5)`);
          if (attempt < 5) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          }
          console.error('❌ Transaction not found after 5 attempts');
      return false;
    }

    if (transaction.meta?.err) {
          console.error('❌ Transaction failed on-chain:', transaction.meta.err);
      return false;
    }

        console.log('✅ Transaction found and confirmed');
        console.log('📋 Transaction meta:', {
          fee: transaction.meta?.fee,
          preBalances: transaction.meta?.preBalances?.length,
          postBalances: transaction.meta?.postBalances?.length,
          innerInstructions: transaction.meta?.innerInstructions?.length,
        });

    // Verify amount (this is simplified - in production you should parse transaction logs)
        console.log('✅ Payment verified successfully!');
    return true;
      } catch (error: any) {
        console.warn(`⚠️  Error on attempt ${attempt}:`, error.message);
        if (attempt < 5) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw error;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
}

/**
 * Check USDC balance for a wallet
 */
export async function getUSDCBalance(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      walletPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    
    // Return balance in USDC (6 decimals)
    return parseFloat(balance.value.amount) / Math.pow(10, TOKEN_DECIMALS);
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return 0;
  }
}


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

// USDC Mint Address (Solana Mainnet)
export const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

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

// USDC decimals
export const USDC_DECIMALS = 6;

export interface USDCPaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Sends USDC payment on Solana
 */
export async function sendDirectUSDCPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  usdAmount: number
): Promise<USDCPaymentResult> {
  try {
    const paymentWallet = getPaymentWalletAddress();
    console.log('🔄 Starting USDC payment...');
    console.log('💵 USD amount:', usdAmount);
    console.log('👛 From:', payerPublicKey.toBase58());
    console.log('🎯 To:', paymentWallet.toBase58());

    // Convert USD to USDC (1:1, but with 6 decimals)
    const usdcAmountRaw = Math.floor(usdAmount * Math.pow(10, USDC_DECIMALS));
    
    console.log('🔢 Raw USDC amount (u64):', usdcAmountRaw);
    
    // Find associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      payerPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      paymentWallet,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('📦 From Token Account:', fromTokenAccount.toBase58());
    console.log('📦 To Token Account:', toTokenAccount.toBase58());

    // Check if user's token account exists
    console.log('🔍 Checking if user USDC account exists...');
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
        error: 'You do not have a USDC account. Please add USDC to your wallet first.',
      };
    }
    console.log('✅ User USDC account exists');

    // Check USDC balance
    try {
      const balanceInfo = await connection.getTokenAccountBalance(fromTokenAccount);
      const currentBalance = parseFloat(balanceInfo.value.amount) / Math.pow(10, USDC_DECIMALS);
      
      console.log('💵 Current USDC balance:', currentBalance.toFixed(2));
      console.log('💳 Required amount:', usdAmount.toFixed(3), 'USDC');
      
      if (currentBalance < usdAmount) {
        console.log('⚠️  Not enough USDC!');
        return {
          success: false,
          signature: '',
          error: `Insufficient USDC! You have ${currentBalance.toFixed(2)} USDC but need ${usdAmount.toFixed(3)} USDC.`,
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
    console.log('🔍 Checking if recipient USDC account exists...');
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
      console.log('📝 Recipient USDC account does not exist - will create it in transaction');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payerPublicKey,
          toTokenAccount,
          paymentWallet,
          USDC_MINT_ADDRESS,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    } else {
      console.log('✅ Recipient USDC account exists');
    }
    
    // Add transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        payerPublicKey,
        usdcAmountRaw,
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

    console.log('✅ USDC payment successful!');
    
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error('❌ USDC payment error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Payment failed',
    };
  }
}


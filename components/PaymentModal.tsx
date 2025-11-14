'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Wallet } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { sendDirectUSDCPayment } from '@/lib/usdc-payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  modelName: string;
  generationId: string;
  onPaymentComplete: (signature: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  modelName,
  generationId,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'custom'>('usdc');
  const [usdcAmount, setUsdcAmount] = useState<number>(0);
  const [customTokenAmount, setCustomTokenAmount] = useState<number>(0);
  const [customTokenPrice, setCustomTokenPrice] = useState<number | null>(null);
  
  // GEN402 payments are disabled
  const GEN402_ENABLED = false;
  
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Fetch token prices
  const fetchTokenPrice = async () => {
    setIsLoadingPrice(true);
    try {
      // Calculate USDC price (1:1 - NO MARKUP)
      const usdcAmount = amount;
      setUsdcAmount(usdcAmount);
      console.log('💵 USDC amount:', usdcAmount.toFixed(3), 'USDC');
      
      // GEN402 token payments are disabled
      setCustomTokenAmount(0);
      setCustomTokenPrice(null);
    } catch (error) {
      console.error('Error fetching token price:', error);
      // Fallback
      const usdcAmount = amount;
      setUsdcAmount(usdcAmount);
      
      // Custom token fallback
      setCustomTokenAmount(0);
      setCustomTokenPrice(null);
    } finally {
      setIsLoadingPrice(false);
      console.log('✅ Price loading complete. isLoadingPrice set to FALSE');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setPaymentStatus('pending');
      setErrorMessage('');
      setTransactionSignature('');
      setIsLoadingPrice(true);
      fetchTokenPrice();
    } else {
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [isOpen, amount]);

  const handlePayment = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setErrorMessage('Please connect your wallet first');
      return;
    }
    
    if (usdcAmount === 0) {
      setErrorMessage('Please wait for price to load');
      return;
    }

    setPaymentStatus('processing');
    setErrorMessage('');
    
    try {
      console.log('💵 Starting USDC payment:', usdcAmount.toFixed(3), 'USDC');
      
      // Send USDC payment
      const result = await sendDirectUSDCPayment(
        connection,
        publicKey,
        signTransaction,
        usdcAmount
      );

      if (result.success && result.signature) {
        console.log('✅ USDC Payment successful!');
        console.log('Signature:', result.signature);
        
        setTransactionSignature(result.signature);
        setPaymentStatus('completed');
        
        // Wait a bit and call onPaymentComplete with signature
        setTimeout(() => {
          onPaymentComplete(result.signature);
          onClose();
        }, 2000);
      } else {
        console.error('❌ USDC Payment failed:', result.error);
        setPaymentStatus('error');
        setErrorMessage(result.error || 'USDC payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 transition-all duration-400 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStatus !== 'processing') {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl z-0" />

      {/* Modal */}
      <div 
        className={`relative z-10 w-full max-w-md md:max-w-lg bg-black/90 border border-white/10 rounded-2xl shadow-2xl transition-all duration-600 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-all duration-300 group disabled:opacity-30 z-10"
          disabled={paymentStatus === 'processing'}
        >
          <X className="w-5 h-5 text-white/30 group-hover:text-white/70 transition-colors duration-300" />
        </button>

        {/* Content */}
        <div className="px-5 sm:px-8 py-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mb-4">
              <div className={`inline-block transition-all duration-700 ${
                paymentStatus === 'processing'
                  ? 'scale-110 opacity-100'
                  : 'scale-100 opacity-100'
              }`}>
                {paymentStatus === 'processing' ? (
                  <Loader2 className="w-10 h-10 text-white animate-spin" />
                ) : paymentStatus === 'error' ? (
                  <div className="w-10 h-10 border-2 border-red-500/50 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-red-500" />
                  </div>
                ) : (
                  <Wallet className="w-10 h-10 text-white/40" />
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight text-white">
              {paymentStatus === 'completed' 
                ? 'Payment Complete' 
                : paymentStatus === 'processing'
                ? 'Processing Payment'
                : paymentStatus === 'error'
                ? 'Payment Failed'
                : 'Payment Required'}
            </h2>
            <p className="text-xs text-white/50 font-light tracking-wide">
              {paymentStatus === 'completed' 
                ? 'Your generation is starting now' 
                : paymentStatus === 'processing'
                ? 'Confirming transaction on Solana'
                : paymentStatus === 'error'
                ? errorMessage
                : 'Choose your payment method'}
            </p>
          </div>

          {/* Payment Details - Slide out when completed */}
          <div className={`space-y-8 transition-all duration-700 ${
            paymentStatus === 'completed' || paymentStatus === 'error'
              ? 'opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none' 
              : 'opacity-100 translate-y-0 max-h-[600px]'
          }`}>
            {/* Payment Method Display (GEN402 disabled) */}
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-white/80 mb-1">Payment Method</p>
                <p className="text-[10px] text-white/40">
                  Pay with USDC on Solana
                </p>
              </div>
              <div className="flex gap-3 p-1.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="relative flex-1 py-3 px-4 rounded-lg text-xs font-bold uppercase tracking-[0.15em] bg-white text-black shadow-lg text-center">
                  USDC
                  <span className="block text-[9px] font-normal mt-1 opacity-70">Only Available</span>
                </div>
              </div>
            </div>

            {/* Amount Display */}
            <div className="py-8 border border-white/10 rounded-xl bg-white/5 text-center backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-5xl sm:text-6xl font-bold tabular-nums text-white tracking-tight">
                {isLoadingPrice ? (
                    <Loader2 className="w-12 h-12 animate-spin text-white/40" />
                ) : (
                  usdcAmount.toFixed(3)
                )}
              </div>
                <div className="text-[11px] sm:text-xs text-white/40 uppercase tracking-[0.25em] font-bold">
                  USDC on Solana
                </div>
              
              {/* Token Price Info */}
              {!isLoadingPrice && (
                <div className="text-xs text-white/50 font-light mt-2">
                  1 USDC = $1.00 USD
                </div>
              )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex justify-between items-baseline py-2">
                <span className="text-white/40 font-light uppercase text-xs tracking-wider">Price</span>
                <span className="text-white/80 font-medium">${amount.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-baseline py-2 border-t border-white/10 pt-3 mt-2">
                <span className="text-white/60 font-bold uppercase text-xs tracking-wider">Total Payment</span>
                <span className="text-white font-bold">
                  {usdcAmount.toFixed(3)} USDC
                </span>
              </div>
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                className="mt-3 w-full text-center text-[10px] uppercase tracking-[0.2em] text-white/40 hover:text-white/60 transition-colors flex items-center justify-center gap-2"
              >
                {showDetails ? 'Less details' : 'More details'}
                <span className="text-white/50 text-xs">
                  {showDetails ? '−' : '+'}
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-400 ease-out ${
                  showDetails ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="space-y-1 border-t border-white/10 pt-3 text-sm">
                  <div className="flex justify-between items-baseline py-2">
                    <span className="text-white/30 font-light uppercase text-[10px] tracking-wider">We Receive</span>
                    <span className="text-white/70 font-medium text-xs">
                      {usdcAmount.toFixed(3)} USDC
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline py-2">
                    <span className="text-white/30 font-light uppercase text-[10px] tracking-wider">Model</span>
                <span className="text-white/70 font-medium text-xs">{modelName}</span>
              </div>
                  <div className="flex justify-between items-baseline py-2">
                    <span className="text-white/30 font-light uppercase text-[10px] tracking-wider">Network</span>
                <span className="text-white/70 font-medium text-xs">Solana Mainnet</span>
              </div>
              {connected && publicKey && (
                    <div className="flex justify-between items-baseline py-2">
                      <span className="text-white/30 font-light uppercase text-[10px] tracking-wider">Wallet</span>
                      <span className="text-white/40 font-mono text-[10px] tracking-tight">
                    {publicKey.toBase58().substring(0, 8)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 6)}
                  </span>
                </div>
              )}
                </div>
              </div>
            </div>
          </div>

          {/* Success Message - Slide in when completed */}
          <div className={`transition-all duration-700 ${
            paymentStatus === 'completed' 
              ? 'opacity-100 translate-y-0 max-h-36 mb-6' 
              : 'opacity-0 translate-y-6 max-h-0 overflow-hidden pointer-events-none'
          }`}>
            <div className="py-6 border border-white/10 bg-white/5 rounded-xl text-center space-y-3">
              <p className="text-sm text-white/70 font-medium">
                Generating your content...
              </p>
              {transactionSignature && (
                <a 
                  href={`https://solscan.io/tx/${transactionSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-white/50 hover:text-white/80 font-mono transition-colors underline"
                >
                  View on Solscan →
                </a>
              )}
            </div>
          </div>

          {/* Error Message */}
          {paymentStatus === 'error' && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3">
              <div>
                <p className="font-bold text-red-400 text-xs uppercase tracking-wider">Payment Failed</p>
                <p className="text-xs text-red-300/80 mt-2">{errorMessage}</p>
              </div>
              <button
                onClick={() => {
                  setPaymentStatus('pending');
                  setErrorMessage('');
                }}
                className="w-full py-2.5 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold uppercase tracking-wider transition"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Action Button */}
          {!connected ? (
            <div className="text-center py-8 border-t border-white/10">
              <p className="text-sm text-white/60 mb-4 font-medium">Connect your wallet to proceed</p>
              <p className="text-xs text-white/40">Use the "Connect Wallet" button in the header</p>
            </div>
          ) : (
            <button
              onClick={(e) => {
                if (!e.currentTarget.disabled) {
                  handlePayment();
                }
              }}
              disabled={isLoadingPrice || paymentStatus === 'processing' || paymentStatus === 'completed'}
              className={`relative z-10 w-full px-7 py-4 text-xs sm:text-sm font-bold tracking-[0.15em] uppercase rounded-xl
                       flex items-center justify-center gap-3
                       transition-all duration-300 ease-out
                       pointer-events-auto
                       ${paymentStatus === 'completed'
                         ? 'bg-green-500 text-white cursor-default'
                         : paymentStatus === 'processing' || isLoadingPrice
                         ? 'bg-white/10 text-white/50 cursor-wait'
                         : paymentStatus === 'error'
                         ? 'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]'
                         : 'bg-white text-black hover:bg-white/90 active:scale-[0.98] cursor-pointer shadow-lg'
                       }`}
            >
              {isLoadingPrice ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : paymentStatus === 'processing' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing</span>
                </>
              ) : paymentStatus === 'completed' ? (
                <span>✓ Completed</span>
              ) : paymentStatus === 'error' ? (
                <span>Try Again</span>
              ) : (
                <span>Pay {usdcAmount.toFixed(3)} USDC</span>
              )}
            </button>
          )}

          {/* Footer */}
          <div className={`mt-6 pt-6 border-t border-white/10 transition-opacity duration-500 ${
            paymentStatus === 'pending' || paymentStatus === 'error' ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-[9px] text-center text-white/30 uppercase tracking-[0.25em] font-bold">
              Secured by Solana Network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


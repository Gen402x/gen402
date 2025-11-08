'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Plus, ArrowUpRight, Trash2 } from 'lucide-react';

import { imageModels, videoModels } from '@/lib/models';
import ResultDisplay from '@/components/ResultDisplay';
import GenerationProgress from '@/components/GenerationProgress';
import { sendUSDCPayment } from '@/lib/solana-payment';

type Chat = {
  id: string;
  owner_wallet: string;
  title: string | null;
  created_at: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
};

type PaymentRequestMetadata = {
  type: 'paymentRequest';
  amountUSD: number;
  modelId: string;
  modelName: string;
  generationId: string;
  prompt: string;
  generationType: 'image' | 'video';
  options?: any;
  chatId: string;
};

const defaultGenerationProgress = {
  elapsedTime: 0,
  status: 'pending' as 'pending' | 'processing' | 'completed',
  estimatedTime: 150,
};

const POLLING_MODELS = new Set(['sora-2', 'veo-3.1', 'gpt-image-1', 'ideogram', 'qwen']);

const getEstimatedTime = (modelId: string, options?: Record<string, any>) => {
  switch (modelId) {
    case 'gpt-image-1':
      return options?.filesUrl && options.filesUrl.length > 0 ? 150 : 120;
    case 'ideogram':
      return options?.renderingSpeed === 'QUALITY'
        ? 90
        : options?.renderingSpeed === 'TURBO'
        ? 30
        : 60;
    case 'qwen':
      return options?.acceleration === 'high'
        ? 25
        : options?.acceleration === 'regular'
        ? 35
        : 45;
    case 'veo-3.1':
      return options?.imageUrls && options.imageUrls.length > 0 ? 90 : 50;
    case 'sora-2':
      return options?.n_frames === '15' ? 240 : 150;
    default:
      return 150;
  }
};

export default function ChatDashboard() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const walletAddress = publicKey?.toBase58();

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [generationType, setGenerationType] = useState<'image' | 'video'>('image');
  const [selectedModel, setSelectedModel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(defaultGenerationProgress);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [payingGenerationId, setPayingGenerationId] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<{
    type: 'image' | 'video';
    url: string;
    urls?: string[];
    prompt: string;
    modelName: string;
  } | null>(null);

  // Model settings
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [nFrames, setNFrames] = useState<'10' | '15'>('10');
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [image4oSize, setImage4oSize] = useState<'1:1' | '3:2' | '2:3'>('1:1');
  const [image4oVariants, setImage4oVariants] = useState<1 | 2 | 4>(1);
  const [ideogramImageSize, setIdeogramImageSize] = useState<'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'>('square_hd');
  const [ideogramRenderingSpeed, setIdeogramRenderingSpeed] = useState<'TURBO' | 'BALANCED' | 'QUALITY'>('BALANCED');
  const [ideogramStyle, setIdeogramStyle] = useState<'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN'>('AUTO');
  const [qwenImageSize, setQwenImageSize] = useState<'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'>('square_hd');
  const [qwenNumInferenceSteps, setQwenNumInferenceSteps] = useState(30);
  const [qwenGuidanceScale, setQwenGuidanceScale] = useState(2.5);
  const [qwenAcceleration, setQwenAcceleration] = useState<'none' | 'regular' | 'high'>('none');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const paymentStatusByGenerationId = useMemo(() => {
    const statusMap = new Map<string, string>();
    messages.forEach((message) => {
      const metadata = message.metadata as Record<string, any> | null;
      if (
        metadata?.type === 'paymentStatus' &&
        typeof metadata.generationId === 'string' &&
        typeof metadata.status === 'string'
      ) {
        statusMap.set(metadata.generationId, metadata.status);
      }
    });
    return statusMap;
  }, [messages]);

  const currentModels = useMemo(
    () => (generationType === 'image' ? imageModels : videoModels),
    [generationType]
  );

  const activeModel = useMemo(
    () => currentModels.find((model) => model.id === selectedModel) || null,
    [currentModels, selectedModel]
  );

  const modelMenuRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchChats = useCallback(async () => {
    if (!walletAddress) return;
    setLoadingChats(true);
    try {
      const res = await fetch(`/api/chats?wallet=${walletAddress}`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setChats(data.chats || []);
      if (!activeChatId && data.chats?.length) {
        setActiveChatId(data.chats[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, [walletAddress, activeChatId]);

  const fetchMessages = useCallback(async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (!walletAddress) {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
      return;
    }
    fetchChats();
  }, [walletAddress, fetchChats]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId, fetchMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!modelMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(event.target as Node)) {
        setModelMenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [modelMenuOpen]);

  const createChat = useCallback(async () => {
    if (!walletAddress) return null;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const newChat: Chat = data.chat;
      setChats((prev) => [newChat, ...prev]);
      setActiveChatId(newChat.id);
      return newChat.id;
    } catch (error) {
      console.error('Failed to create chat:', error);
      return null;
    }
  }, [walletAddress]);

  const appendMessage = useCallback(
    async (chatId: string, message: { role: 'user' | 'assistant' | 'system'; content?: string | null; metadata?: Record<string, any> | null; }) => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();
        const saved: ChatMessage = data.message;
        setMessages((prev) => [...prev, saved]);
        return saved;
      } catch (error) {
        console.error('Failed to append message:', error);
        return null;
      }
    },
    []
  );

  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    if (!title.trim()) return;
    try {
      const res = await fetch('/api/chats', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: chatId, title }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const updated: Chat = data.chat;
      setChats((prev) => prev.map((chat) => (chat.id === chatId ? updated : chat)));
    } catch (error) {
      console.error('Failed to update chat title:', error);
    }
  }, []);

  const deleteChat = useCallback(
    async (chatId: string) => {
      if (!chatId || !walletAddress) return;

      try {
        const params = new URLSearchParams({ id: chatId, wallet: walletAddress });
        const res = await fetch(`/api/chats?${params.toString()}`, {
          method: 'DELETE',
          cache: 'no-store',
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Delete request failed');
        }

        const responseData = await res.json();
        if (!responseData?.success) {
          throw new Error(responseData?.error || 'Delete response missing success flag');
        }

        let nextActiveId: string | null = null;

        setChats((prev) => {
          const updated = prev.filter((chat) => chat.id !== chatId);
          if (chatId === activeChatId) {
            nextActiveId = updated.length ? updated[0].id : null;
          }
          return updated;
        });

        if (chatId === activeChatId) {
          if (nextActiveId) {
            setActiveChatId(nextActiveId);
          } else {
            setActiveChatId(null);
            setMessages([]);
          }
        }

        await fetchChats();
      } catch (error) {
        console.error('Failed to delete chat:', error);
        alert('Could not delete chat. See console for details.');
      }
    },
    [activeChatId, fetchChats, walletAddress]
  );

  const ensureActiveChat = useCallback(async () => {
    if (activeChatId) return activeChatId;
    const newChatId = await createChat();
    return newChatId;
  }, [activeChatId, createChat]);

  const addStatusMessage = useCallback(
    (chatId: string, status: 'pending' | 'processing' | 'completed' | 'error', details?: Record<string, any>) =>
      appendMessage(chatId, {
        role: 'system',
        content: status === 'error' ? details?.errorMessage || 'Generation failed' : null,
        metadata: {
          type: 'status',
          status,
          ...(details || {}),
        },
      }),
    [appendMessage]
  );

  const handleGenerationSuccess = useCallback(async (data: any, context: {
    prompt: string;
    model: typeof imageModels[number] | typeof videoModels[number];
    chatId: string;
    options?: any;
  }) => {
    const { prompt, model, chatId } = context;

    const resultPayload = {
      type: generationType,
      url: data.result,
      urls: data.resultUrls,
      prompt,
      modelName: model.name,
    } as const;

    await appendMessage(chatId, {
      role: 'assistant',
      content: null,
      metadata: {
        type: 'generation',
        modelId: model.id,
        modelName: model.name,
        generationType,
        prompt,
        result: data.result,
        resultUrls: data.resultUrls,
        transactionSignature: data.signature || null,
      },
    });

    setGenerationProgress((prev) => ({ ...prev, status: 'completed' }));

    return resultPayload;
  }, [appendMessage, generationType]);

  const startPolling = useCallback(async ({
    taskId,
    model,
    prompt,
    chatId,
    options,
    userWallet,
    paymentMethod,
    amountPaidUSD,
  }: {
    taskId: string;
    model: typeof imageModels[number] | typeof videoModels[number];
    prompt: string;
    chatId: string;
    options?: any;
    userWallet?: string;
    paymentMethod?: 'payper' | 'usdc';
    amountPaidUSD?: number;
  }) => {
    return new Promise<void>((resolve) => {
      const estimatedTime = getEstimatedTime(model.id, options);
      setGenerationProgress({ elapsedTime: 0, status: 'processing', estimatedTime });

      const startTime = Date.now();
      const timeInterval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setGenerationProgress((prev) => ({ ...prev, elapsedTime: elapsed }));
      }, 1000);

      const cleanup = (action?: () => void) => {
        window.clearInterval(timeInterval);
        window.clearInterval(pollInterval);
        window.clearTimeout(timeoutId);
        action?.();
        resolve();
      };

      const poll = async () => {
        try {
          // Add payment info to poll request so backend can refund if needed
          const pollUrl = `/api/generate/${taskId}?model=${model.id}`;
          const resultResponse = await axios.get(pollUrl, {
            headers: {
              'X-User-Wallet': userWallet || walletAddress || '',
              'X-Payment-Method': paymentMethod || 'payper',
              'X-Amount-Paid': amountPaidUSD != null ? amountPaidUSD.toString() : '',
            }
          });
          const state = resultResponse.data.state;

          if (resultResponse.data.success && state === 'completed') {
            cleanup(async () => {
              setGenerationProgress({ elapsedTime: 0, status: 'completed', estimatedTime: 0 });
              const outcome = await handleGenerationSuccess(resultResponse.data, {
                prompt,
                model,
                chatId,
                options,
              });
              if (outcome) {
                setLatestResult(outcome);
              }
              setIsGenerating(false);
            });
          } else if (state === 'failed') {
            cleanup(async () => {
              setGenerationProgress({ elapsedTime: 0, status: 'completed', estimatedTime: 0 });
              const errorMsg = resultResponse.data.errorMessage || resultResponse.data.message || resultResponse.data.failMsg || resultResponse.data.error;
              const isRefunded = resultResponse.data.refunded;
              const refundSignature = resultResponse.data.refundSignature;
              const refundAmount = resultResponse.data.refundAmount;
              const refundToken = resultResponse.data.refundToken;
              
              let detailedError = errorMsg 
                ? `${errorMsg}` 
                : 'The AI service encountered an error. This can happen due to content filters, server issues, or invalid prompts. Please try again with a different prompt or model.';
              
              // Add refund info to error message if refund was successful
              if (isRefunded && refundSignature) {
                detailedError += `\n\nYour payment of ${refundAmount?.toFixed(3)} USD has been automatically refunded in ${refundToken}.`;
              }
              
              await addStatusMessage(chatId, 'error', {
                errorMessage: detailedError,
                modelId: model.id,
                modelName: model.name,
                prompt: prompt,
                refunded: isRefunded,
                refundSignature: refundSignature,
                refundAmount: refundAmount,
                refundToken: refundToken,
              });
              setIsGenerating(false);
            });
          }
        } catch (error: any) {
          console.error('Polling error:', error);

          const errorData = error?.response?.data || {};
          const errorState = errorData.state;
          const errorMsg = errorData.errorMessage || errorData.message || errorData.error || '';
          const isFlagged = typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('flagged');

          if (errorState === 'failed' || isFlagged) {
            cleanup(async () => {
              setGenerationProgress({ elapsedTime: 0, status: 'completed', estimatedTime: 0 });

              const isRefunded = errorData.refunded;
              const refundSignature = errorData.refundSignature;
              const refundAmount = errorData.refundAmount;
              const refundToken = errorData.refundToken;

              let detailedError = errorMsg || 'Generation failed.';
              if (isRefunded && refundSignature) {
                detailedError += `\n\nYour payment of ${refundAmount?.toFixed(3)} USD has been automatically refunded in ${refundToken}.`;
              }

              await addStatusMessage(chatId, 'error', {
                errorMessage: detailedError,
                modelId: model.id,
                modelName: model.name,
                prompt: prompt,
                refunded: isRefunded,
                refundSignature: refundSignature,
                refundAmount: refundAmount,
                refundToken: refundToken,
              });
              setIsGenerating(false);
            });
          }
        }
      };

      const pollInterval = window.setInterval(poll, 5000);
      const timeoutId = window.setTimeout(() => {
        cleanup(async () => {
          await addStatusMessage(chatId, 'error', {
            errorMessage: 'Generation timed out after 5 minutes. The AI service may be overloaded. Please try again in a few moments.',
            modelId: model.id,
            modelName: model.name,
            prompt: prompt,
          });
          setIsGenerating(false);
        });
      }, 5 * 60 * 1000);

      poll();
    });
  }, [addStatusMessage, handleGenerationSuccess, walletAddress]);

  const handleShare = useCallback(async (url: string, urls?: string[]) => {
    // If multiple images, copy first one
    const shareUrl = urls && urls.length > 0 ? urls[0] : url;
    
    try {
      if (navigator.share && urls && urls.length > 1) {
        // Native share API for multiple files (if supported)
        await navigator.share({
          title: 'Generated Images',
          text: `Check out these ${urls.length} images!`,
          url: shareUrl
        });
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Final fallback: just copy URL
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('URL copied to clipboard!');
      } catch (clipboardError) {
        alert('Could not share. URL: ' + shareUrl);
      }
    }
  }, []);

  const handleGenerate = useCallback(async (chatId: string, promptText: string, options?: any) => {
    if (!selectedModel) {
      alert('Please select a model');
      return;
    }

    const model = currentModels.find((m) => m.id === selectedModel);
    if (!model) {
      alert('Selected model not found');
      return;
    }

    if (!connected || !walletAddress) {
      alert('Please connect your wallet first to generate');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(defaultGenerationProgress);

    await addStatusMessage(chatId, 'pending', {
      modelId: model.id,
      modelName: model.name,
      generationType,
      prompt: promptText,
    });

    try {
      const response = await axios.post('/api/generate', {
        model: selectedModel,
        prompt: promptText,
        type: generationType,
        options,
      });

      if (response?.data?.success) {
        const needsPolling = POLLING_MODELS.has(model.id) && response.data.taskId;

        if (needsPolling) {
          await addStatusMessage(chatId, 'processing', {
            modelId: model.id,
            modelName: model.name,
            generationType,
            prompt: promptText,
          });

          await startPolling({
            taskId: response.data.taskId,
            model,
            prompt: promptText,
            chatId,
            options,
            userWallet: walletAddress,
            paymentMethod: 'usdc',
          });
        } else {
          setGenerationProgress((prev) => ({ ...prev, status: 'processing' }));

          const resultData = await handleGenerationSuccess(response.data, {
            prompt: promptText,
            model,
            chatId,
            options,
          });

          if (resultData) {
            setLatestResult(resultData);
          }
        }
      }
    } catch (error: any) {
      if (error?.response?.status === 402 || error?.response?.data?.paymentRequired) {
        const data = error.response.data;

        await appendMessage(chatId, {
          role: 'system',
          metadata: {
            type: 'paymentRequest',
            amountUSD: data.amount,
            modelId: model.id,
            modelName: model.name,
            generationId: data.generationId,
            prompt: promptText,
            generationType,
            options,
            chatId,
          },
        });
      } else {
        console.error('Generation error:', error);
        const errorMsg = error?.response?.data?.message || error?.message || 'Unknown error';
        const userFriendlyError = error?.response?.status === 500 
          ? 'Server error. The AI service is temporarily unavailable. Please try again.'
          : error?.response?.status === 429
          ? 'Rate limit exceeded. Please wait a moment before trying again.'
          : errorMsg.includes('Network') || errorMsg.includes('fetch')
          ? 'Network error. Please check your internet connection and try again.'
          : errorMsg;
        
        await addStatusMessage(chatId, 'error', { 
          errorMessage: userFriendlyError,
          modelId: selectedModel,
          prompt: prompt.trim(),
        });
      }
    } finally {
      setIsGenerating(false);
    }
  }, [selectedModel, generationType, connected, walletAddress, currentModels, addStatusMessage, startPolling]);

  const completeGenerationAfterPayment = useCallback(async (
    metadata: {
      amountUSD: number;
      modelId: string;
      prompt: string;
      generationType: 'image' | 'video';
      options?: any;
      chatId: string;
      generationId?: string;
    },
    signature: string
  ) => {
    const model = [...imageModels, ...videoModels].find((m) => m.id === metadata.modelId);
    if (!model) {
      console.error('Model not found for payment completion:', metadata.modelId);
      return;
    }

    try {
      setIsGenerating(true);
      setGenerationProgress(defaultGenerationProgress);

      // Always use USDC payment
      const amountPaidUSD = metadata.amountUSD;

      console.log('📤 Sending to API - Amount:', amountPaidUSD, 'USDC');
      console.log('🔑 Payment Signature:', signature);
      console.log('👛 User Wallet:', walletAddress);
      console.log('🎨 Model:', model.id);
      
      const requestBody = {
        model: model.id,
        prompt: metadata.prompt,
        type: metadata.generationType,
        options: metadata.options || {},
        paymentSignature: signature,
        userWallet: walletAddress,
        paymentMethod: 'usdc',
        amountPaidUSD,
      };
      
      console.log('📦 Full request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await axios.post('/api/generate', requestBody);

      if (response?.data?.success) {
        const needsPolling = POLLING_MODELS.has(model.id) && response.data.taskId;

        if (needsPolling) {
          await startPolling({
            taskId: response.data.taskId,
            model,
            prompt: metadata.prompt,
            chatId: metadata.chatId,
            options: metadata.options,
            userWallet: walletAddress,
            paymentMethod: 'usdc',
            amountPaidUSD,
          });
        } else {
          const resultData = await handleGenerationSuccess(response.data, {
            prompt: metadata.prompt,
            model,
            chatId: metadata.chatId,
            options: metadata.options,
          });

          if (resultData) {
            setLatestResult(resultData);
          }
        }
      } else {
        await addStatusMessage(metadata.chatId, 'error', {
          errorMessage: response?.data?.message || 'Could not start generation after payment.',
        });
      }
    } catch (error) {
      console.error('Could not complete generation after payment:', error);
      await addStatusMessage(metadata.chatId, 'error', {
        errorMessage: 'Generation failed after payment. Please contact support with your transaction signature.',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [addStatusMessage, handleGenerationSuccess, startPolling, walletAddress]);

  const handlePaymentAction = useCallback(async (metadata: PaymentRequestMetadata) => {
    if (!connected || !publicKey) {
      alert('Connect your wallet before completing the payment.');
      return;
    }

    if (!connection) {
      alert('Solana connection unavailable. Please try again.');
      return;
    }

    if (!signTransaction) {
      alert('Your wallet does not support direct signing.');
      return;
    }

    // Always use USDC payment
    const actualAmount = metadata.amountUSD;

    console.log('🔍 Generation ID:', metadata.generationId);
    console.log('💵 Payment Amount:', actualAmount, 'USDC');

    setPayingGenerationId(metadata.generationId);

    await appendMessage(metadata.chatId, {
      role: 'system',
      metadata: {
        type: 'paymentStatus',
        status: 'processing',
        generationId: metadata.generationId,
        amountUSD: actualAmount,
        paymentMethod: 'usdc',
      },
    });

    try {
      // Use USDC payment
      const { sendDirectUSDCPayment } = await import('@/lib/usdc-payment');
      const result = await sendDirectUSDCPayment(connection, publicKey, signTransaction, actualAmount);

      if (!result.success || !result.signature) {
        await appendMessage(metadata.chatId, {
          role: 'system',
          metadata: {
            type: 'paymentStatus',
            status: 'error',
            generationId: metadata.generationId,
            errorMessage: result.error || 'Payment failed. Please try again.',
          },
        });
        return;
      }

      await appendMessage(metadata.chatId, {
        role: 'system',
        metadata: {
          type: 'paymentStatus',
          status: 'completed',
          generationId: metadata.generationId,
          transactionSignature: result.signature,
        },
      });

      await addStatusMessage(metadata.chatId, 'processing', {
        modelId: metadata.modelId,
        modelName: metadata.modelName,
        generationType: metadata.generationType,
        prompt: metadata.prompt,
      });

      await completeGenerationAfterPayment({
        ...metadata,
        generationId: metadata.generationId,
      }, result.signature);
    } catch (error: any) {
      console.error('Payment processing error:', error);
      await appendMessage(metadata.chatId, {
        role: 'system',
        metadata: {
          type: 'paymentStatus',
          status: 'error',
          generationId: metadata.generationId,
          errorMessage: error?.message || 'Unexpected payment error. Please try again.',
        },
      });
    } finally {
      setPayingGenerationId(null);
    }
  }, [appendMessage, completeGenerationAfterPayment, connection, connected, publicKey, signTransaction, isGenerating, addStatusMessage]);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) return;

    const chatId = await ensureActiveChat();
    if (!chatId) return;

    const userMessage = await appendMessage(chatId, {
      role: 'user',
      content: prompt.trim(),
      metadata: {
        type: 'prompt',
        generationType,
        modelId: selectedModel,
      },
    });

    if (userMessage && !chats.find((chat) => chat.id === chatId)?.title) {
      updateChatTitle(chatId, prompt.trim().slice(0, 64));
    }

    setPrompt('');

    if (selectedModel) {
      // Build options based on selected model
      const options: any = {};
      
      if (selectedModel === 'sora-2') {
        options.aspect_ratio = aspectRatio;
        options.n_frames = nFrames;
        options.remove_watermark = true;
      } else if (selectedModel === 'veo-3.1') {
        options.aspectRatio = veoAspectRatio;
      } else if (selectedModel === 'gpt-image-1') {
        options.size = image4oSize;
        options.nVariants = image4oVariants;
      } else if (selectedModel === 'ideogram') {
        options.image_size = ideogramImageSize;
        options.rendering_speed = ideogramRenderingSpeed;
        options.style = ideogramStyle;
      } else if (selectedModel === 'qwen') {
        options.image_size = qwenImageSize;
        options.num_inference_steps = qwenNumInferenceSteps;
        options.guidance_scale = qwenGuidanceScale;
        options.acceleration = qwenAcceleration;
      }
      
      await handleGenerate(chatId, userMessage?.content || prompt.trim(), options);
    }
  }, [
    prompt, 
    ensureActiveChat, 
    appendMessage, 
    generationType, 
    selectedModel, 
    handleGenerate, 
    chats, 
    updateChatTitle,
    aspectRatio,
    nFrames,
    veoAspectRatio,
    image4oSize,
    image4oVariants,
    ideogramImageSize,
    ideogramRenderingSpeed,
    ideogramStyle,
    qwenImageSize,
    qwenNumInferenceSteps,
    qwenGuidanceScale,
    qwenAcceleration
  ]);

  const renderMessageContent = (message: ChatMessage) => {
    if (message.role === 'user') {
      return (
        <div className="bg-white text-black text-sm px-5 py-3 rounded-xl max-w-xl whitespace-pre-wrap font-medium">
          {message.content}
        </div>
      );
    }

    const metadata = message.metadata || {};

    if (metadata.type === 'generation') {
      return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <ResultDisplay
            type={metadata.generationType || generationType}
            url={metadata.result}
            urls={metadata.resultUrls}
            prompt={metadata.prompt || ''}
            modelName={metadata.modelName || ''}
            onShare={() => handleShare(metadata.result, metadata.resultUrls)}
          />
          {metadata.transactionSignature && (
            <a
              href={`https://solscan.io/tx/${metadata.transactionSignature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs text-forge-orange hover:text-forge-amber transition"
            >
              View on Solscan
              <ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      );
    }

    if (metadata.type === 'paymentRequest') {
      const request = metadata as PaymentRequestMetadata;
      
      const paying = payingGenerationId === request.generationId || isGenerating;
      const paymentStatus = paymentStatusByGenerationId.get(request.generationId);
      const isCompleted = paymentStatus === 'completed';
      const isProcessingStatus = paymentStatus === 'processing';
      const isErrored = paymentStatus === 'error';
      const isDisabled = isCompleted || isProcessingStatus || paying || isGenerating;
      
      // Calculate USDC amount (always use USDC)
      const baseAmount = request.amountUSD ?? 0;
      const usdcDisplayAmount = baseAmount;
      
      const buttonLabel = isCompleted
        ? 'Payment successful'
        : isProcessingStatus || paying
        ? 'Processing…'
        : isErrored
        ? 'Try again'
        : `Pay $${usdcDisplayAmount.toFixed(3)} USDC`;
      const buttonClass = isCompleted
        ? 'bg-forge-orange text-white cursor-default'
        : isProcessingStatus || paying || isGenerating
        ? 'bg-white/10 text-white/30 cursor-not-allowed'
        : 'bg-white text-black hover:bg-white/90 font-bold';
      // Format options for display
      const formatOptions = (opts: any) => {
        if (!opts) return null;
        const lines = [];
        
        // Aspect ratio
        if (opts.aspect_ratio) lines.push(`Aspect: ${opts.aspect_ratio === 'landscape' ? '16:9' : '9:16'}`);
        if (opts.aspectRatio) lines.push(`Aspect: ${opts.aspectRatio}`);
        
        // Duration
        if (opts.n_frames) lines.push(`Duration: ${opts.n_frames === '10' ? '5s' : '10s'}`);
        
        // Size
        if (opts.size) lines.push(`Size: ${opts.size}`);
        if (opts.image_size) lines.push(`Size: ${opts.image_size.replace(/_/g, ' ')}`);
        
        // Variants
        if (opts.nVariants) lines.push(`Variants: ${opts.nVariants}x`);
        if (opts.n) lines.push(`Variants: ${opts.n}x`);
        
        // Ideogram specific
        if (opts.rendering_speed) lines.push(`Speed: ${opts.rendering_speed}`);
        if (opts.style) lines.push(`Style: ${opts.style}`);
        
        // Qwen specific
        if (opts.num_inference_steps) lines.push(`Steps: ${opts.num_inference_steps}`);
        if (opts.guidance_scale) lines.push(`Guidance: ${opts.guidance_scale}`);
        if (opts.acceleration && opts.acceleration !== 'none') lines.push(`Acceleration: ${opts.acceleration}`);
        
        return lines.length > 0 ? lines : null;
      };

      const optionsDisplay = formatOptions(request.options);

      return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-lg space-y-4">
          <div className="space-y-3">
            <p className="text-sm font-bold text-white">Payment Required</p>
            <div className="text-xs text-white/60 space-y-2">
              <p><span className="text-white/80 font-semibold">Model:</span> {request.modelName}</p>
              {optionsDisplay && (
                <div className="pt-2 border-t border-white/10 mt-2">
                  <p className="text-white/80 font-semibold mb-2">Settings:</p>
                  <div className="pl-3 space-y-1">
                    {optionsDisplay.map((line, i) => (
                      <p key={i} className="text-[11px]">• {line}</p>
                    ))}
                  </div>
                </div>
              )}
              <p className="line-clamp-2 pt-2"><span className="text-white/80 font-semibold">Prompt:</span> {request.prompt}</p>
            </div>
          </div>

          {/* Payment with USDC */}
          {!isCompleted && (
            <div className="space-y-2">
              <p className="text-[10px] text-center text-white/50">
                Payment: <span className="font-bold text-white">${usdcDisplayAmount.toFixed(3)} USDC</span>
              </p>
            </div>
          )}

          <button
            onClick={() => handlePaymentAction(request)}
            disabled={isDisabled}
            className={`w-full inline-flex items-center justify-center px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${buttonClass}`}
          >
            {buttonLabel}
          </button>
          {isCompleted && (
            <p className="text-[11px] text-white/40 text-center">Payment confirmed for this generation</p>
          )}
        </div>
      );
    }

    if (metadata.type === 'paymentStatus') {
      if (metadata.status === 'processing') {
        return (
          <div className="bg-white/5 border border-white/10 text-xs text-white/60 px-5 py-3 rounded-xl max-w-lg">
            Processing payment on Solana...
          </div>
        );
      }

      if (metadata.status === 'completed') {
        return (
          <div className="bg-white/5 border border-white/10 text-xs text-white/70 px-5 py-3 rounded-xl max-w-lg space-y-2">
            <p className="font-bold text-white">Payment Confirmed</p>
            <p className="text-white/60">Generation starting automatically. Buyback queued.</p>
            {metadata.transactionSignature && (
              <a
                href={`https://solscan.io/tx/${metadata.transactionSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-forge-orange hover:text-forge-amber transition"
              >
                View on Solscan
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>
        );
      }

      if (metadata.status === 'error') {
        return (
          <div className="bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-xl max-w-lg">
            <p className="font-bold text-red-400 text-xs">Payment Failed</p>
            <p className="text-[11px] text-red-300/80 mt-1">
              {metadata.errorMessage || 'Payment could not be completed. Please try again.'}
            </p>
          </div>
        );
      }
    }

    if (metadata.type === 'status') {
      if (metadata.status === 'processing') {
        // Tjek om der allerede er et result for denne generation
        const hasResult = messages.some(msg => 
          msg.metadata?.type === 'generation' && 
          msg.metadata?.prompt === metadata.prompt &&
          msg.created_at > message.created_at
        );
        
        // Tjek om der er en fejl for denne generation
        const hasError = messages.some(msg =>
          msg.metadata?.type === 'status' &&
          msg.metadata?.status === 'error' &&
          msg.metadata?.prompt === metadata.prompt &&
          msg.created_at > message.created_at
        );
        
        // Vis ikke processing hvis resultatet eller fejl allerede er kommet
        if (hasResult || hasError) {
          return null;
        }
        
        return (
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-lg">
            <GenerationProgress
              status="processing"
              elapsedTime={generationProgress.elapsedTime}
              estimatedTotal={generationProgress.estimatedTime}
              type={metadata.generationType || generationType}
            />
          </div>
        );
      }

      if (metadata.status === 'error') {
        const isRefunded = metadata.refunded === true;
        const refundSignature = metadata.refundSignature;
        const errorMsg = metadata.errorMessage || 'Something went wrong. Please try again.';
        
        // Check if it's a content policy violation based on error message
        const isContentPolicyViolation = errorMsg.toLowerCase().includes('content') && 
                                        errorMsg.toLowerCase().includes('polic');
        
        return (
          <div className={`${isRefunded ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20'} border text-sm px-5 py-3 rounded-xl max-w-lg space-y-3`}>
            <div>
              <p className={`font-bold ${isRefunded ? 'text-orange-400' : 'text-red-400'}`}>
                {isContentPolicyViolation ? 'Content Policy Violation' : 'Generation Failed'}
                {isRefunded && ' - Refunded'}
              </p>
              <p className={`text-xs ${isRefunded ? 'text-orange-300/80' : 'text-red-300/80'} mt-1 whitespace-pre-wrap`}>
                {errorMsg}
              </p>
              {isRefunded && refundSignature && (
                <a
                  href={`https://solscan.io/tx/${refundSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition mt-2"
                >
                  View refund transaction
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              )}
            </div>
            {metadata.prompt && (
              <button
                onClick={() => {
                  setPrompt(metadata.prompt);
                  if (metadata.modelId) {
                    setSelectedModel(metadata.modelId);
                  }
                }}
                className={`w-full py-2 px-3 ${isRefunded ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300' : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'} rounded-lg text-xs font-semibold transition`}
              >
                Try Again with Different Prompt
              </button>
            )}
          </div>
        );
      }

      if (metadata.status === 'pending') {
        return (
          <div className="bg-white/5 border border-white/10 text-xs text-white/60 px-5 py-3 rounded-xl max-w-lg space-y-1">
            <p className="font-bold text-white">Generation Queued</p>
            <p>
              Model: {metadata.modelName || metadata.modelId} · {metadata.generationType || generationType}
            </p>
            {metadata.prompt && <p className="text-white/40 line-clamp-2">Prompt: {metadata.prompt}</p>}
          </div>
        );
      }
    }

    if (typeof message.content === 'string' && message.content.trim().length > 0) {
      return (
        <div className="bg-black/5 border border-black/10 text-sm text-black px-4 py-3 rounded-2xl max-w-lg whitespace-pre-wrap">
          {message.content}
        </div>
      );
    }

    return null;
  };

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center gap-6">
        <p className="text-lg text-white/60 max-w-xl">
          Connect your Solana wallet to access AI Studio and start generating with premium AI models.
        </p>
        <WalletMultiButton className="!bg-white !text-black hover:!bg-white/90 !text-base !font-bold !py-4 !px-8 !rounded-full transition" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col">
      {/* Top Chat Bar */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-xs text-white/50 font-mono whitespace-nowrap">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
                {loadingChats ? (
                  <div className="text-xs text-white/40">Loading...</div>
                ) : chats.length === 0 ? (
                  <div className="text-xs text-white/30">No generations yet</div>
                ) : (
                  chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${
                        chat.id === activeChatId
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      <span className="font-medium">{chat.title || 'Untitled'}</span>
                      {chat.id === activeChatId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="hover:text-red-400 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
            <button
              onClick={createChat}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg text-xs font-bold text-white transition whitespace-nowrap"
            >
              <Plus className="w-3 h-3" />
              New Chat
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {loadingMessages ? (
            <div className="text-sm text-white/40 text-center">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center py-20">
              <div className="text-center space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="text-base font-semibold text-white mb-1">Ready to Generate</div>
                  <div className="text-sm text-white/40">Select a model and describe what you want to create</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => {
                const bubble = renderMessageContent(message);
                if (!bubble) return null;
                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {bubble}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="border-t border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="space-y-3">
            {/* Type Tabs & Model Selector - Compact Top Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                  {(['image', 'video'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setGenerationType(type);
                        setSelectedModel('');
                        setSettingsOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                        generationType === type ? 'bg-white text-black' : 'text-white/60 hover:text-white/90'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="relative" ref={modelMenuRef}>
                  <button
                    type="button"
                    onClick={() => setModelMenuOpen((prev) => !prev)}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 border border-white/20 bg-white/5 rounded-lg px-3 py-1.5 text-xs transition ${
                      isGenerating ? 'text-white/30 cursor-not-allowed' : 'hover:border-white/40 hover:bg-white/10'
                    }`}
                  >
                    {activeModel ? (
                      <>
                        <span className="font-semibold text-white">{activeModel.name}</span>
                        <span className="text-white/50 text-[10px]">${activeModel.price.toFixed(3)}</span>
                      </>
                    ) : (
                      <span className="text-white/40">Select Model</span>
                    )}
                    <svg
                      className={`w-3 h-3 text-white/40 transition-transform ${modelMenuOpen ? 'rotate-180' : ''}`}
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {modelMenuOpen && (
                    <div className="absolute left-0 right-auto bottom-full mb-2 w-80 bg-black border border-white/20 shadow-2xl rounded-xl overflow-hidden z-20">
                      <div className="max-h-64 overflow-y-auto">
                        {currentModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setModelMenuOpen(false);
                              setSettingsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 transition flex flex-col gap-1 ${
                              selectedModel === model.id ? 'bg-white/10 text-white border-l-2 border-white' : 'hover:bg-white/5 text-white/80'
                            }`}
                          >
                            <span className="text-sm font-semibold">{model.name}</span>
                            <span className={`text-xs ${selectedModel === model.id ? 'text-white/70' : 'text-white/50'}`}>
                              ${model.price.toFixed(3)} · {model.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || !selectedModel || isGenerating}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  !prompt.trim() || !selectedModel || isGenerating
                    ? 'bg-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-white/90'
                }`}
              >
                Generate
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to generate..."
              rows={2}
              className="w-full resize-none bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition"
              disabled={isGenerating}
            />

            <div className="flex flex-col gap-2">

              {/* Model Settings - Collapsible */}
              {selectedModel && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className="flex items-center gap-2 text-[10px] font-bold text-white/50 hover:text-white/80 uppercase tracking-wider transition"
                  >
                    <svg
                      className={`w-3 h-3 transition-transform ${settingsOpen ? 'rotate-90' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                    Advanced Settings
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${settingsOpen ? 'max-h-[800px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                    <div className="space-y-4 px-2 pb-1">
                  {/* Sora 2 Settings */}
                  {selectedModel === 'sora-2' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAspectRatio('landscape')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              aspectRatio === 'landscape'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            16:9 Landscape
                          </button>
                          <button
                            type="button"
                            onClick={() => setAspectRatio('portrait')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              aspectRatio === 'portrait'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            9:16 Portrait
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Duration</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setNFrames('10')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              nFrames === '10'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            5 seconds
                          </button>
                          <button
                            type="button"
                            onClick={() => setNFrames('15')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              nFrames === '15'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            10 seconds
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Veo 3.1 Settings */}
                  {selectedModel === 'veo-3.1' && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Aspect Ratio</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVeoAspectRatio('16:9')}
                          disabled={isGenerating}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                            veoAspectRatio === '16:9'
                              ? 'bg-white text-black shadow-sm'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          16:9 Landscape
                        </button>
                        <button
                          type="button"
                          onClick={() => setVeoAspectRatio('9:16')}
                          disabled={isGenerating}
                          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                            veoAspectRatio === '9:16'
                              ? 'bg-white text-black shadow-sm'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          9:16 Portrait
                        </button>
                      </div>
                    </div>
                  )}

                  {/* GPT Image Settings */}
                  {selectedModel === 'gpt-image-1' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setImage4oSize('1:1')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              image4oSize === '1:1'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            1:1
                          </button>
                          <button
                            type="button"
                            onClick={() => setImage4oSize('3:2')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              image4oSize === '3:2'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            3:2
                          </button>
                          <button
                            type="button"
                            onClick={() => setImage4oSize('2:3')}
                            disabled={isGenerating}
                            className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                              image4oSize === '2:3'
                                ? 'bg-white text-black shadow-sm'
                                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                            }`}
                          >
                            2:3
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Variants</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 4].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setImage4oVariants(n as 1 | 2 | 4)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                image4oVariants === n
                                  ? 'bg-black text-white shadow-sm'
                                  : 'bg-black/5 text-black/60 hover:bg-black/10'
                              }`}
                            >
                              {n}x
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ideogram Settings */}
                  {selectedModel === 'ideogram' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Size</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'square_hd', label: 'Square HD' },
                            { value: 'portrait_4_3', label: '4:3 Portrait' },
                            { value: 'landscape_4_3', label: '4:3 Land' },
                            { value: 'landscape_16_9', label: '16:9 Land' }
                          ].map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setIdeogramImageSize(value as any)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                ideogramImageSize === value
                                  ? 'bg-white text-black shadow-sm'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Rendering Speed</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['TURBO', 'BALANCED', 'QUALITY'].map((speed) => (
                            <button
                              key={speed}
                              type="button"
                              onClick={() => setIdeogramRenderingSpeed(speed as any)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                ideogramRenderingSpeed === speed
                                  ? 'bg-white text-black shadow-sm'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {speed}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Style</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['AUTO', 'GENERAL', 'REALISTIC', 'DESIGN'].map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setIdeogramStyle(style as any)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                ideogramStyle === style
                                  ? 'bg-white text-black shadow-sm'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Qwen Settings */}
                  {selectedModel === 'qwen' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Size</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { value: 'square_hd', label: 'Square HD' },
                            { value: 'portrait_4_3', label: '4:3 Portrait' },
                            { value: 'landscape_4_3', label: '4:3 Land' },
                            { value: 'landscape_16_9', label: '16:9 Land' }
                          ].map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setQwenImageSize(value as any)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                                qwenImageSize === value
                                  ? 'bg-white text-black shadow-sm'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Inference Steps: {qwenNumInferenceSteps}</label>
                        <input
                          type="range"
                          min="20"
                          max="50"
                          step="5"
                          value={qwenNumInferenceSteps}
                          onChange={(e) => setQwenNumInferenceSteps(Number(e.target.value))}
                          disabled={isGenerating}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-[10px] text-white/40 mt-1">
                          <span>Faster</span>
                          <span>Better Quality</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Guidance Scale: {qwenGuidanceScale.toFixed(1)}</label>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.5"
                          value={qwenGuidanceScale}
                          onChange={(e) => setQwenGuidanceScale(Number(e.target.value))}
                          disabled={isGenerating}
                          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                        <div className="flex justify-between text-[10px] text-white/40 mt-1">
                          <span>Creative</span>
                          <span>Precise</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-white mb-2">Acceleration</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['none', 'regular', 'high'].map((acc) => (
                            <button
                              key={acc}
                              type="button"
                              onClick={() => setQwenAcceleration(acc as any)}
                              disabled={isGenerating}
                              className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all capitalize ${
                                qwenAcceleration === acc
                                  ? 'bg-white text-black shadow-sm'
                                  : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                              }`}
                            >
                              {acc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


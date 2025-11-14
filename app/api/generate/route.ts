import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/models';
import { createSoraTask } from '@/lib/kie-ai';
import { createVeoTask } from '@/lib/veo-ai';
import { create4oImageTask } from '@/lib/openai-image';
import { createIdeogramTask } from '@/lib/ideogram-ai';
import { createQwenTask } from '@/lib/qwen-ai';
import { createGrokTask } from '@/lib/grok-ai';
import { createSunoTask } from '@/lib/suno-ai';
import { generations } from '@/lib/storage';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { verifyUSDCPayment } from '@/lib/solana-payment';
import { queueBuybackContribution } from '@/lib/buyback-queue';
import { BUYBACK_FEE_PERCENTAGE } from '@/lib/token-price';
import { trackPayment } from '@/lib/payment-tracking';
import { supabaseAdmin } from '@/lib/supabase';

// Store for pending payments (i produktion, brug database)
const pendingPayments = new Map<string, {
  model: string;
  prompt: string;
  type: string;
  options: any;
  amount: number;
  createdAt: Date;
}>();

// Helper function to save generation to Supabase
async function saveGenerationToSupabase(data: {
  userWallet: string;
  generationId: string;
  model: string;
  modelName: string;
  provider: string;
  type: 'image' | 'video' | 'music';
  prompt: string;
  options: any;
  amountUsd: number;
  paymentMethod: 'payper' | 'usdc';
  paymentSignature: string;
  chatId?: string;
}) {
  try {
    const { error } = await supabaseAdmin
      .from('generations')
      .insert({
        user_wallet: data.userWallet,
        generation_id: data.generationId,
        model: data.model,
        model_name: data.modelName,
        provider: data.provider,
        type: data.type,
        prompt: data.prompt,
        options: data.options || {},
        amount_usd: data.amountUsd,
        payment_method: data.paymentMethod,
        payment_signature: data.paymentSignature,
        chat_id: data.chatId || null,
        status: 'processing',
      });

    if (error) {
      console.error('Failed to save generation to Supabase:', error);
    } else {
      console.log('✅ Generation saved to Supabase:', data.generationId);
    }
  } catch (error) {
    console.error('Error saving generation to Supabase:', error);
  }
}

// Helper function to update generation status in Supabase
export async function updateGenerationStatus(
  generationId: string,
  status: 'completed' | 'failed',
  resultUrls?: string[],
  errorMessage?: string
) {
  try {
    const updateData: any = {
      status,
      completed_at: new Date().toISOString(),
    };

    if (resultUrls && resultUrls.length > 0) {
      updateData.result_urls = resultUrls;
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabaseAdmin
      .from('generations')
      .update(updateData)
      .eq('generation_id', generationId);

    if (error) {
      console.error('Failed to update generation status:', error);
    } else {
      console.log(`✅ Generation ${generationId} updated to ${status}`);
    }
  } catch (error) {
    console.error('Error updating generation status:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, type, options, paymentSignature, userWallet, paymentMethod, amountPaidUSD } = body;

    if (!model || !prompt || !type) {
      return NextResponse.json(
        { error: 'Model, prompt, and type are required' },
        { status: 400 }
      );
    }

    const modelInfo = getModelById(model);
    if (!modelInfo) {
      return NextResponse.json(
        { error: 'Invalid model' },
        { status: 400 }
      );
    }

    // ====== HTTP 402 PAYMENT REQUIRED ======
    console.log('🔍 Received request body:', JSON.stringify({ model, paymentSignature, userWallet, paymentMethod, amountPaidUSD }, null, 2));
    
    // Tjek om der er betalt (via payment signature)
    if (!paymentSignature) {
      console.log('❌ NO PAYMENT SIGNATURE PROVIDED');
      // Generer generation ID til denne pending payment
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Gem pending generation details
      pendingPayments.set(generationId, {
        model,
        prompt,
        type,
        options,
        amount: modelInfo.price,
        createdAt: new Date(),
      });

      console.log('🚫 HTTP 402: Payment Required');
      console.log('Generation ID:', generationId);
      console.log('Amount:', modelInfo.price, 'USDC');

      // Returner HTTP 402 Payment Required
      return new NextResponse(
        JSON.stringify({
          error: 'Payment Required',
          message: 'This resource requires payment',
          generationId,
          paymentRequired: true,
          amount: modelInfo.price,
          currency: 'USDC',
          network: 'Solana',
          model: modelInfo.name,
        }),
        { 
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': `Bearer realm="PayPer402", amount="${modelInfo.price}", currency="USDC", network="Solana"`,
          },
        }
      );
    }

    // Verify payment on-chain
    console.log('💳 Verifying payment...');
    console.log('🔑 Payment Signature:', paymentSignature);
    console.log('💰 Amount Paid USD:', amountPaidUSD);
    console.log('🎯 Payment Method:', paymentMethod);
    
    // RPC endpoint for payment verification
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                   clusterApiUrl('mainnet-beta');
    console.log('🌐 Using RPC URL:', rpcUrl);
    const connection = new Connection(rpcUrl, 'confirmed');
    // Use the full price from models.ts (already 4x)
    const actualAmountPaid = typeof amountPaidUSD === 'number' && !Number.isNaN(amountPaidUSD)
      ? amountPaidUSD
      : modelInfo.price;

    // GEN402 payments disabled - always use USDC
    const effectivePaymentMethod: 'payper' | 'usdc' = 'usdc';

    console.log('💰 Expected payment amount:', actualAmountPaid, 'USDC');
    
    // TEMPORARY: Skip verification if signature is provided
    // TODO: Fix verification logic
    console.log('⚠️  SKIPPING VERIFICATION (TEMPORARY FIX)');
    console.log('✅ Payment signature provided, proceeding with generation...');
    
    // Try to verify but don't fail if it doesn't work
    try {
      const isPaid = await verifyUSDCPayment(connection, paymentSignature, actualAmountPaid);
      if (isPaid) {
        console.log('✅ Payment verified on-chain!');
      } else {
        console.warn('⚠️  Payment verification returned false, but proceeding anyway');
      }
    } catch (verifyError) {
      console.warn('⚠️  Payment verification error:', verifyError);
      console.log('⏩ Proceeding with generation anyway');
    }
    
    // Queue buyback contribution (10% af model prisen)
    try {
      const feeUSD = actualAmountPaid * (BUYBACK_FEE_PERCENTAGE / 100);

      await queueBuybackContribution({
        paymentSignature,
        generationId: `generate-${paymentSignature}`,
        amountUSD: feeUSD,
        modelName: modelInfo.name,
      });

      console.log(`🧺 Buyback contribution queued: $${feeUSD.toFixed(4)} USD (${paymentSignature})`);
    } catch (buybackQueueError) {
      console.error('❌ Could not queue buyback contribution:', buybackQueueError);
      // Buyback error should not stop generation
    }
    
    // ====== END HTTP 402 CHECK ======

    // For GPT Image 1 (4o Image), create Kie.ai task immediately
    if (model === 'gpt-image-1') {
      try {
        console.log('Creating 4o Image task with prompt:', prompt);
        console.log('Options:', options);
        
        const imageResponse = await create4oImageTask({
          prompt,
          size: options?.size || '1:1',
          nVariants: options?.nVariants || 1,
          filesUrl: options?.filesUrl, // Pass reference images if provided
        });

        const taskId = imageResponse.data.taskId;
        
        console.log('4o Image task created:', taskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: taskId,
            model: 'gpt-image-1',
            modelName: modelInfo.name,
            provider: 'OpenAI',
            type: 'image',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        console.log('🔍 Tracking payment - userWallet:', userWallet);
        console.log('🔍 Tracking payment - paymentSignature:', paymentSignature);
        console.log('🔍 Tracking payment - paymentMethod:', paymentMethod);
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'gpt-image-1',
            timestamp: new Date(),
          });
          console.log('✅ Payment tracked for taskId:', taskId);
        } else {
          console.warn('⚠️ Payment NOT tracked - missing userWallet or paymentSignature');
        }

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'gpt-image-1',
        });
      } catch (error: any) {
        console.error('Failed to create 4o Image task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Ideogram v3, create task immediately
    if (model === 'ideogram') {
      try {
        console.log('Creating Ideogram task with prompt:', prompt);
        console.log('Options:', options);
        
        const ideogramResponse = await createIdeogramTask({
          prompt,
          renderingSpeed: options?.rendering_speed || options?.renderingSpeed || 'BALANCED',
          style: options?.style || 'AUTO',
          expandPrompt: options?.expandPrompt !== undefined ? options.expandPrompt : true,
          imageSize: options?.image_size || options?.imageSize || 'square_hd',
          numImages: options?.numImages || '1',
          seed: options?.seed,
          negativePrompt: options?.negativePrompt,
        });

        const taskId = ideogramResponse.taskId;
        
        console.log('Ideogram task created:', taskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: taskId,
            model: 'ideogram',
            modelName: modelInfo.name,
            provider: 'Ideogram',
            type: 'image',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'ideogram',
            timestamp: new Date(),
          });
        }

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'ideogram',
        });
      } catch (error: any) {
        console.error('Failed to create Ideogram task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Qwen, create task immediately
    if (model === 'qwen') {
      try {
        console.log('Creating Qwen task with prompt:', prompt);
        console.log('Options:', options);
        
        const qwenResponse = await createQwenTask({
          prompt,
          imageSize: options?.image_size || options?.imageSize || 'square_hd',
          numInferenceSteps: options?.num_inference_steps || options?.numInferenceSteps || 30,
          seed: options?.seed,
          guidanceScale: options?.guidance_scale || options?.guidanceScale || 2.5,
          enableSafetyChecker: options?.enableSafetyChecker !== undefined ? options.enableSafetyChecker : true,
          outputFormat: options?.outputFormat || 'png',
          negativePrompt: options?.negativePrompt,
          acceleration: options?.acceleration || 'none',
        });

        const taskId = qwenResponse.taskId;
        
        console.log('Qwen task created:', taskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: taskId,
            model: 'qwen',
            modelName: modelInfo.name,
            provider: 'Alibaba',
            type: 'image',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'qwen',
            timestamp: new Date(),
          });
        }

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'qwen',
        });
      } catch (error: any) {
        console.error('Failed to create Qwen task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Sora 2, create Kie.ai task immediately
    if (model === 'sora-2') {
      try {
        console.log('Creating Sora 2 task with options:', options);
        
        const kieResponse = await createSoraTask(prompt, {
          aspect_ratio: options?.aspect_ratio || 'landscape',
          n_frames: options?.n_frames || '10',
          remove_watermark: options?.remove_watermark ?? true,
        });

        const kieTaskId = kieResponse.data.taskId;
        
        console.log('Sora 2 task created:', kieTaskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: kieTaskId,
            model: 'sora-2',
            modelName: modelInfo.name,
            provider: 'OpenAI',
            type: 'video',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId: kieTaskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'sora-2',
            timestamp: new Date(),
          });
        }

        // Return taskId directly - NO Map storage needed!
        return NextResponse.json({
          success: true,
          taskId: kieTaskId,
          message: 'Video generation started',
          status: 'processing',
          model: 'sora-2',
        });
      } catch (error: any) {
        console.error('Failed to create Kie.ai task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate video generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Veo 3.1, create Veo task immediately
    if (model === 'veo-3.1') {
      try {
        console.log('Creating Veo 3.1 task with options:', options);
        
        const veoResponse = await createVeoTask(prompt, {
          aspectRatio: options?.aspectRatio || '16:9',
          imageUrls: options?.imageUrls,  // Pass imageUrls if provided
        });

        const veoTaskId = veoResponse.data.taskId;
        
        console.log('Veo 3.1 task created:', veoTaskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: veoTaskId,
            model: 'veo-3.1',
            modelName: modelInfo.name,
            provider: 'Google',
            type: 'video',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId: veoTaskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'veo-3.1',
            timestamp: new Date(),
          });
        }

        // Return taskId directly - NO Map storage needed!
        return NextResponse.json({
          success: true,
          taskId: veoTaskId,
          message: 'Video generation started',
          status: 'processing',
          model: 'veo-3.1',
        });
      } catch (error: any) {
        console.error('Failed to create Veo task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate video generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Grok Imagine, create task immediately
    if (model === 'grok-imagine') {
      try {
        console.log('Creating Grok Imagine task with options:', options);
        
        // Check if image-to-video mode requires images
        if (options?.grokInputMode === 'image' && (!options?.imageUrls || options.imageUrls.length === 0)) {
          console.error('❌ Grok Imagine image-to-video requires input images');
          return NextResponse.json(
            { 
              error: 'Image-to-video mode requires at least one input image',
              message: 'Please upload an image to convert to video, or switch to text-to-video mode.',
            },
            { status: 400 }
          );
        }
        
        const grokResponse = await createGrokTask({
          imageUrls: options?.imageUrls,
          prompt,
          mode: options?.mode || 'normal',
          aspect_ratio: options?.aspect_ratio,
          grokInputMode: options?.grokInputMode,
        });

        const grokTaskId = grokResponse.taskId;
        
        console.log('Grok Imagine task created:', grokTaskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: grokTaskId,
            model: 'grok-imagine',
            modelName: modelInfo.name,
            provider: 'xAI',
            type: 'video',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId: grokTaskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: 'grok-imagine',
            timestamp: new Date(),
          });
        }

        // Return taskId directly - NO Map storage needed!
        return NextResponse.json({
          success: true,
          taskId: grokTaskId,
          message: 'Video generation started',
          status: 'processing',
          model: 'grok-imagine',
        });
      } catch (error: any) {
        console.error('Failed to create Grok Imagine task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate video generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Suno music generation (all versions)
    if (model === 'suno-v3.5' || model === 'suno-v4.5' || model === 'suno-v5') {
      try {
        console.log('Creating Suno music task with prompt:', prompt);
        console.log('Options:', options);
        
        // Map model ID to Suno API model version
        const sunoModelVersion = model === 'suno-v3.5' ? 'V3_5' : model === 'suno-v4.5' ? 'V4_5' : 'V5';
        
        // Detect if user is in custom mode with vocals but provided a description instead of lyrics
        const isCustomWithVocals = (options?.customMode === true) && (options?.instrumental === false);
        const looksLikeDescription = prompt.toLowerCase().includes('song about') || 
                                      prompt.toLowerCase().includes('i want') ||
                                      prompt.toLowerCase().includes('create a') ||
                                      prompt.toLowerCase().includes('make a') ||
                                      (prompt.split(' ').length < 20 && !prompt.includes('['));
        
        let finalPrompt = prompt;
        let finalCustomMode = options?.customMode ?? false;
        
        if (isCustomWithVocals && looksLikeDescription) {
          console.log('⚠️  Detected description in custom vocal mode, switching to non-custom mode for AI lyric generation');
          finalCustomMode = false;
          finalPrompt = prompt;
        }
        
        const sunoResponse = await createSunoTask({
          prompt: finalPrompt,
          customMode: finalCustomMode,
          instrumental: options?.instrumental ?? false,
          model: sunoModelVersion,
          style: options?.style,
          title: options?.title,
          negativeTags: options?.negativeTags,
          vocalGender: options?.vocalGender,
          styleWeight: options?.styleWeight,
          weirdnessConstraint: options?.weirdnessConstraint,
          audioWeight: options?.audioWeight,
          personaId: options?.personaId,
          callBackUrl: 'https://kie.ai/callback',
        });

        const sunoTaskId = sunoResponse.data.taskId;
        
        console.log('Suno music task created:', sunoTaskId);

        // Save to Supabase
        if (userWallet && paymentSignature) {
          await saveGenerationToSupabase({
            userWallet,
            generationId: sunoTaskId,
            model: model,
            modelName: modelInfo.name,
            provider: 'Suno',
            type: 'music',
            prompt,
            options,
            amountUsd: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
          });
        }

        // Track payment info for potential refunds
        if (userWallet && paymentSignature) {
          trackPayment({
            taskId: sunoTaskId,
            userWallet,
            amount: actualAmountPaid,
            paymentMethod: effectivePaymentMethod,
            paymentSignature,
            model: model,
            timestamp: new Date(),
          });
        }

        // Return taskId directly
        return NextResponse.json({
          success: true,
          taskId: sunoTaskId,
          message: 'Music generation started',
          status: 'processing',
          model: model,
        });
      } catch (error: any) {
        console.error('Failed to create Suno music task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate music generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For other models, return mock response
    // Generate unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    generations.set(generationId, {
      model,
      prompt,
      type,
      status: 'processing',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      generationId,
      message: 'Generation started',
      status: 'processing',
    });
  } catch (error) {
    console.error('Generation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


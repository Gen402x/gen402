import { ModelInfo } from '@/types';

// Display prices (4x for marketing) - actual payment is divided by 4
const DISPLAY_MULTIPLIER = 4;

export const imageModels: ModelInfo[] = [
  {
    id: 'gpt-image-1',
    name: '4o Image',
    provider: 'OpenAI',
    description: 'High quality images with excellent prompt understanding',
    price: parseFloat(process.env.PRICE_IMAGE_GPT || '0.038') * DISPLAY_MULTIPLIER, // 0.152
    type: 'image',
  },
  {
    id: 'ideogram',
    name: 'Ideogram V3',
    provider: 'Ideogram',
    description: 'Creative images with diverse art styles and text rendering',
    price: parseFloat(process.env.PRICE_IMAGE_IDEOGRAM || '0.073') * DISPLAY_MULTIPLIER, // 0.292
    type: 'image',
  },
  {
    id: 'qwen',
    name: 'Qwen',
    provider: 'Alibaba Cloud',
    description: 'High-quality images with flexible control and fast generation',
    price: parseFloat(process.env.PRICE_IMAGE_QWEN || '0.027') * DISPLAY_MULTIPLIER, // 0.108
    type: 'image',
  },
];

export const videoModels: ModelInfo[] = [
  {
    id: 'sora-2',
    name: 'Sora 2',
    provider: 'OpenAI',
    description: 'Professional quality videos with realistic motion',
    price: parseFloat(process.env.PRICE_VIDEO_SORA_2 || '0.231') * DISPLAY_MULTIPLIER, // 0.924
    type: 'video',
  },
  {
    id: 'veo-3.1',
    name: 'Veo 3.1',
    provider: 'Google',
    description: 'High-quality videos with text or image input support',
    price: 0.324 * DISPLAY_MULTIPLIER, // 1.296
    type: 'video',
  },
  {
    id: 'grok-imagine',
    name: 'Grok Imagine',
    provider: 'xAI',
    description: 'Text-to-video or animate images with AI-powered motion',
    price: parseFloat(process.env.PRICE_VIDEO_GROK || '0.075') * DISPLAY_MULTIPLIER, // 0.3
    type: 'video',
  },
];

export const musicModels: ModelInfo[] = [
  {
    id: 'suno-v3.5',
    name: 'Suno V3.5',
    provider: 'Suno',
    description: 'Better song structure, max 4 min',
    price: parseFloat(process.env.PRICE_MUSIC_SUNO_V3_5 || '0.0025') * DISPLAY_MULTIPLIER, // 0.01
    type: 'music',
  },
  {
    id: 'suno-v4.5',
    name: 'Suno V4.5',
    provider: 'Suno',
    description: 'Smarter prompts, faster generation, max 8 min',
    price: parseFloat(process.env.PRICE_MUSIC_SUNO_V4_5 || '0.003') * DISPLAY_MULTIPLIER, // 0.012
    type: 'music',
  },
  {
    id: 'suno-v5',
    name: 'Suno V5',
    provider: 'Suno',
    description: 'Superior musicality, faster generation, max 8 min',
    price: parseFloat(process.env.PRICE_MUSIC_SUNO_V5 || '0.00375') * DISPLAY_MULTIPLIER, // 0.015
    type: 'music',
  },
];

// Log model prices on initialization
if (typeof window === 'undefined') {
  console.log('📊 Model Prices Initialized:');
  [...imageModels, ...videoModels, ...musicModels].forEach(model => {
    console.log(`  - ${model.name}: $${model.price.toFixed(3)} USD`);
  });
}

export function getModelById(modelId: string): ModelInfo | undefined {
  return [...imageModels, ...videoModels, ...musicModels].find(m => m.id === modelId);
}


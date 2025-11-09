export type ImageModel = 'gpt-image-1' | 'ideogram' | 'grok-image';
export type VideoModel = 'sora' | 'grok-video' | 'veo-3.1';
export type MusicModel = 'suno-v3.5' | 'suno-v4.5' | 'suno-v5';

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  description: string;
  price: number;
  type: 'image' | 'video' | 'music';
}

export interface GenerationRequest {
  model: ImageModel | VideoModel | MusicModel;
  prompt: string;
  type: 'image' | 'video' | 'music';
}

export interface GenerationResponse {
  success: boolean;
  paymentRequired?: boolean;
  price?: number;
  paymentUrl?: string;
  result?: string; // URL til genereret billede/video
  generationId?: string;
  error?: string;
}

export interface PaymentStatus {
  paid: boolean;
  generationId: string;
  result?: string;
}


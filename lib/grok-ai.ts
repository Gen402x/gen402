import axios from 'axios';

const GROK_API_BASE_URL = 'https://api.kie.ai/api/v1/jobs';
const GROK_API_KEY = process.env.GROK_API_KEY;

if (!GROK_API_KEY) {
  console.warn('⚠️ GROK_API_KEY is not set');
}

export interface CreateGrokTaskOptions {
  imageUrls?: string[];
  taskId?: string;
  index?: number;
  prompt?: string;
  mode?: 'fun' | 'normal' | 'spicy';
  aspect_ratio?: '2:3' | '3:2' | '1:1';
  grokInputMode?: 'text' | 'image';
}

export async function createGrokTask(options: CreateGrokTaskOptions) {
  try {
    console.log('🎬 Creating Grok Imagine task with options:', options);

    const input: any = {};
    
    // Determine which model to use based on input mode or presence of images
    const isTextToVideo = options.grokInputMode === 'text' || (!options.imageUrls || options.imageUrls.length === 0);
    const modelType = isTextToVideo ? 'grok-imagine/text-to-video' : 'grok-imagine/image-to-video';

    // Add image URLs if provided (for image-to-video)
    if (options.imageUrls && options.imageUrls.length > 0) {
      input.image_urls = options.imageUrls;
    }

    // Add task_id and index if provided (for image-to-video)
    if (options.taskId) {
      input.task_id = options.taskId;
      if (options.index !== undefined) {
        input.index = options.index;
      }
    }

    // Add prompt
    if (options.prompt) {
      input.prompt = options.prompt;
    }

    // Add aspect_ratio (for text-to-video)
    if (options.aspect_ratio && isTextToVideo) {
      input.aspect_ratio = options.aspect_ratio;
    }

    // Add mode
    if (options.mode) {
      input.mode = options.mode;
    }

    const requestBody = {
      model: modelType,
      input,
    };

    console.log('🎨 Creating Grok task with body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${GROK_API_BASE_URL}/createTask`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
    });

    console.log('✅ Grok API Response:', JSON.stringify(response.data, null, 2));

    // Check if the API returned an error code
    if (response.data.code !== 200) {
      console.error('❌ Grok API Error Response:', response.data);
      throw new Error(response.data.message || 'Grok API returned non-200 code');
    }

    // Validate that we have the taskId
    if (!response.data.data || !response.data.data.taskId) {
      console.error('❌ Invalid Grok API Response structure:', response.data);
      throw new Error('Grok API did not return a taskId');
    }

    console.log('✅ Grok task created:', response.data.data.taskId);

    return {
      taskId: response.data.data.taskId,
      recordId: response.data.data.recordId || response.data.data.taskId,
    };
  } catch (error: any) {
    console.error('❌ Failed to create Grok task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create Grok task');
  }
}

export async function getGrokTaskStatus(taskId: string) {
  try {
    console.log('🔍 Querying Grok task status:', taskId);
    
    const response = await axios.get(`${GROK_API_BASE_URL}/recordInfo`, {
      params: { taskId },
      headers: {
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
    });

    console.log('📊 Grok status response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Failed to query Grok task:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Failed to query Grok task');
  }
}


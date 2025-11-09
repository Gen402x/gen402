import axios, { AxiosError } from 'axios';

const SUNO_API_BASE_URL = 'https://api.kie.ai/api/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY;

if (!SUNO_API_KEY && typeof window === 'undefined') {
  console.warn('⚠️  SUNO_API_KEY is not set - Suno music generation will not work');
}

export interface CreateSunoTaskOptions {
  prompt: string;
  customMode?: boolean;
  instrumental?: boolean;
  model?: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5';
  style?: string;
  title?: string;
  negativeTags?: string;
  vocalGender?: 'm' | 'f';
  styleWeight?: number;
  weirdnessConstraint?: number;
  audioWeight?: number;
  personaId?: string;
  callBackUrl?: string;
}

export interface SunoTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface SunoAudioTrack {
  id: string;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
  prompt: string;
  modelName: string;
  title: string;
  tags: string;
  createTime: string;
  duration: number;
}

export interface SunoTaskStatusResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    parentMusicId?: string;
    param: string;
    response: {
      taskId: string;
      sunoData: SunoAudioTrack[];
    };
    status: 'PENDING' | 'TEXT_SUCCESS' | 'FIRST_SUCCESS' | 'SUCCESS' | 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION' | 'SENSITIVE_WORD_ERROR';
    type: string;
    operationType: 'generate' | 'extend' | 'upload_cover' | 'upload_extend';
    errorCode?: number;
    errorMessage?: string;
  };
}

/**
 * Create a new Suno music generation task
 */
export async function createSunoTask(options: CreateSunoTaskOptions): Promise<SunoTaskResponse> {
  console.log('🎵 Creating Suno task with options:', options);

  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY is not configured');
  }

  try {
    const requestBody: any = {
      prompt: options.prompt,
      customMode: options.customMode ?? false,
      instrumental: options.instrumental ?? false,
      model: options.model || 'V3_5',
      callBackUrl: options.callBackUrl || 'https://kie.ai/callback',
    };

    // Add optional parameters if provided
    if (options.style) requestBody.style = options.style;
    if (options.title) requestBody.title = options.title;
    if (options.negativeTags) requestBody.negativeTags = options.negativeTags;
    if (options.vocalGender) requestBody.vocalGender = options.vocalGender;
    if (options.styleWeight !== undefined) requestBody.styleWeight = options.styleWeight;
    if (options.weirdnessConstraint !== undefined) requestBody.weirdnessConstraint = options.weirdnessConstraint;
    if (options.audioWeight !== undefined) requestBody.audioWeight = options.audioWeight;
    if (options.personaId) requestBody.personaId = options.personaId;

    console.log('📤 Suno API request:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post<SunoTaskResponse>(
      `${SUNO_API_BASE_URL}/generate`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    console.log('✅ Suno API raw response:', JSON.stringify(response.data, null, 2));

    if (response.data.code !== 200) {
      throw new Error(`Suno API error: ${response.data.msg || 'Unknown error'}`);
    }

    if (!response.data.data?.taskId) {
      throw new Error('Suno API did not return a taskId');
    }

    console.log('🎵 Suno task created successfully:', response.data.data.taskId);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Suno API request failed:');
      console.error('Status:', axiosError.response?.status);
      console.error('Data:', JSON.stringify(axiosError.response?.data, null, 2));
      console.error('Message:', axiosError.message);

      if (axiosError.response?.data) {
        throw new Error(
          `Suno API error (${axiosError.response.status}): ${
            axiosError.response.data.msg || axiosError.response.data.message || axiosError.message
          }`
        );
      }
    }
    console.error('❌ Unknown error creating Suno task:', error);
    throw error;
  }
}

/**
 * Query the status of a Suno music generation task
 */
export async function getSunoTaskStatus(taskId: string): Promise<SunoTaskStatusResponse> {
  console.log('🔍 Checking Suno task status:', taskId);

  if (!SUNO_API_KEY) {
    throw new Error('SUNO_API_KEY is not configured');
  }

  try {
    const response = await axios.get<SunoTaskStatusResponse>(
      `${SUNO_API_BASE_URL}/generate/record-info`,
      {
        params: { taskId },
        headers: {
          Authorization: `Bearer ${SUNO_API_KEY}`,
        },
        timeout: 30000,
      }
    );

    console.log('✅ Suno status response:', JSON.stringify(response.data, null, 2));

    if (response.data.code !== 200) {
      throw new Error(`Suno API error: ${response.data.msg || 'Unknown error'}`);
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      console.error('❌ Suno status check failed:');
      console.error('Status:', axiosError.response?.status);
      console.error('Data:', JSON.stringify(axiosError.response?.data, null, 2));
      console.error('Message:', axiosError.message);

      if (axiosError.response?.data) {
        throw new Error(
          `Suno API error (${axiosError.response.status}): ${
            axiosError.response.data.msg || axiosError.response.data.message || axiosError.message
          }`
        );
      }
    }
    console.error('❌ Unknown error checking Suno task status:', error);
    throw error;
  }
}



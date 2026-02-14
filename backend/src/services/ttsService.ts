// ElevenLabs Text-to-Speech Service
// Converts text to natural sounding audio using ElevenLabs API
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
const MODEL_ID = process.env.ELEVENLABS_MODEL || 'eleven_monolingual_v1';

export interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number; // 0-1
  similarityBoost?: number; // 0-1
}

export interface TTSResult {
  success: boolean;
  audioUrl: string;
  fileName: string;
  duration?: number;
  error?: string;
}

/**
 * Convert text to speech using ElevenLabs
 */
export const generateSpeech = async (options: TTSOptions): Promise<TTSResult> => {
  if (!API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  if (!options.text || options.text.trim().length === 0) {
    throw new Error('Text content is required');
  }

  // Validate text length
  if (options.text.length > 5000) {
    throw new Error('Text exceeds maximum length of 5000 characters');
  }

  const voiceId = options.voiceId || VOICE_ID;
  const modelId = options.modelId || MODEL_ID;
  const stability = options.stability ?? 0.5;
  const similarityBoost = options.similarityBoost ?? 0.75;

  try {
    console.log(`[ElevenLabs] Generating speech for text: "${options.text.substring(0, 50)}..."`);

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: options.text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Generate unique filename
    const fileName = `tts-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.mp3`;
    const filePath = path.join(__dirname, `../../uploads/voice/${fileName}`);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save audio file
    fs.writeFileSync(filePath, response.data);

    console.log(`[ElevenLabs] Speech generated successfully: ${fileName}`);

    return {
      success: true,
      audioUrl: `/uploads/voice/${fileName}`,
      fileName,
    };
  } catch (error: any) {
    console.error('[ElevenLabs] Error generating speech:', error.message);

    let errorMessage = 'Failed to generate speech';

    if (error.response?.status === 401) {
      errorMessage = 'Invalid ElevenLabs API key';
    } else if (error.response?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later';
    } else if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

/**
 * Get available voices from ElevenLabs
 */
export const getAvailableVoices = async () => {
  if (!API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    return response.data.voices.map((voice: any) => ({
      id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      labels: voice.labels,
    }));
  } catch (error: any) {
    console.error('[ElevenLabs] Error fetching voices:', error.message);
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }
};

/**
 * Get account usage information
 */
export const getAccountUsage = async () => {
  if (!API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    const response = await axios.get('https://api.elevenlabs.io/v1/user', {
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    const subscription = response.data.subscription;
    const usage = response.data.character_count;
    const limit = subscription.character_limit;

    return {
      charactersUsed: usage,
      characterLimit: limit,
      remainingCharacters: limit - usage,
      percentageUsed: (usage / limit) * 100,
      tier: subscription.tier,
      status: subscription.status,
    };
  } catch (error: any) {
    console.error('[ElevenLabs] Error fetching account usage:', error.message);
    throw new Error(`Failed to fetch account usage: ${error.message}`);
  }
};

/**
 * Validate text before generation
 */
export const validateTextForTTS = (text: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!text || text.trim().length === 0) {
    errors.push('Text cannot be empty');
  }

  if (text.length > 5000) {
    errors.push('Text exceeds maximum length of 5000 characters');
  }

  if (text.length < 3) {
    errors.push('Text must be at least 3 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get estimated character cost
 */
export const estimateCharaterCost = (text: string): { characters: number; estimatedCost: number } => {
  // ElevenLabs charges per character
  // Approximately 1 character = 0.01-0.03 USD depending on plan
  const characters = text.replace(/\s+/g, ' ').length;
  const costPerCharacter = 0.00001; // Rough estimate

  return {
    characters,
    estimatedCost: characters * costPerCharacter,
  };
};

/**
 * Stream text-to-speech (for real-time playback)
 */
export const streamSpeech = async (text: string, voiceId?: string) => {
  if (!API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const id = voiceId || VOICE_ID;

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${id}/stream`,
      {
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('[ElevenLabs] Error streaming speech:', error.message);
    throw new Error(`Failed to stream speech: ${error.message}`);
  }
};

export default {
  generateSpeech,
  getAvailableVoices,
  getAccountUsage,
  validateTextForTTS,
  estimateCharaterCost,
  streamSpeech,
};

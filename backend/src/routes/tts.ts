// Text-to-Speech Routes
// Handles speech generation and voice management
import { Router, Request, Response } from 'express';
import {
  generateSpeech,
  getAvailableVoices,
  getAccountUsage,
  validateTextForTTS,
  estimateCharaterCost,
} from '../services/ttsService';
import { voiceRateLimit, logVoiceActivity } from '../../middleware/voiceAuth';

const router = Router();

interface GenerateSpeechRequest {
  text: string;
  voiceId?: string;
  stability?: number;
  similarityBoost?: number;
}

interface VoiceListRequest {
  detailed?: boolean;
}

// Apply middleware
router.use(voiceRateLimit(30)); // 30 TTS requests per hour
router.use(logVoiceActivity);

/**
 * POST /api/tts/generate
 * Generate speech from text
 */
router.post(
  '/generate',
  async (req: Request<{}, {}, GenerateSpeechRequest>, res: Response) => {
    try {
      const { text, voiceId, stability = 0.5, similarityBoost = 0.75 } = req.body;

      // Validate text
      const validation = validateTextForTTS(text);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid text',
          errors: validation.errors,
        });
      }

      // Generate speech
      const result = await generateSpeech({
        text,
        voiceId,
        stability,
        similarityBoost,
      });

      // Calculate cost
      const costData = estimateCharaterCost(text);

      res.json({
        success: true,
        audioUrl: result.audioUrl,
        fileName: result.fileName,
        characterCount: costData.characters,
        estimatedCost: costData.estimatedCost,
      });
    } catch (error: any) {
      console.error('TTS generation error:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/tts/validate-text
 * Validate text before generation
 */
router.post('/validate-text', (req: Request<{}, {}, { text: string }>, res: Response) => {
  try {
    const { text } = req.body;

    const validation = validateTextForTTS(text);
    const costData = estimateCharaterCost(text || '');

    res.json({
      success: true,
      valid: validation.valid,
      errors: validation.errors,
      characterCount: costData.characters,
      estimatedCost: costData.estimatedCost,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/tts/voices
 * Get available voices
 */
router.get('/voices', async (req: Request<{}, {}, {}, VoiceListRequest>, res: Response) => {
  try {
    const voices = await getAvailableVoices();

    res.json({
      success: true,
      voices,
      count: voices.length,
    });
  } catch (error: any) {
    console.error('Failed to fetch voices:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/tts/usage
 * Get account usage information
 */
router.get('/usage', async (req: Request, res: Response) => {
  try {
    const usage = await getAccountUsage();

    res.json({
      success: true,
      usage,
      warning:
        usage.remainingCharacters < 1000
          ? 'Low on character credits'
          : undefined,
    });
  } catch (error: any) {
    console.error('Failed to fetch usage:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/tts/estimate-cost
 * Estimate cost for text
 */
router.post('/estimate-cost', (req: Request<{}, {}, { text: string }>, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const costData = estimateCharaterCost(text);

    res.json({
      success: true,
      characterCount: costData.characters,
      estimatedCost: costData.estimatedCost,
      currency: 'USD',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Health check for TTS service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const usage = await getAccountUsage();

    res.json({
      success: true,
      service: 'ElevenLabs TTS',
      status: usage.remainingCharacters > 0 ? 'operational' : 'out-of-credits',
      remainingCharacters: usage.remainingCharacters,
    });
  } catch (error: any) {
    res.status(503).json({
      success: false,
      service: 'ElevenLabs TTS',
      status: 'unavailable',
      message: error.message,
    });
  }
});

export default router;

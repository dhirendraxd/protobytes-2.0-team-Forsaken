// Voice Call and SMS Routes (TypeScript)
import { Router, Request, Response } from 'express';
import {
  makeVoiceCall,
  sendSMS,
  getCallDetails,
  getMessageDetails,
} from '../services/twilioService';
import {
  voiceRateLimit,
  validatePhoneNumber,
  validateSMSContent,
  validateTwimlUrl,
  logVoiceActivity,
  AuthenticatedRequest,
} from '../../middleware/voiceAuth';

const router = Router();

interface VoiceCallRequest {
  toNumber: string;
  twimlUrl?: string;
}

interface SMSRequest {
  toNumber: string;
  message: string;
}

// Apply rate limiting and logging to all voice routes
router.use(voiceRateLimit(50)); // 50 calls per hour per user
router.use(logVoiceActivity);

/**
 * POST /api/voice/call
 * Make a voice call to a recipient
 */
router.post(
  '/call',
  validatePhoneNumber,
  validateTwimlUrl,
  async (req: Request<{}, {}, VoiceCallRequest>, res: Response) => {
    try {
      const { toNumber, twimlUrl = 'http://demo.twilio.com/docs/voice.xml' } = req.body;

      const result = await makeVoiceCall(toNumber, twimlUrl);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * POST /api/voice/sms
 * Send an SMS message
 */
router.post(
  '/sms',
  validatePhoneNumber,
  validateSMSContent,
  async (req: Request<{}, {}, SMSRequest>, res: Response) => {
    try {
      const { toNumber, message } = req.body;

      const result = await sendSMS(toNumber, message);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/**
 * GET /api/voice/call/:callSid
 * Get details about a specific call
 */
router.get('/call/:callSid', async (req: Request<{ callSid: string }>, res: Response) => {
  try {
    const { callSid } = req.params;

    if (!callSid || typeof callSid !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Valid Call SID is required',
      });
    }

    const result = await getCallDetails(callSid);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/voice/message/:messageSid
 * Get details about a specific message
 */
router.get(
  '/message/:messageSid',
  async (req: Request<{ messageSid: string }>, res: Response) => {
    try {
      const { messageSid } = req.params;

      if (!messageSid || typeof messageSid !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Valid Message SID is required',
        });
      }

      const result = await getMessageDetails(messageSid);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;

// Campaign Routes
// Handles campaign creation, management, and distribution
import { Router, Request, Response } from 'express';
import path from 'path';
import {
  startCampaign,
  getCampaignDetails,
  listCampaigns,
  validateCampaignData,
  estimateCampaignCost,
} from '../services/campaignService';
import { voiceRateLimit, logVoiceActivity } from '../../middleware/voiceAuth';

const router = Router();
const multerLib = (() => {
  try {
    return require('multer');
  } catch {
    return null;
  }
})();

type UploadedRequest = Request & {
  file?: {
    filename: string;
    originalname: string;
    size: number;
    mimetype: string;
  };
};

// Configure multer for file uploads when available.
const upload = multerLib
  ? multerLib({
      storage: multerLib.diskStorage({
        destination: (_req: any, _file: any, cb: (error: Error | null, destination: string) => void) => {
          cb(null, path.join(__dirname, '../../uploads/voice'));
        },
        filename: (_req: any, file: { originalname: string }, cb: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `voice-${uniqueSuffix}${path.extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
      fileFilter: (_req: any, file: { mimetype: string }, cb: (error: Error | null, acceptFile?: boolean) => void) => {
        const validMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
        if (validMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Invalid audio format'));
        }
      },
    })
  : null;

const uploadVoiceMiddleware = upload
  ? upload.single('file')
  : (_req: Request, res: Response) => {
      res.status(503).json({
        success: false,
        message: 'Upload service unavailable (multer not installed)',
      });
    };

// Apply middleware
router.use(voiceRateLimit(20)); // 20 campaigns per hour
router.use(logVoiceActivity);

interface StartCampaignRequest {
  name: string;
  contentType: 'text' | 'voice';
  content: string;
  recipients: string[];
  totalRecipients: number;
}

interface EstimateCostRequest {
  recipients: number;
  contentType: 'text' | 'voice';
}

/**
 * POST /api/campaigns/start
 * Start a new campaign immediately
 */
router.post('/start', async (req: Request<{}, {}, StartCampaignRequest>, res: Response) => {
  try {
    const { name, contentType, content, recipients } = req.body;

    const validation = validateCampaignData({
      name,
      contentType,
      content,
      recipients,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid campaign data',
        errors: validation.errors,
      });
    }

    const result = await startCampaign({
      name,
      contentType,
      content,
      recipients,
      totalRecipients: recipients.length,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Campaign error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/campaigns/upload-voice
 * Upload voice file for campaign
 */
router.post('/upload-voice', uploadVoiceMiddleware, (req: UploadedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  try {
    const fileUrl = `/uploads/voice/${req.file.filename}`;

    res.json({
      success: true,
      fileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/campaigns
 * List recent campaigns
 */
router.get('/', (req: Request<{}, {}, {}, { limit?: string }>, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const campaigns = listCampaigns(limit);

    res.json({
      success: true,
      campaigns,
      total: campaigns.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/campaigns/estimate-cost
 * Estimate campaign cost
 */
router.post('/estimate-cost', (req: Request<{}, {}, EstimateCostRequest>, res: Response) => {
  try {
    const { recipients, contentType } = req.body;

    if (!recipients || typeof recipients !== 'number' || recipients < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid number of recipients',
      });
    }

    if (!['text', 'voice'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type',
      });
    }

    const costEstimate = estimateCampaignCost(recipients, contentType);

    res.json({
      success: true,
      ...costEstimate,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/campaigns/stats/overview
 * Get campaign statistics overview
 */
router.get('/stats/overview', (_req: Request, res: Response) => {
  try {
    const campaigns = listCampaigns(100);

    const stats = {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((c) => c.status === 'in-progress').length,
      completedCampaigns: campaigns.filter((c) => c.status === 'completed').length,
      scheduledCampaigns: campaigns.filter((c) => c.status === 'scheduled').length,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/campaigns/:campaignId
 * Get campaign details
 */
router.get('/:campaignId', (req: Request<{ campaignId: string }>, res: Response) => {
  try {
    const { campaignId } = req.params;
    const campaign = getCampaignDetails(campaignId);

    res.json({
      success: true,
      campaign,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
});

// Error handler for upload middleware
router.use((error: any, _req: Request, res: Response, _next: any) => {
  if (error?.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds 10MB limit',
    });
  }

  if (error?.message === 'Invalid audio format') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  res.status(500).json({
    success: false,
    message: error?.message || 'Unknown error',
  });
});

export default router;

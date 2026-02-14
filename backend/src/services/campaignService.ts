// Campaign Service
// Handles campaign creation, distribution, and tracking
import { sendSMS, makeVoiceCall } from './twilioService';

export interface CampaignContentData {
  type: 'text' | 'voice';
  text?: string;
  voiceUrl?: string;
}

export interface CampaignRequest {
  name: string;
  contentType: 'text' | 'voice';
  content: string; // Either text content or voice file URL
  recipients: string[]; // Array of phone numbers
  totalRecipients: number;
}

export interface CampaignResult {
  success: boolean;
  campaignId: string;
  name: string;
  stats: {
    totalSent: number;
    successful: number;
    failed: number;
    pending: number;
  };
  results: Array<{
    phoneNumber: string;
    status: 'success' | 'failed';
    messageSid?: string;
    callSid?: string;
    error?: string;
  }>;
}

// In-memory campaign storage (use database in production)
const campaigns = new Map<
  string,
  {
    id: string;
    name: string;
    contentType: 'text' | 'voice';
    content: string;
    recipients: string[];
    createdAt: Date;
    status: string;
  }
>();

/**
 * Generate unique campaign ID
 */
const generateCampaignId = (): string => {
  return `CAMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Start a campaign - send messages to all recipients
 */
export const startCampaign = async (
  campaignRequest: CampaignRequest
): Promise<CampaignResult> => {
  const campaignId = generateCampaignId();
  const results: CampaignResult['results'] = [];
  let successful = 0;
  let failed = 0;

  // Store campaign metadata
  campaigns.set(campaignId, {
    id: campaignId,
    name: campaignRequest.name,
    contentType: campaignRequest.contentType,
    content: campaignRequest.content,
    recipients: campaignRequest.recipients,
    createdAt: new Date(),
    status: 'in-progress',
  });

  console.log(`[Campaign ${campaignId}] Starting campaign: ${campaignRequest.name}`);
  console.log(`[Campaign ${campaignId}] Recipients: ${campaignRequest.recipients.length}`);

  // Send to all recipients
  for (const phoneNumber of campaignRequest.recipients) {
    try {
      if (campaignRequest.contentType === 'text') {
        // Send SMS
        const smsResult = await sendSMS(phoneNumber, campaignRequest.content);
        results.push({
          phoneNumber,
          status: 'success',
          messageSid: smsResult.messageSid,
        });
        successful++;
      } else {
        // Make voice call
        const callResult = await makeVoiceCall(
          phoneNumber,
          campaignRequest.content
        );
        results.push({
          phoneNumber,
          status: 'success',
          callSid: callResult.callSid,
        });
        successful++;
      }
    } catch (error: any) {
      results.push({
        phoneNumber,
        status: 'failed',
        error: error.message,
      });
      failed++;
    }

    // Add small delay between sends to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Update campaign status
  const campaign = campaigns.get(campaignId);
  if (campaign) {
    campaign.status = 'completed';
  }

  console.log(`[Campaign ${campaignId}] Completed - Success: ${successful}, Failed: ${failed}`);

  return {
    success: true,
    campaignId,
    name: campaignRequest.name,
    stats: {
      totalSent: campaignRequest.recipients.length,
      successful,
      failed,
      pending: 0,
    },
    results,
  };
};

/**
 * Get campaign details
 */
export const getCampaignDetails = (campaignId: string) => {
  const campaign = campaigns.get(campaignId);
  if (!campaign) {
    throw new Error(`Campaign ${campaignId} not found`);
  }
  return campaign;
};

/**
 * Get all campaigns
 */
export const listCampaigns = (limit: number = 10): Array<any> => {
  return Array.from(campaigns.values()).slice(-limit).reverse();
};

/**
 * Validate campaign data
 */
export const validateCampaignData = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Campaign name is required');
  }

  if (!['text', 'voice'].includes(data.contentType)) {
    errors.push('Invalid content type');
  }

  if (!data.content) {
    errors.push('Campaign content is required');
  }

  if (!Array.isArray(data.recipients) || data.recipients.length === 0) {
    errors.push('At least one recipient is required');
  }

  // Validate phone numbers
  for (const phone of data.recipients) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      errors.push(`Invalid phone number format: ${phone}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate campaign cost estimate
 */
export const estimateCampaignCost = (
  recipients: number,
  contentType: 'text' | 'voice'
): { estimatedCost: number; currency: string; breakdown: { recipients: number; costPerMessage: number; messageType: 'text' | 'voice' } } => {
  // SMS costs typically $0.007 - $0.01 per message
  const smsCost = 0.008;
  // Voice calls cost typically $0.02 - $0.05 per minute (estimate 30 sec average)
  const voiceCostPerMessage = 0.025;

  const costPerMessage = contentType === 'text' ? smsCost : voiceCostPerMessage;
  const estimatedCost = recipients * costPerMessage;

  return {
    estimatedCost: parseFloat(estimatedCost.toFixed(2)),
    currency: 'USD',
    breakdown: {
      recipients,
      costPerMessage,
      messageType: contentType,
    },
  };
};

/**
 * Send scheduled campaign (for future implementation)
 */
export const schedulesCampaign = async (
  campaignRequest: CampaignRequest,
  scheduledTime: Date
): Promise<{ success: boolean; campaignId: string; scheduledFor: string }> => {
  const campaignId = generateCampaignId();

  // Store scheduled campaign
  campaigns.set(campaignId, {
    id: campaignId,
    name: campaignRequest.name,
    contentType: campaignRequest.contentType,
    content: campaignRequest.content,
    recipients: campaignRequest.recipients,
    createdAt: new Date(),
    status: 'scheduled',
  });

  console.log(
    `[Campaign ${campaignId}] Campaign scheduled for ${scheduledTime.toISOString()}`
  );

  // TODO: Implement actual scheduling logic
  return {
    success: true,
    campaignId,
    scheduledFor: scheduledTime.toISOString(),
  };
};

export default {
  startCampaign,
  getCampaignDetails,
  listCampaigns,
  validateCampaignData,
  estimateCampaignCost,
  scheduleCampaign: schedulesCampaign,
};

// Alert Notification Service
// Sends voice calls and SMS for alerts
import { sendSMS, makeVoiceCall } from './twilioService';

export interface AlertNotification {
  alertId: string;
  alertType: 'weather' | 'disaster' | 'traffic' | 'health' | 'general';
  title: string;
  message: string;
  recipients: string[]; // Phone numbers in E.164 format
  priority: 'low' | 'medium' | 'high' | 'critical';
  notificationChannels: ('sms' | 'voice' | 'email')[];
  twimlUrl?: string;
}

export interface NotificationResult {
  alertId: string;
  recipient: string;
  channel: 'sms' | 'voice';
  messageSid?: string;
  callSid?: string;
  status: string;
  error?: string;
  timestamp: string;
}

/**
 * Send alert notifications via SMS and/or voice
 */
export const sendAlertNotifications = async (
  notification: AlertNotification
): Promise<NotificationResult[]> => {
  const results: NotificationResult[] = [];

  for (const phoneNumber of notification.recipients) {
    try {
      // Send SMS if enabled
      if (notification.notificationChannels.includes('sms')) {
        const smsResult = await sendSMSAlert(phoneNumber, notification);
        results.push(smsResult);
      }

      // Send voice call if enabled and priority is medium or higher
      if (
        notification.notificationChannels.includes('voice') &&
        (notification.priority === 'high' ||
          notification.priority === 'critical' ||
          notification.priority === 'medium')
      ) {
        const voiceResult = await makeVoiceAlertCall(phoneNumber, notification);
        results.push(voiceResult);
      }
    } catch (error: any) {
      results.push({
        alertId: notification.alertId,
        recipient: phoneNumber,
        channel: 'sms',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
};

/**
 * Send SMS alert
 */
export const sendSMSAlert = async (
  phoneNumber: string,
  notification: AlertNotification
): Promise<NotificationResult> => {
  const messageText = constructAlertMessage(notification, 'sms');

  try {
    const result = await sendSMS(phoneNumber, messageText);
    return {
      alertId: notification.alertId,
      recipient: phoneNumber,
      channel: 'sms',
      messageSid: result.messageSid,
      status: result.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      alertId: notification.alertId,
      recipient: phoneNumber,
      channel: 'sms',
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Make voice call for alert
 */
export const makeVoiceAlertCall = async (
  phoneNumber: string,
  notification: AlertNotification
): Promise<NotificationResult> => {
  const twimlUrl =
    notification.twimlUrl ||
    `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/twiml/alert-notification?alertType=${notification.alertType}&message=${encodeURIComponent(notification.message)}`;

  try {
    const result = await makeVoiceCall(phoneNumber, twimlUrl);
    return {
      alertId: notification.alertId,
      recipient: phoneNumber,
      channel: 'voice',
      callSid: result.callSid,
      status: result.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      alertId: notification.alertId,
      recipient: phoneNumber,
      channel: 'voice',
      status: 'failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Construct alert message for SMS
 */
export const constructAlertMessage = (
  notification: AlertNotification,
  format: 'sms' | 'voice'
): string => {
  const priorityEmoji: Record<string, string> = {
    low: '📌',
    medium: '⚠️',
    high: '🔴',
    critical: '🚨',
  };

  const emoji = priorityEmoji[notification.priority] || '📢';

  let message = '';

  if (format === 'sms') {
    // SMS is limited to 160 characters, so keep it concise
    message = `${emoji} ${notification.title}: ${notification.message}`.substring(0, 160);
  } else {
    // Voice can be longer and more detailed
    message = `${notification.title}. ${notification.message}`;
  }

  return message;
};

/**
 * Send market price update via SMS
 */
export const sendMarketPriceNotification = async (
  phoneNumbers: string[],
  prices: Record<string, number>
): Promise<NotificationResult[]> => {
  const results: NotificationResult[] = [];

  const priceLines = Object.entries(prices)
    .map(([item, price]) => `${item}: ${price} NPR`)
    .join(', ');

  const message = `Market Update: ${priceLines}`;

  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendSMS(phoneNumber, message);
      results.push({
        alertId: 'market-price-update',
        recipient: phoneNumber,
        channel: 'sms',
        messageSid: result.messageSid,
        status: result.status,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      results.push({
        alertId: 'market-price-update',
        recipient: phoneNumber,
        channel: 'sms',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
};

/**
 * Send transport schedule update via SMS
 */
export const sendTransportNotification = async (
  phoneNumbers: string[],
  schedule: {
    route: string;
    nextDeparture: string;
    capacity?: number;
  }
): Promise<NotificationResult[]> => {
  const results: NotificationResult[] = [];

  const message = `Transport Update: ${schedule.route} - Next departure: ${schedule.nextDeparture}${schedule.capacity ? ` (${schedule.capacity} seats available)` : ''}`;

  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendSMS(phoneNumber, message);
      results.push({
        alertId: 'transport-update',
        recipient: phoneNumber,
        channel: 'sms',
        messageSid: result.messageSid,
        status: result.status,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      results.push({
        alertId: 'transport-update',
        recipient: phoneNumber,
        channel: 'sms',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return results;
};

/**
 * Send bulk notifications (for campaigns)
 */
export const sendBulkNotification = async (
  phoneNumbers: string[],
  message: string,
  channels: ('sms' | 'voice')[]
): Promise<NotificationResult[]> => {
  const results: NotificationResult[] = [];

  for (const phoneNumber of phoneNumbers) {
    for (const channel of channels) {
      try {
        let result: NotificationResult;

        if (channel === 'sms') {
          const smsResult = await sendSMS(phoneNumber, message);
          result = {
            alertId: 'bulk-notification',
            recipient: phoneNumber,
            channel: 'sms',
            messageSid: smsResult.messageSid,
            status: smsResult.status,
            timestamp: new Date().toISOString(),
          };
        } else {
          const voiceResult = await makeVoiceCall(
            phoneNumber,
            `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/twiml/main-menu`
          );
          result = {
            alertId: 'bulk-notification',
            recipient: phoneNumber,
            channel: 'voice',
            callSid: voiceResult.callSid,
            status: voiceResult.status,
            timestamp: new Date().toISOString(),
          };
        }

        results.push(result);
      } catch (error: any) {
        results.push({
          alertId: 'bulk-notification',
          recipient: phoneNumber,
          channel,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  return results;
};

export default {
  sendAlertNotifications,
  sendSMSAlert,
  makeVoiceAlertCall,
  constructAlertMessage,
  sendMarketPriceNotification,
  sendTransportNotification,
  sendBulkNotification,
};

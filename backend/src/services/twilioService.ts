// Twilio Voice Call Service (TypeScript)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioFactory = (() => {
  try {
    return require('twilio');
  } catch {
    return null;
  }
})();
const client = twilioFactory ? twilioFactory(accountSid, authToken) : null;

interface CallResult {
  success: boolean;
  callSid: string;
  to: string;
  status: string;
}

interface SMSResult {
  success: boolean;
  messageSid: string;
  to: string;
  status: string;
}

interface CallDetailsResult {
  success: boolean;
  callSid: string;
  to: string;
  from: string;
  status: string;
  duration: string | number;
  direction: string;
  startTime: string | Date | null;
  endTime: string | Date | null;
}

interface MessageDetailsResult {
  success: boolean;
  messageSid: string;
  to: string;
  from: string;
  body: string;
  status: string;
  dateSent: string | Date | null;
  dateUpdated: string | Date;
}

const getTwilioClient = () => {
  if (!client) {
    throw new Error('Twilio SDK is not installed. Run backend dependency install before using voice/SMS APIs.');
  }
  if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error('Twilio credentials are not configured in backend environment variables.');
  }
  return client;
};

/**
 * Make a voice call to a recipient
 * @param toNumber - Recipient's phone number (e.g., +9779862478859)
 * @param twimlUrl - TwiML URL for voice message or IVR
 * @returns Call result with SID
 */
export const makeVoiceCall = async (
  toNumber: string,
  twimlUrl: string = 'http://demo.twilio.com/docs/voice.xml'
): Promise<CallResult> => {
  try {
    const twilioClient = getTwilioClient();
    const call = await twilioClient.calls.create({
      url: twimlUrl,
      to: toNumber,
      from: twilioPhoneNumber,
    });
    console.log(`Voice call initiated: ${call.sid}`);
    return {
      success: true,
      callSid: call.sid,
      to: toNumber,
      status: call.status,
    };
  } catch (error: any) {
    console.error('Error making voice call:', error);
    throw new Error(`Failed to make voice call: ${error.message}`);
  }
};

/**
 * Send an SMS message
 * @param toNumber - Recipient's phone number
 * @param message - Message content
 * @returns Message result with SID
 */
export const sendSMS = async (toNumber: string, message: string): Promise<SMSResult> => {
  try {
    const twilioClient = getTwilioClient();
    const sms = await twilioClient.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: toNumber,
    });
    console.log(`SMS sent: ${sms.sid}`);
    return {
      success: true,
      messageSid: sms.sid,
      to: toNumber,
      status: sms.status,
    };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Get call details
 * @param callSid - Call SID
 * @returns Call details
 */
export const getCallDetails = async (callSid: string): Promise<CallDetailsResult> => {
  try {
    const twilioClient = getTwilioClient();
    const call = await twilioClient.calls(callSid).fetch();
    return {
      success: true,
      callSid: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      duration: call.duration,
      direction: call.direction,
      startTime: call.startTime,
      endTime: call.endTime,
    };
  } catch (error: any) {
    console.error('Error fetching call details:', error);
    throw new Error(`Failed to fetch call details: ${error.message}`);
  }
};

/**
 * Get SMS message details
 * @param messageSid - Message SID
 * @returns Message details
 */
export const getMessageDetails = async (messageSid: string): Promise<MessageDetailsResult> => {
  try {
    const twilioClient = getTwilioClient();
    const message = await twilioClient.messages(messageSid).fetch();
    return {
      success: true,
      messageSid: message.sid,
      to: message.to,
      from: message.from,
      body: message.body,
      status: message.status,
      dateSent: message.dateSent,
      dateUpdated: message.dateUpdated,
    };
  } catch (error: any) {
    console.error('Error fetching message details:', error);
    throw new Error(`Failed to fetch message details: ${error.message}`);
  }
};

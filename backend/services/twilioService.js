// Twilio Voice Call Service
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Make a voice call to a recipient
 * @param {string} toNumber - Recipient's phone number (e.g., +9779862478859)
 * @param {string} twimlUrl - TwiML URL for voice message or IVR
 * @returns {Promise} - Call SID
 */
const makeVoiceCall = async (toNumber, twimlUrl = 'http://demo.twilio.com/docs/voice.xml') => {
  try {
    const call = await client.calls.create({
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
  } catch (error) {
    console.error('Error making voice call:', error);
    throw new Error(`Failed to make voice call: ${error.message}`);
  }
};

/**
 * Send an SMS message
 * @param {string} toNumber - Recipient's phone number
 * @param {string} message - Message content
 * @returns {Promise} - Message SID
 */
const sendSMS = async (toNumber, message) => {
  try {
    const sms = await client.messages.create({
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
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

/**
 * Get call details
 * @param {string} callSid - Call SID
 * @returns {Promise} - Call details
 */
const getCallDetails = async (callSid) => {
  try {
    const call = await client.calls(callSid).fetch();
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
  } catch (error) {
    console.error('Error fetching call details:', error);
    throw new Error(`Failed to fetch call details: ${error.message}`);
  }
};

/**
 * Get SMS message details
 * @param {string} messageSid - Message SID
 * @returns {Promise} - Message details
 */
const getMessageDetails = async (messageSid) => {
  try {
    const message = await client.messages(messageSid).fetch();
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
  } catch (error) {
    console.error('Error fetching message details:', error);
    throw new Error(`Failed to fetch message details: ${error.message}`);
  }
};

module.exports = {
  makeVoiceCall,
  sendSMS,
  getCallDetails,
  getMessageDetails,
};

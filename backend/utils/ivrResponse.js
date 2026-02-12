/**
 * IVR Response Formatting
 * Creates properly formatted responses for different IVR providers (Twilio, Plivo, etc.)
 */

const { IVR_CONFIG } = require('../config/ivr');

/**
 * Format response for Twilio
 * @param {Object} params - Response parameters
 * @returns {Object} Twilio TwiML-like response
 */
function formatTwilioResponse({
  action = 'say',
  text = '',
  recordingUrl = null,
  digits = null,
  language = 'en',
  timeout = 5,
  endCallOnDigit = '#',
  numDigits = 1,
}) {
  const response = {
    action,
    language,
    timeout,
  };

  if (action === 'say') {
    response.text = text;
  } else if (action === 'gather') {
    response.text = text;
    response.numDigits = numDigits;
    response.timeout = timeout;
    response.finishOnKey = endCallOnDigit;
  } else if (action === 'play') {
    response.url = recordingUrl;
  } else if (action === 'record') {
    response.maxLength = 120; // seconds
    response.finishOnKey = endCallOnDigit;
  }

  return response;
}

/**
 * Format response for Plivo
 * @param {Object} params - Response parameters
 * @returns {Object} Plivo Response object
 */
function formatPlivoResponse({
  action = 'speak',
  text = '',
  recordingUrl = null,
  digits = null,
  language = 'en',
  timeout = 5,
  endCallOnDigit = '#',
  numDigits = 1,
}) {
  const response = {
    action,
    language,
  };

  if (action === 'speak') {
    response.text = text;
  } else if (action === 'get_digits') {
    response.text = text;
    response.numDigits = numDigits;
    response.timeout = timeout;
    response.finishOnKey = endCallOnDigit;
  } else if (action === 'play') {
    response.url = recordingUrl;
  } else if (action === 'record') {
    response.finishOnKey = endCallOnDigit;
    response.maxLength = 120;
    response.timeoutMs = timeout * 1000;
  }

  return response;
}

/**
 * Format response for Amazon Connect
 * @param {Object} params - Response parameters
 * @returns {Object} Amazon Connect response
 */
function formatAmazonConnectResponse({
  action = 'play_prompt',
  text = '',
  recordingUrl = null,
  digits = null,
  language = 'en',
  timeout = 5,
  endCallOnDigit = '#',
  numDigits = 1,
}) {
  const response = {
    action,
    language,
    timeout,
  };

  if (action === 'play_prompt') {
    response.text = text;
  } else if (action === 'get_user_input') {
    response.text = text;
    response.expectedDigits = numDigits;
    response.timeoutInSeconds = timeout;
    response.terminationDigit = endCallOnDigit;
  } else if (action === 'play_media') {
    response.mediaUrl = recordingUrl;
  } else if (action === 'start_recording') {
    response.maxDurationInSeconds = 120;
    response.terminationDigit = endCallOnDigit;
  }

  return response;
}

/**
 * Generic response formatter - auto-detects provider
 * @param {Object} params - Response parameters
 * @returns {Object} Provider-specific response
 */
function formatIVRResponse(params) {
  const provider = IVR_CONFIG.PROVIDER.toLowerCase();

  switch (provider) {
    case 'twilio':
      return formatTwilioResponse(params);
    case 'plivo':
      return formatPlivoResponse(params);
    case 'amazon-connect':
      return formatAmazonConnectResponse(params);
    default:
      throw new Error(`Unknown IVR provider: ${provider}`);
  }
}

/**
 * Create a menu prompt response
 * @param {Object} menu - Menu definition from IVR_MENUS
 * @param {string} menuName - Name of the menu
 * @param {string} language - Language preference
 * @returns {Object} IVR response ready to send
 */
function createMenuPromptResponse(menu, menuName, language = 'en') {
  if (!menu) {
    throw new Error(`Menu ${menuName} not found`);
  }

  const translatePrompt = (text, lang) => {
    // TODO: Implement proper translation
    // For now, return English text
    return text;
  };

  const promptText = translatePrompt(menu.prompt, language);

  return formatIVRResponse({
    action: 'gather',
    text: promptText,
    language,
    timeout: menu.timeout || 5,
    numDigits: 1,
    endCallOnDigit: '#',
  });
}

/**
 * Create a text-to-speech response
 * @param {string} text - Text to play
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createTextResponse(text, language = 'en') {
  return formatIVRResponse({
    action: 'say',
    text,
    language,
  });
}

/**
 * Create a recording request response
 * @param {number} maxDuration - Max recording duration in seconds
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createRecordingResponse(maxDuration = 120, language = 'en') {
  return formatIVRResponse({
    action: 'record',
    language,
    numDigits: 0, // Record until timeout or #
    timeout: maxDuration,
    endCallOnDigit: '#',
  });
}

/**
 * Create a playback response for audio/recording
 * @param {string} recordingUrl - URL of recording to play
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createPlaybackResponse(recordingUrl, language = 'en') {
  return formatIVRResponse({
    action: 'play',
    recordingUrl,
    language,
  });
}

/**
 * Create an error response
 * @param {string} errorMessage - Error message to play
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createErrorResponse(errorMessage = 'An error occurred. Please try again.', language = 'en') {
  return formatIVRResponse({
    action: 'say',
    text: errorMessage,
    language,
  });
}

/**
 * Create a "session timed out" response
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createTimeoutResponse(language = 'en') {
  const timeoutMessage = language === 'ne'
    ? 'समय समाप्त भयो। कृपया पुनः प्रयास गर्नुहोस्।'
    : 'Your session has timed out. Thank you for calling.';

  return formatIVRResponse({
    action: 'say',
    text: timeoutMessage,
    language,
  });
}

/**
 * Create a "goodbye" response
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createGoodbyeResponse(language = 'en') {
  const goodbyeMessage = language === 'ne'
    ? 'धन्यवाद कल गरिएकोको लागि। विलेज भ्वायस हबमा स्वागतम।'
    : 'Thank you for calling Village Voice Hub. Goodbye.';

  return formatIVRResponse({
    action: 'say',
    text: goodbyeMessage,
    language,
  });
}

/**
 * Create a confirmation response
 * @param {string} confirmationMessage - Message to confirm
 * @param {string} language - Language preference
 * @returns {Object} IVR response
 */
function createConfirmationResponse(confirmationMessage, language = 'en') {
  const confirmText = language === 'ne'
    ? `${confirmationMessage}। कृपया १ दबाएर पुष्टि गर्नुहोस्।`
    : `${confirmationMessage}. Press 1 to confirm.`;

  return formatIVRResponse({
    action: 'gather',
    text: confirmText,
    language,
    timeout: 10,
    numDigits: 1,
  });
}

/**
 * Create multiple responses (for sequential prompts)
 * @param {Array} responses - Array of response objects
 * @returns {Array} Formatted responses
 */
function createSequentialResponses(responses) {
  return responses.map((resp) => formatIVRResponse(resp));
}

module.exports = {
  formatIVRResponse,
  formatTwilioResponse,
  formatPlivoResponse,
  formatAmazonConnectResponse,
  createMenuPromptResponse,
  createTextResponse,
  createRecordingResponse,
  createPlaybackResponse,
  createErrorResponse,
  createTimeoutResponse,
  createGoodbyeResponse,
  createConfirmationResponse,
  createSequentialResponses,
};

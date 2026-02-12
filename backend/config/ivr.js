/**
 * IVR Configuration
 * Defines all menu structures and IVR behavior for the voice system
 */

const IVR_MENUS = {
  MAIN_MENU: {
    id: 'main_menu',
    name: 'Main Menu',
    prompt: 'Welcome to Village Voice Hub. Press 1 to report an issue or news. Press 2 to access information. Press 3 to hear community announcements.',
    timeout: 5,
    maxRetries: 3,
    options: {
      '1': { nextMenu: 'report_menu', action: 'report' },
      '2': { nextMenu: 'info_menu', action: 'info' },
      '3': { nextMenu: 'announcements_menu', action: 'announcements' },
      '0': { nextMenu: 'help_menu', action: 'help' },
    },
  },

  REPORT_MENU: {
    id: 'report_menu',
    name: 'Report Submission',
    prompt: 'You can report an issue or news. Press 1 to record a voice message. Press 2 to select a category. Press 0 to go back.',
    timeout: 5,
    maxRetries: 3,
    options: {
      '1': { nextMenu: 'record_message', action: 'start_recording', recordingDuration: 120 },
      '2': { nextMenu: 'category_menu', action: 'select_category' },
      '0': { nextMenu: 'main_menu', action: 'back' },
    },
  },

  CATEGORY_MENU: {
    id: 'category_menu',
    name: 'Report Category',
    prompt: 'Select a category. Press 1 for Health. Press 2 for Transportation. Press 3 for Markets. Press 4 for Other. Press 0 to go back.',
    timeout: 5,
    maxRetries: 3,
    options: {
      '1': { category: 'health', nextMenu: 'report_menu', action: 'category_selected' },
      '2': { category: 'transportation', nextMenu: 'report_menu', action: 'category_selected' },
      '3': { category: 'markets', nextMenu: 'report_menu', action: 'category_selected' },
      '4': { category: 'other', nextMenu: 'report_menu', action: 'category_selected' },
      '0': { nextMenu: 'report_menu', action: 'back' },
    },
  },

  RECORD_MESSAGE: {
    id: 'record_message',
    name: 'Voice Recording',
    prompt: 'Please record your message after the beep. Press # when done.',
    timeout: 120,
    maxRetries: 1,
    options: {
      '#': { action: 'stop_recording', nextMenu: 'confirm_submission' },
    },
  },

  CONFIRM_SUBMISSION: {
    id: 'confirm_submission',
    name: 'Confirm Report',
    prompt: 'Press 1 to submit your report. Press 2 to re-record. Press 0 to cancel.',
    timeout: 10,
    maxRetries: 2,
    options: {
      '1': { action: 'submit_report', nextMenu: 'submission_confirmed' },
      '2': { action: 'retry_recording', nextMenu: 'record_message' },
      '0': { action: 'cancel', nextMenu: 'main_menu' },
    },
  },

  SUBMISSION_CONFIRMED: {
    id: 'submission_confirmed',
    name: 'Report Submitted',
    prompt: 'Thank you! Your report has been submitted. Moderators will review it shortly. Press 1 to return to main menu.',
    timeout: 5,
    maxRetries: 1,
    options: {
      '1': { nextMenu: 'main_menu', action: 'return_main' },
    },
  },

  INFO_MENU: {
    id: 'info_menu',
    name: 'Information Access',
    prompt: 'Select information to access. Press 1 for local alerts. Press 2 for transport updates. Press 3 for market prices. Press 0 to go back.',
    timeout: 5,
    maxRetries: 3,
    options: {
      '1': { nextMenu: 'alerts_list', action: 'get_alerts' },
      '2': { nextMenu: 'transport_info', action: 'get_transport' },
      '3': { nextMenu: 'market_prices', action: 'get_prices' },
      '0': { nextMenu: 'main_menu', action: 'back' },
    },
  },

  ALERTS_LIST: {
    id: 'alerts_list',
    name: 'Local Alerts',
    prompt: 'Loading local alerts...',
    timeout: 5,
    maxRetries: 2,
    options: {
      '1': { action: 'play_alert_1', nextMenu: 'alerts_list' },
      '2': { action: 'play_alert_2', nextMenu: 'alerts_list' },
      '3': { action: 'play_alert_3', nextMenu: 'alerts_list' },
      '0': { nextMenu: 'info_menu', action: 'back' },
    },
  },

  TRANSPORT_INFO: {
    id: 'transport_info',
    name: 'Transport Updates',
    prompt: 'Select transport type. Press 1 for buses. Press 2 for trains. Press 0 to go back.',
    timeout: 5,
    maxRetries: 2,
    options: {
      '1': { type: 'bus', action: 'get_bus_info', nextMenu: 'transport_details' },
      '2': { type: 'train', action: 'get_train_info', nextMenu: 'transport_details' },
      '0': { nextMenu: 'info_menu', action: 'back' },
    },
  },

  TRANSPORT_DETAILS: {
    id: 'transport_details',
    name: 'Transport Details',
    prompt: 'Playing transport information...',
    timeout: 5,
    maxRetries: 1,
    options: {
      '1': { action: 'repeat_info', nextMenu: 'transport_details' },
      '2': { action: 'next_info', nextMenu: 'transport_details' },
      '0': { nextMenu: 'info_menu', action: 'back' },
    },
  },

  MARKET_PRICES: {
    id: 'market_prices',
    name: 'Market Prices',
    prompt: 'Press 1 for vegetable prices. Press 2 for grain prices. Press 0 to go back.',
    timeout: 5,
    maxRetries: 2,
    options: {
      '1': { category: 'vegetables', action: 'get_prices', nextMenu: 'price_details' },
      '2': { category: 'grains', action: 'get_prices', nextMenu: 'price_details' },
      '0': { nextMenu: 'info_menu', action: 'back' },
    },
  },

  PRICE_DETAILS: {
    id: 'price_details',
    name: 'Price Details',
    prompt: 'Playing market price information...',
    timeout: 5,
    maxRetries: 1,
    options: {
      '1': { action: 'repeat_prices', nextMenu: 'price_details' },
      '0': { nextMenu: 'market_prices', action: 'back' },
    },
  },

  ANNOUNCEMENTS_MENU: {
    id: 'announcements_menu',
    name: 'Community Announcements',
    prompt: 'Community announcements. Press 1 to listen. Press 0 to go back.',
    timeout: 5,
    maxRetries: 2,
    options: {
      '1': { action: 'play_announcements', nextMenu: 'announcements_menu' },
      '0': { nextMenu: 'main_menu', action: 'back' },
    },
  },

  HELP_MENU: {
    id: 'help_menu',
    name: 'Help',
    prompt: 'Help section. Press 1 to hear menu instructions. Press 2 for support contact. Press 0 to return to main menu.',
    timeout: 5,
    maxRetries: 2,
    options: {
      '1': { action: 'play_instructions', nextMenu: 'help_menu' },
      '2': { action: 'play_support_contact', nextMenu: 'help_menu' },
      '0': { nextMenu: 'main_menu', action: 'back' },
    },
  },
};

const IVR_CONFIG = {
  // Provider: 'twilio' | 'plivo' | 'amazon-connect'
  PROVIDER: process.env.IVR_PROVIDER || 'twilio',

  // Twilio Configuration
  TWILIO: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Plivo Configuration
  PLIVO: {
    authId: process.env.PLIVO_AUTH_ID,
    authToken: process.env.PLIVO_AUTH_TOKEN,
    phoneNumber: process.env.PLIVO_PHONE_NUMBER,
  },

  // Amazon Connect Configuration
  AMAZON_CONNECT: {
    instanceId: process.env.AMAZON_CONNECT_INSTANCE_ID,
    contactFlowId: process.env.AMAZON_CONNECT_FLOW_ID,
  },

  // IVR Behavior
  DEFAULT_LANGUAGE: process.env.IVR_LANGUAGE || 'en',
  SUPPORTED_LANGUAGES: ['en', 'ne'], // English and Nepali
  DEFAULT_TIMEOUT: 5,
  MAX_RETRIES: 3,
  RECORDING_MAX_DURATION: 120, // 2 minutes
  SESSION_TIMEOUT: 3600, // 1 hour

  // Audio Settings
  AUDIO: {
    format: 'wav',
    sampleRate: 8000,
    bitDepth: 16,
    channels: 1,
  },

  // Response Format
  USE_TEXT_TO_SPEECH: true,
  TTS_PROVIDER: process.env.TTS_PROVIDER || 'google', // google | aws
};

module.exports = {
  IVR_MENUS,
  IVR_CONFIG,
};

// TwiML IVR Handler
// Generates TwiML responses for voice call menus
import { Router, Request, Response } from 'express';

const router = Router();

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toAbsoluteUrl = (req: Request, url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    return `${req.protocol}://${req.get('host')}${url}`;
  }
  return `${req.protocol}://${req.get('host')}/${url}`;
};

/**
 * GET /api/twiml/play
 * Play a hosted audio file via Twilio
 */
router.get('/play', (req: Request, res: Response) => {
  const audioUrl = typeof req.query.audioUrl === 'string' ? req.query.audioUrl : '';

  if (!audioUrl) {
    return res.status(400).json({
      success: false,
      message: 'audioUrl is required',
    });
  }

  const absoluteUrl = toAbsoluteUrl(req, audioUrl);
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${escapeXml(absoluteUrl)}</Play>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * GET /api/twiml/main-menu
 * Main IVR menu with options
 */
router.get('/main-menu', (req: Request, res: Response) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to Voice Link. Our system is experiencing an issue. Please try again later.</Say>
  <Gather numDigits="1" action="/api/twiml/handle-menu" method="POST">
    <Say voice="alice">
      Press 1 for market prices.
      Press 2 for transport schedules.
      Press 3 for local alerts.
      Press 4 to leave a voice message.
    </Say>
  </Gather>
  <Say voice="alice">We did not receive your input. Please try again.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * POST /api/twiml/handle-menu
 * Handle user input from main menu
 */
router.post('/handle-menu', (req: Request, res: Response) => {
  const digits = req.body.Digits;

  let twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>`;

  switch (digits) {
    case '1':
      twiml += `
  <Say voice="alice">You selected market prices.</Say>
  <Say voice="alice">The current market prices are:</Say>
  <Say voice="alice">Rice: 50 rupees per kilogram.</Say>
  <Say voice="alice">Wheat: 45 rupees per kilogram.</Say>
  <Say voice="alice">Corn: 30 rupees per kilogram.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>`;
      break;

    case '2':
      twiml += `
  <Say voice="alice">You selected transport schedules.</Say>
  <Say voice="alice">The next bus to kathmandu departs at 10 AM.</Say>
  <Say voice="alice">The next bus to pokhara departs at 2 PM.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>`;
      break;

    case '3':
      twiml += `
  <Say voice="alice">You selected local alerts.</Say>
  <Say voice="alice">There is a heavy rainfall alert in effect until 6 PM today.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>`;
      break;

    case '4':
      twiml += `
  <Say voice="alice">You selected voice message. Please record your message after the beep. Press any key when finished.</Say>
  <Record 
    action="/api/twiml/save-voicemail" 
    method="POST"
    maxLength="60"
    finishOnKey="*"
  />
  <Say voice="alice">Thank you for your message.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>`;
      break;

    default:
      twiml += `
  <Say voice="alice">Invalid selection. Please try again.</Say>
  <Redirect>/api/twiml/main-menu</Redirect>`;
  }

  twiml += '\n</Response>';

  res.type('text/xml').send(twiml);
});

/**
 * POST /api/twiml/save-voicemail
 * Handle voicemail recording
 */
router.post('/save-voicemail', (req: Request, res: Response) => {
  const recordingUrl = req.body.RecordingUrl;
  const callSid = req.body.CallSid;
  const from = req.body.From;

  // Log voicemail details
  console.log('Voicemail received:');
  console.log(`  From: ${from}`);
  console.log(`  Call SID: ${callSid}`);
  console.log(`  Recording URL: ${recordingUrl}`);

  // TODO: Save voicemail metadata to database
  // TODO: Send notification to moderators
  // TODO: Trigger email/SMS alert

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Your voicemail has been saved. Thank you for contacting us.</Say>
  <Hangup/>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * GET /api/twiml/alert-notification
 * Send alert notification via voice call
 */
router.get('/alert-notification', (req: Request, res: Response) => {
  const { alertType = 'general', message = 'You have an important alert' } = req.query;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Important ${alertType} alert:</Say>
  <Say voice="alice">${message}</Say>
  <Say voice="alice">Press 1 to acknowledge, press 2 to hear this message again.</Say>
  <Gather numDigits="1" action="/api/twiml/acknowledge-alert" method="POST">
    <Say voice="alice">Press any key to acknowledge and hang up.</Say>
  </Gather>
  <Hangup/>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * POST /api/twiml/acknowledge-alert
 * Handle alert acknowledgment
 */
router.post('/acknowledge-alert', (req: Request, res: Response) => {
  const digits = req.body.Digits;
  const callSid = req.body.CallSid;

  console.log(`Alert acknowledged by ${req.body.From} - Call SID: ${callSid}`);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you. This alert has been acknowledged. Goodbye.</Say>
  <Hangup/>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * GET /api/twiml/market-price-notification
 * Send market price update via voice call
 */
router.get('/market-price-notification', (req: Request, res: Response) => {
  const {
    rice = '50',
    wheat = '45',
    corn = '30',
  } = req.query;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Market Price Update.</Say>
  <Say voice="alice">Rice: ${rice} rupees per kilogram.</Say>
  <Say voice="alice">Wheat: ${wheat} rupees per kilogram.</Say>
  <Say voice="alice">Corn: ${corn} rupees per kilogram.</Say>
  <Say voice="alice">Press 1 to repeat these prices, or press any other key to hang up.</Say>
  <Gather numDigits="1" action="/api/twiml/repeat-prices" method="POST">
    <Say voice="alice">Please press a key.</Say>
  </Gather>
  <Hangup/>
</Response>`;

  res.type('text/xml').send(twiml);
});

/**
 * POST /api/twiml/repeat-prices
 * Handle price inquiry repeat
 */
router.post('/repeat-prices', (req: Request, res: Response) => {
  const digits = req.body.Digits;

  if (digits === '1') {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Rice: 50 rupees per kilogram.</Say>
  <Say voice="alice">Wheat: 45 rupees per kilogram.</Say>
  <Say voice="alice">Corn: 30 rupees per kilogram.</Say>
  <Hangup/>
</Response>`;
    res.type('text/xml').send(twiml);
  } else {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Goodbye.</Say>
  <Hangup/>
</Response>`;
    res.type('text/xml').send(twiml);
  }
});

/**
 * GET /api/twiml/hangup
 * Simple hangup response
 */
router.get('/hangup', (req: Request, res: Response) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you for calling. Goodbye.</Say>
  <Hangup/>
</Response>`;

  res.type('text/xml').send(twiml);
});

export default router;

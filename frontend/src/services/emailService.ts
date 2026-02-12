import emailjs from '@emailjs/browser';

// EmailJS configuration - MUST be loaded from environment variables
// Sign up at https://www.emailjs.com/ to get your keys
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_MODERATOR_CREDENTIALS_TEMPLATE = import.meta.env.VITE_EMAILJS_MODERATOR_TEMPLATE;
const EMAILJS_CONTRIBUTOR_WELCOME_TEMPLATE = import.meta.env.VITE_EMAILJS_CONTRIBUTOR_TEMPLATE;
const EMAILJS_ALERT_ACCEPTED_TEMPLATE = import.meta.env.VITE_EMAILJS_ALERT_ACCEPTED_TEMPLATE;
const EMAILJS_ALERT_REJECTED_TEMPLATE = import.meta.env.VITE_EMAILJS_ALERT_REJECTED_TEMPLATE;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Validate EmailJS configuration
if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID) {
  console.warn('⚠️ EmailJS configuration incomplete. Email notifications will be disabled.');
  console.warn('Required env vars: VITE_EMAILJS_PUBLIC_KEY, VITE_EMAILJS_SERVICE_ID');
}

// Initialize EmailJS only if public key is available
if (EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

export const sendCredentialsEmail = async (params: {
  email: string;
  fullName: string;
  idp: string;
  password: string;
}) => {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_MODERATOR_CREDENTIALS_TEMPLATE) {
    console.warn('⚠️ EmailJS not configured. Skipping email notification.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send email using EmailJS - Moderator Credentials Template
    const templateParams = {
      to_email: params.email,
      to_name: params.fullName,
      application_id: params.idp,
      password: params.password,
      from_name: 'Village Voice Hub',
    };
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_MODERATOR_CREDENTIALS_TEMPLATE,
      templateParams
    );
    console.log('✅ Moderator credentials email sent successfully');
    
    return { success: true, emailId: response.text };
  } catch (error) {
    console.error('❌ Failed to send moderator credentials email:', error instanceof Error ? error.message : String(error));
    // Don't throw error - just log it and continue
    // This allows the application to still be submitted even if email fails
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendContributorWelcomeEmail = async (params: {
  email: string;
  name: string;
  village: string;
  province: string;
}) => {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_CONTRIBUTOR_WELCOME_TEMPLATE) {
    console.warn('⚠️ EmailJS not configured. Skipping email notification.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send email using EmailJS - Contributor Welcome Template
    const templateParams = {
      to_email: params.email,
      to_name: params.name,
      village: params.village,
      province: params.province,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_CONTRIBUTOR_WELCOME_TEMPLATE,
      templateParams
    );

    console.log('✅ Contributor welcome email sent successfully');
    
    return { success: true, emailId: response.text };
  } catch (error) {
    console.error('❌ Failed to send contributor welcome email:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendAlertAcceptedEmail = async (params: {
  email: string;
  name: string;
  alertSummary?: string;
  village?: string;
  province?: string;
}) => {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_ALERT_ACCEPTED_TEMPLATE) {
    console.warn('⚠️ EmailJS not configured. Skipping email notification.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send email using EmailJS - Alert Accepted Template
    const templateParams = {
      to_email: params.email,
      to_name: params.name,
      alert_summary: params.alertSummary || 'Your submitted alert',
      village: params.village || '',
      province: params.province || '',
      status: 'Accepted',
      from_name: 'Village Voice Hub',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ALERT_ACCEPTED_TEMPLATE,
      templateParams
    );

    console.log('✅ Alert accepted notification sent');
    
    return { success: true, emailId: response.text };
  } catch (error) {
    console.error('❌ Failed to send alert accepted email:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const sendAlertRejectedEmail = async (params: {
  email: string;
  name: string;
  alertSummary?: string;
  reason?: string;
  village?: string;
  province?: string;
}) => {
  // Check if EmailJS is configured
  if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_ALERT_REJECTED_TEMPLATE) {
    console.warn('⚠️ EmailJS not configured. Skipping email notification.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    // Send email using EmailJS - Alert Rejected Template
    const templateParams = {
      to_email: params.email,
      to_name: params.name,
      alert_summary: params.alertSummary || 'Your submitted alert',
      rejection_reason: params.reason || 'Moderator review',
      village: params.village || '',
      province: params.province || '',
      status: 'Rejected',
      from_name: 'Village Voice Hub',
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_ALERT_REJECTED_TEMPLATE,
      templateParams
    );

    console.log('✅ Alert rejected notification sent');
    
    return { success: true, emailId: response.text };
  } catch (error) {
    console.error('❌ Failed to send alert rejected email:', error instanceof Error ? error.message : String(error));
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

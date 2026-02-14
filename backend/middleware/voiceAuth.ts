// Voice API Authentication Middleware
// Protects voice and SMS endpoints
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
  };
  token?: string;
}

/**
 * Verify JWT token
 */
export const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key') as {
      uid: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Check if user has required role
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Rate limiting for voice/SMS endpoints
 * Prevents abuse and excessive costs
 */
const callLimits = new Map<string, { count: number; resetTime: number }>();

export const voiceRateLimit = (
  maxCalls: number = 10,
  timeWindowMs: number = 3600000 // 1 hour
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.uid || req.ip || 'anonymous';
    const now = Date.now();

    if (!callLimits.has(userId)) {
      callLimits.set(userId, { count: 1, resetTime: now + timeWindowMs });
      next();
      return;
    }

    const userLimit = callLimits.get(userId)!;

    if (now > userLimit.resetTime) {
      // Reset the counter
      callLimits.set(userId, { count: 1, resetTime: now + timeWindowMs });
      next();
      return;
    }

    if (userLimit.count >= maxCalls) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Maximum ${maxCalls} calls per hour.`,
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
      });
    }

    userLimit.count += 1;
    next();
  };
};

/**
 * Validate phone number format
 */
export const validatePhoneNumber = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { toNumber } = req.body;

  if (!toNumber) {
    return res.status(400).json({
      success: false,
      message: 'toNumber is required',
    });
  }

  // E.164 format validation: +[Country Code][Number]
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  const cleanNumber = toNumber.replace(/\D/g, '');

  if (!phoneRegex.test(cleanNumber)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid phone number format. Use E.164 format (e.g., +9779862478859)',
    });
  }

  next();
};

/**
 * Validate SMS message content
 */
export const validateSMSContent = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Message content is required and must be a string',
    });
  }

  if (message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty',
    });
  }

  if (message.length > 1600) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot exceed 1600 characters',
    });
  }

  next();
};

/**
 * Validate TwiML URL
 */
export const validateTwimlUrl = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { twimlUrl } = req.body;

  if (!twimlUrl) {
    return res.status(400).json({
      success: false,
      message: 'twimlUrl is required',
    });
  }

  try {
    new URL(twimlUrl);
  } catch {
    return res.status(400).json({
      success: false,
      message: 'Invalid TwiML URL format',
    });
  }

  next();
};

/**
 * Log voice/SMS activity
 */
export const logVoiceActivity = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const userId = req.user?.uid || 'anonymous';
  const endpoint = req.path;
  const method = req.method;

  console.log(`[${timestamp}] ${method} ${endpoint} - User: ${userId} - IP: ${req.ip}`);

  // TODO: Save to database for audit logging
  next();
};

export default {
  verifyToken,
  requireRole,
  voiceRateLimit,
  validatePhoneNumber,
  validateSMSContent,
  validateTwimlUrl,
  logVoiceActivity,
};

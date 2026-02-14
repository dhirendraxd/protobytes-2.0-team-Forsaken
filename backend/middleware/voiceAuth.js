"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logVoiceActivity = exports.validateTwimlUrl = exports.validateSMSContent = exports.validatePhoneNumber = exports.voiceRateLimit = exports.requireRole = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Verify JWT token
 */
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No authorization token provided',
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        req.user = decoded;
        req.token = token;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
exports.verifyToken = verifyToken;
/**
 * Check if user has required role
 */
const requireRole = (roles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
/**
 * Rate limiting for voice/SMS endpoints
 * Prevents abuse and excessive costs
 */
const callLimits = new Map();
const voiceRateLimit = (maxCalls = 10, timeWindowMs = 3600000 // 1 hour
) => {
    return (req, res, next) => {
        const userId = req.user?.uid || req.ip || 'anonymous';
        const now = Date.now();
        if (!callLimits.has(userId)) {
            callLimits.set(userId, { count: 1, resetTime: now + timeWindowMs });
            next();
            return;
        }
        const userLimit = callLimits.get(userId);
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
exports.voiceRateLimit = voiceRateLimit;
/**
 * Validate phone number format
 */
const validatePhoneNumber = (req, res, next) => {
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
exports.validatePhoneNumber = validatePhoneNumber;
/**
 * Validate SMS message content
 */
const validateSMSContent = (req, res, next) => {
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
exports.validateSMSContent = validateSMSContent;
/**
 * Validate TwiML URL
 */
const validateTwimlUrl = (req, res, next) => {
    const { twimlUrl } = req.body;
    if (!twimlUrl) {
        return res.status(400).json({
            success: false,
            message: 'twimlUrl is required',
        });
    }
    try {
        new URL(twimlUrl);
    }
    catch {
        return res.status(400).json({
            success: false,
            message: 'Invalid TwiML URL format',
        });
    }
    next();
};
exports.validateTwimlUrl = validateTwimlUrl;
/**
 * Log voice/SMS activity
 */
const logVoiceActivity = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const userId = req.user?.uid || 'anonymous';
    const endpoint = req.path;
    const method = req.method;
    console.log(`[${timestamp}] ${method} ${endpoint} - User: ${userId} - IP: ${req.ip}`);
    // TODO: Save to database for audit logging
    next();
};
exports.logVoiceActivity = logVoiceActivity;
exports.default = {
    verifyToken: exports.verifyToken,
    requireRole: exports.requireRole,
    voiceRateLimit: exports.voiceRateLimit,
    validatePhoneNumber: exports.validatePhoneNumber,
    validateSMSContent: exports.validateSMSContent,
    validateTwimlUrl: exports.validateTwimlUrl,
    logVoiceActivity: exports.logVoiceActivity,
};

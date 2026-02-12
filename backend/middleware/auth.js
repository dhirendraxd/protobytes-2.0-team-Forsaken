const admin = require('../config/firebase-admin');

/**
 * Middleware to verify Firebase authentication token
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const user = await admin.auth().getUser(req.user.uid);
    
    if (user.customClaims?.admin !== true) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(500).json({ error: 'Error verifying admin status' });
  }
};

/**
 * Middleware to check if user is moderator or admin
 */
const isModerator = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user found' });
    }

    const user = await admin.auth().getUser(req.user.uid);
    
    if (user.customClaims?.moderator !== true && user.customClaims?.admin !== true) {
      return res.status(403).json({ error: 'Forbidden: Moderator access required' });
    }

    next();
  } catch (error) {
    console.error('Moderator verification error:', error);
    return res.status(500).json({ error: 'Error verifying moderator status' });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isModerator,
};

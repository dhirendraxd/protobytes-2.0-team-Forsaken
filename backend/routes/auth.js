const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

// POST /api/auth/verify - Verify authentication token
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    authenticated: true,
    user: req.user,
  });
});

// POST /api/auth/set-claims - Set custom claims for user (Admin only)
router.post('/set-claims', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { uid, claims } = req.body;

    if (!uid || !claims) {
      return res.status(400).json({ error: 'UID and claims are required' });
    }

    await admin.auth().setCustomUserClaims(uid, claims);

    res.json({
      message: 'Custom claims set successfully',
      uid,
      claims,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/user/:uid - Get user details (Admin only)
router.get('/user/:uid', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { uid } = req.params;
    const user = await admin.auth().getUser(uid);

    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims || {},
      disabled: user.disabled,
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

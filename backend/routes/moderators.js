const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

const db = admin.firestore();

// GET /api/moderators - Fetch all moderator applications
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = db.collection('moderators').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(parseInt(limit)).get();

    const moderators = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ moderators, count: moderators.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/moderators/:id - Get a specific moderator application
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('moderators').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Moderator application not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// POST /api/moderators - Apply as moderator
router.post('/', async (req, res, next) => {
  try {
    const { name, email, experience, availability, motivation, userId } = req.body;

    // Validation
    if (!name || !email || !experience || !motivation) {
      return res.status(400).json({
        error: 'Name, email, experience, and motivation are required',
      });
    }

    const moderatorData = {
      name,
      email,
      experience,
      availability: availability || 'flexible',
      motivation,
      userId: userId || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('moderators').add(moderatorData);

    res.status(201).json({ id: docRef.id, ...moderatorData });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/moderators/:id - Update moderator status (Admin only)
router.patch('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    await db.collection('moderators').doc(id).update(updateData);

    // If approved, set custom claims
    if (status === 'approved') {
      const doc = await db.collection('moderators').doc(id).get();
      const data = doc.data();
      
      if (data.userId) {
        await admin.auth().setCustomUserClaims(data.userId, {
          moderator: true,
        });
      }
    }

    res.json({ id, ...updateData });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/moderators/:id - Delete moderator application (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('moderators').doc(id).delete();

    res.json({ message: 'Moderator application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

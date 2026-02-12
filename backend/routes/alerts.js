const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

const db = admin.firestore();

// GET /api/alerts - Fetch all alerts
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50, category } = req.query;

    let query = db.collection('alerts').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.limit(parseInt(limit)).get();

    const alerts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ alerts, count: alerts.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/alerts/:id - Get a specific alert
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('alerts').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// POST /api/alerts - Create a new alert
router.post('/', async (req, res, next) => {
  try {
    const { title, description, location, category, anonymous, userId } = req.body;

    // Validation
    if (!title || !description || !location) {
      return res.status(400).json({
        error: 'Title, description, and location are required',
      });
    }

    const alertData = {
      title,
      description,
      location,
      category: category || 'other',
      status: 'pending',
      anonymous: anonymous || false,
      userId: anonymous ? null : userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
    };

    const docRef = await db.collection('alerts').add(alertData);

    res.status(201).json({ id: docRef.id, ...alertData });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/alerts/:id - Update an alert
router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // Don't allow updating certain fields
    delete updateData.createdAt;
    delete updateData.userId;

    await db.collection('alerts').doc(id).update(updateData);

    res.json({ id, ...updateData });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/alerts/:id - Delete an alert
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('alerts').doc(id).delete();

    res.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/alerts/:id/vote - Vote on an alert
router.post('/:id/vote', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { voteType, userId } = req.body;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const alertRef = db.collection('alerts').doc(id);
    const doc = await alertRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    const data = doc.data();
    const field = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    const increment = 1;

    await alertRef.update({
      [field]: (data[field] || 0) + increment,
      updatedAt: new Date().toISOString(),
    });

    // Log the vote
    await db.collection('alert_votes').add({
      alertId: id,
      userId,
      voteType,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

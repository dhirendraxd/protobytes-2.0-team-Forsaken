const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

const db = admin.firestore();

// GET /api/transport - Fetch transport schedules
router.get('/', async (req, res, next) => {
  try {
    const { route, type, limit = 50 } = req.query;

    let query = db.collection('transport').orderBy('departureTime', 'asc');

    if (route) {
      query = query.where('route', '==', route);
    }

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.limit(parseInt(limit)).get();

    const schedules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ schedules, count: schedules.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/transport/:id - Get a specific transport schedule
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('transport').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Transport schedule not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// POST /api/transport - Add transport schedule
router.post('/', async (req, res, next) => {
  try {
    const { route, type, departureTime, arrivalTime, fare, operator } = req.body;

    // Validation
    if (!route || !type || !departureTime) {
      return res.status(400).json({
        error: 'Route, type, and departure time are required',
      });
    }

    const scheduleData = {
      route,
      type,
      departureTime,
      arrivalTime: arrivalTime || null,
      fare: fare ? parseFloat(fare) : null,
      operator: operator || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('transport').add(scheduleData);

    res.status(201).json({ id: docRef.id, ...scheduleData });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/transport/:id - Update transport schedule
router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // Don't allow updating createdAt
    delete updateData.createdAt;

    await db.collection('transport').doc(id).update(updateData);

    res.json({ id, ...updateData });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/transport/:id - Delete transport schedule
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('transport').doc(id).delete();

    res.json({ message: 'Transport schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

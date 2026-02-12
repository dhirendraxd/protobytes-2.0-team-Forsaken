const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

const db = admin.firestore();

// GET /api/contributors - Fetch all contributors
router.get('/', async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;

    let query = db.collection('contributors').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.limit(parseInt(limit)).get();

    const contributors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ contributors, count: contributors.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/contributors/:id - Get a specific contributor
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('contributors').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Contributor not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// POST /api/contributors - Apply as contributor
router.post('/', async (req, res, next) => {
  try {
    const { name, email, phone, expertise, reason, userId } = req.body;

    // Validation
    if (!name || !email || !expertise || !reason) {
      return res.status(400).json({
        error: 'Name, email, expertise, and reason are required',
      });
    }

    const contributorData = {
      name,
      email,
      phone: phone || null,
      expertise,
      reason,
      userId: userId || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('contributors').add(contributorData);

    res.status(201).json({ id: docRef.id, ...contributorData });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/contributors/:id - Update contributor status (Admin only)
router.patch('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    await db.collection('contributors').doc(id).update(updateData);

    res.json({ id, ...updateData });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contributors/:id - Delete contributor application (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('contributors').doc(id).delete();

    res.json({ message: 'Contributor application deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

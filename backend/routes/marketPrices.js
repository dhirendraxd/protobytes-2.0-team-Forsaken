const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const admin = require('../config/firebase-admin');

const db = admin.firestore();

// GET /api/market-prices - Fetch market prices
router.get('/', async (req, res, next) => {
  try {
    const { category, limit = 50, location } = req.query;

    let query = db.collection('marketPrices').orderBy('updatedAt', 'desc');

    if (category) {
      query = query.where('category', '==', category);
    }

    if (location) {
      query = query.where('location', '==', location);
    }

    const snapshot = await query.limit(parseInt(limit)).get();

    const prices = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ prices, count: prices.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/market-prices/:id - Get a specific market price
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('marketPrices').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Market price not found' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    next(error);
  }
});

// POST /api/market-prices - Add/update market price
router.post('/', async (req, res, next) => {
  try {
    const { item, price, unit, category, location, userId } = req.body;

    // Validation
    if (!item || !price || !unit) {
      return res.status(400).json({
        error: 'Item, price, and unit are required',
      });
    }

    const priceData = {
      item,
      price: parseFloat(price),
      unit,
      category: category || 'other',
      location: location || 'Unknown',
      userId: userId || null,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection('marketPrices').add(priceData);

    res.status(201).json({ id: docRef.id, ...priceData });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/market-prices/:id - Update market price
router.patch('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, location } = req.body;

    const updateData = {
      updatedAt: new Date().toISOString(),
    };

    if (price !== undefined) updateData.price = parseFloat(price);
    if (location) updateData.location = location;

    await db.collection('marketPrices').doc(id).update(updateData);

    res.json({ id, ...updateData });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/market-prices/:id - Delete market price
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.collection('marketPrices').doc(id).delete();

    res.json({ message: 'Market price deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

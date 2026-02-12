const express = require('express');
const router = express.Router();

// Mock data storage (replace with actual database)
let briefings = [];
let categories = [
  { id: '1', name: 'Safety Updates', description: 'Emergency alerts and safety information', order: 1, active: true },
  { id: '2', name: 'Market Prices', description: 'Current agricultural commodity prices', order: 2, active: true },
  { id: '3', name: 'Community Notices', description: 'Local news and community announcements', order: 3, active: true },
  { id: '4', name: 'Transport Updates', description: 'Road conditions and transport schedules', order: 4, active: true }
];
let smsAlerts = [];
let submissions = [];

// Briefings Routes
router.get('/briefings', async (req, res) => {
  try {
    res.json({ success: true, data: briefings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/briefings', async (req, res) => {
  try {
    const briefing = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.uid || 'system'
    };
    briefings.push(briefing);
    res.json({ success: true, data: briefing });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/briefings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = briefings.findIndex(b => b.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Briefing not found' });
    }
    briefings[index] = { ...briefings[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json({ success: true, data: briefings[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/briefings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    briefings = briefings.filter(b => b.id !== id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Categories Routes
router.get('/categories', async (req, res) => {
  try {
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const category = {
      id: Date.now().toString(),
      ...req.body,
      order: categories.length + 1
    };
    categories.push(category);
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    categories[index] = { ...categories[index], ...req.body };
    res.json({ success: true, data: categories[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SMS Alerts Routes
router.post('/sms-alerts', async (req, res) => {
  try {
    const alert = {
      id: Date.now().toString(),
      ...req.body,
      sentAt: new Date().toISOString(),
      sentBy: req.user?.uid || 'system',
      status: 'sent'
    };
    smsAlerts.push(alert);
    
    // TODO: Integrate with actual SMS service (Twilio, AWS SNS, etc.)
    
    res.json({ 
      success: true, 
      data: alert,
      message: `SMS sent to ${alert.recipientCount} users in ${alert.region}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/sms-alerts', async (req, res) => {
  try {
    res.json({ success: true, data: smsAlerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Content Submissions Routes
router.get('/submissions', async (req, res) => {
  try {
    const { status } = req.query;
    const filtered = status ? submissions.filter(s => s.status === status) : submissions;
    res.json({ success: true, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/submissions', async (req, res) => {
  try {
    const submission = {
      id: Date.now().toString(),
      ...req.body,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      submittedBy: req.user?.uid || 'anonymous'
    };
    submissions.push(submission);
    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/submissions/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    
    submissions[index] = {
      ...submissions[index],
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: req.user?.uid || 'system',
      reviewNote: req.body.reviewNote
    };
    
    // TODO: Auto-publish approved content to respective category
    
    res.json({ success: true, data: submissions[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/submissions/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }
    
    if (!req.body.reviewNote) {
      return res.status(400).json({ success: false, error: 'Review note is required for rejection' });
    }
    
    submissions[index] = {
      ...submissions[index],
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectedBy: req.user?.uid || 'system',
      reviewNote: req.body.reviewNote
    };
    
    res.json({ success: true, data: submissions[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stats Routes
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      pendingApprovals: submissions.filter(s => s.status === 'pending').length,
      activeBriefings: briefings.filter(b => b.status === 'published').length,
      smsSentToday: smsAlerts.filter(a => {
        const today = new Date().toDateString();
        return new Date(a.sentAt).toDateString() === today;
      }).length,
      activeUsers: 1234, // TODO: Get from actual user database
      totalCategories: categories.filter(c => c.active).length
    };
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

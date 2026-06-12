const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');

// @route   GET /api/notifications/vapid-public-key
// @desc    Get VAPID public key for frontend subscription
// @access  Private (Authenticated users)
router.get('/vapid-public-key', protect, (req, res) => {
  res.status(200).json({
    success: true,
    publicKey: process.env.VAPID_PUBLIC_KEY
  });
});

// @route   POST /api/notifications/subscribe
// @desc    Save client push subscription
// @access  Private (Authenticated users)
router.post('/subscribe', protect, async (req, res, next) => {
  const { endpoint, keys, expirationTime } = req.body;

  if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
    return res.status(400).json({
      success: false,
      message: 'Invalid subscription object. Must contain endpoint and keys (p256dh, auth).'
    });
  }

  try {
    // Upsert subscription to prevent duplicates
    const subscription = await Subscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys,
        expirationTime,
        createdAt: Date.now()
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Subscription saved successfully',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

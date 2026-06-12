const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: [true, 'Push subscription endpoint is required'],
    unique: true
  },
  expirationTime: {
    type: Number,
    default: null
  },
  keys: {
    p256dh: {
      type: String,
      required: [true, 'Push subscription p256dh key is required']
    },
    auth: {
      type: String,
      required: [true, 'Push subscription auth key is required']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);

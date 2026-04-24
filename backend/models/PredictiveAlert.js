const mongoose = require('mongoose');

const predictiveAlertSchema = new mongoose.Schema({
  region: {
    type: String,
    required: true
  },
  alert_type: {
    type: String,
    enum: ['flood', 'shortage', 'health', 'disaster'],
    required: true
  },
  probability: {
    type: Number,
    min: 0,
    max: 1,
    required: true
  },
  predicted_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'dismissed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('PredictiveAlert', predictiveAlertSchema);
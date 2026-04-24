const mongoose = require('mongoose');

const analyticsDataSchema = new mongoose.Schema({
  date: {
    type: String,  // format: YYYY-MM-DD
    required: true
  },
  region: {
    type: String,
    required: true
  },
  total_reports: { type: Number, default: 0 },
  resolved_reports: { type: Number, default: 0 },
  active_volunteers: { type: Number, default: 0 },
  avg_response_time: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AnalyticsData', analyticsDataSchema);
const mongoose = require('mongoose');

const priorityScoreSchema = new mongoose.Schema({
  report_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IssueReport',
    required: true,
    unique: true
  },
  priority_score: {
    type: Number,
    required: true
  },
  urgency_level: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  explanation: {
    type: String  // explainable AI — why this score was given
  },
  calculated_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PriorityScore', priorityScoreSchema);
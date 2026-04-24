const mongoose = require('mongoose');

const matchingLogSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  volunteer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match_score: {
    type: Number,
    required: true
  },
  factors: {
    skill_match: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    availability: { type: Number, default: 0 }
  },
  selected: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('MatchingLog', matchingLogSchema);
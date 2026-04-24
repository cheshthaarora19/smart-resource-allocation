const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  report_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IssueReport',
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['unassigned', 'assigned', 'in_progress', 'completed'],
    default: 'unassigned'
  },
  assigned_at: {
    type: Date,
    default: null
  },
  completed_at: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
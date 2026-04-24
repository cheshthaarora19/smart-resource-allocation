const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created_report', 'assigned_task', 'completed_task', 'updated_resource', 'login', 'logout'],
    required: true
  },
  entity_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemLog', systemLogSchema);
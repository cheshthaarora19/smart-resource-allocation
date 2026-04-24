const mongoose = require('mongoose');

const volunteerProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    enum: ['medical', 'teaching', 'logistics', 'coordination', 'rescue']
  }],
  availability: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  tasks_completed: {
    type: Number,
    default: 0
  },
  current_task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  last_active: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('VolunteerProfile', volunteerProfileSchema);
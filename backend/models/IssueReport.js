const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema({
  reported_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  need_type: {
    type: String,
    enum: ['food', 'health', 'education', 'disaster'],
    required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String }
  },
  images: [{ type: String }],
  severity: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  people_affected: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'resolved'],
    default: 'pending'
  },
  is_duplicate: {
    type: Boolean,
    default: false
  },
  duplicate_of: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'IssueReport',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('IssueReport', issueReportSchema);
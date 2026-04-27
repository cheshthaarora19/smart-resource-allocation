const mongoose = require('mongoose');

const resourceInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['food_packets', 'medicines', 'clothes', 'equipment', 'water'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ResourceInventory', resourceInventorySchema);
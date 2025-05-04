const mongoose = require('mongoose');

const rewardActionSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true,
    unique: true
  },
  points: {
    type: Number,
    required: true,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model(process.env.MONGO_Collection_RewardAction, rewardActionSchema);

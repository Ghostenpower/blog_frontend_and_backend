const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  room: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema); 
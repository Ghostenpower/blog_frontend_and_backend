const mongoose = require('mongoose');

// 定义评论的Schema
const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const MomentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  links: [{
    title: String,
    url: String
  }],
  // 添加评论字段
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Moment', MomentSchema); 
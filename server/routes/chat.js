const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// 获取指定聊天室的消息历史
router.get('/rooms/:room/messages', chatController.getRoomMessages);

// 发送新消息
router.post('/messages', chatController.sendMessage);

module.exports = router; 
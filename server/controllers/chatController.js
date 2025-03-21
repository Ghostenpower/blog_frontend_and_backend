const Message = require('../models/Message');

/**
 * 获取指定聊天室的消息历史
 */
exports.getRoomMessages = async (req, res) => {
  try {
    const { room } = req.params;
    const limit = parseInt(req.query.limit) || 100;
    
    const messages = await Message.find({ room })
      .sort({ time: 1 })
      .limit(limit);
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: '获取消息失败' });
  }
};

/**
 * 发送新消息
 */
exports.sendMessage = async (req, res) => {
  try {
    const { user, text, image, room } = req.body;
    
    if (!user || !room) {
      return res.status(400).json({ message: '用户名和聊天室不能为空' });
    }
    
    const newMessage = new Message({
      user,
      text: text || '',
      image: image || null,
      room,
      time: new Date()
    });
    
    await newMessage.save();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: '发送消息失败' });
  }
}; 
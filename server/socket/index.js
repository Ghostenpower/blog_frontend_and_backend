const onlineUsers = new Map();
const rooms = new Map();
const Message = require('../models/Message');
const cosUploader = require('../utils/cosUploader');

// 从数据库加载聊天室历史消息
async function loadRoomHistory(room) {
  try {
    const messages = await Message.find({ room })
      .sort({ time: 1 })
      .limit(100);
    return messages;
  } catch (error) {
    console.error('加载聊天历史失败:', error);
    return [];
  }
}

// 保存消息到数据库
async function saveMessage(messageData) {
  try {
    const { username, room, text, image, timestamp } = messageData;
    
    const newMessage = new Message({
      user: username,
      text: text || '',
      image: image || null,
      room,
      time: timestamp ? new Date(timestamp) : new Date()
    });
    
    await newMessage.save();
    return newMessage;
  } catch (error) {
    console.error('保存消息失败:', error);
    return null;
  }
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected');

    // 用户加入聊天室
    socket.on('join', async ({ userId, username, room }) => {
      socket.join(room);
      
      // 保存用户信息
      onlineUsers.set(socket.id, { userId, username, room });
      
      // 初始化房间
      if (!rooms.has(room)) {
        rooms.set(room, new Set());
      }
      rooms.get(room).add(socket.id);

      // 广播用户加入消息
      io.to(room).emit('userJoined', {
        userId,
        username,
        message: `${username} 加入了聊天室`,
        onlineCount: rooms.get(room).size
      });

      // 发送在线用户列表
      const roomUsers = Array.from(rooms.get(room))
        .map(id => onlineUsers.get(id))
        .filter(Boolean);
      
      io.to(room).emit('userList', roomUsers);
      
      // 发送聊天历史记录
      try {
        const history = await loadRoomHistory(room);
        socket.emit('roomHistory', history);
      } catch (error) {
        console.error('发送历史记录失败:', error);
      }
    });

    // 处理消息
    socket.on('message', async (data) => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        const messageData = {
          ...data,
          userId: user.userId,
          username: user.username,
          room: user.room,
          timestamp: Date.now()
        };
        
        // 发送消息给聊天室所有人
        io.to(user.room).emit('message', messageData);
        
        // 保存消息到数据库
        await saveMessage(messageData);
      }
    });

    // 处理图片消息
    socket.on('imageMessage', async (data) => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        try {
          // 准备元数据（用于文件名和存储路径）
          const metadata = {
            userId: user.userId,
            username: user.username,
            room: user.room
          };
          
          // 使用COS上传图片，获取图片URL
          const imageUrl = await cosUploader.uploadFromBase64(data.image, null, metadata);
          
          // 创建包含COS图片URL的消息数据
          const messageData = {
            userId: user.userId,
            username: user.username,
            room: user.room,
            text: data.text || '',
            image: imageUrl, // 使用COS URL替换Base64数据
            timestamp: Date.now()
          };
          
          // 发送消息给聊天室所有人
          io.to(user.room).emit('imageMessage', messageData);
          
          // 保存消息到数据库
          await saveMessage(messageData);
        } catch (error) {
          console.error('图片上传失败:', error);
          // 通知用户上传失败
          socket.emit('error', { message: '图片上传失败，请重试' });
        }
      }
    });

    // 处理用户断开连接
    socket.on('disconnect', () => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        const { userId, username, room } = user;
        
        // 从在线用户列表中移除
        onlineUsers.delete(socket.id);
        
        // 从房间中移除
        if (rooms.has(room)) {
          rooms.get(room).delete(socket.id);
          
          // 如果房间为空，删除房间
          if (rooms.get(room).size === 0) {
            rooms.delete(room);
          } else {
            // 广播用户离开消息
            io.to(room).emit('userLeft', {
              userId,
              username,
              message: `${username} 离开了聊天室`,
              onlineCount: rooms.get(room).size
            });

            // 更新在线用户列表
            const roomUsers = Array.from(rooms.get(room))
              .map(id => onlineUsers.get(id))
              .filter(Boolean);
            
            io.to(room).emit('userList', roomUsers);
          }
        }
      }
      console.log('A user disconnected');
    });

    // 处理用户正在输入状态
    socket.on('typing', (isTyping) => {
      const user = onlineUsers.get(socket.id);
      if (user) {
        socket.to(user.room).emit('userTyping', {
          userId: user.userId,
          username: user.username,
          isTyping
        });
      }
    });
  });
};

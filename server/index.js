const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const server = http.createServer(app);

// 设置Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL, 
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://blog.megajam.online',    // 前端域名
      'https://blog.megajam.online',   // HTTPS 前端域名
      'http://blog-bankend.megajam.online',    // 后端域名
      'https://blog-bankend.megajam.online'    // HTTPS 后端域名
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 导入并初始化Socket处理程序
require('./socket/index')(io);

// 中间件
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://blog.megajam.online',
    'https://blog.megajam.online',
    'http://blog-bankend.megajam.online',
    'https://blog-bankend.megajam.online'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// 导入路由
const articleRoutes = require('./routes/articles');
const projectRoutes = require('./routes/projects');
const momentRoutes = require('./routes/moments');
const chatRoutes = require('./routes/chat');

// 使用路由
app.use('/api/articles', articleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/chat', chatRoutes);

// 根路由
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Jyang Blog API' });
});

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// 启动服务器
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 连接数据库
connectDB(); 
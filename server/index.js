const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 导入路由
const articleRoutes = require('./routes/articles');
const projectRoutes = require('./routes/projects');
const momentRoutes = require('./routes/moments');

// 使用路由
app.use('/api/articles', articleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/moments', momentRoutes);

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 连接数据库
connectDB(); 
# Jyang博客后端API

这是Jyang个人博客的后端API服务，使用Node.js、Express和MongoDB构建。

## 功能

- 文章管理：创建、获取、更新和删除文章
- 项目管理：创建、获取、更新和删除项目
- 动态管理：创建、获取、更新、删除和点赞动态

## 技术栈

- Node.js
- Express
- MongoDB (Mongoose)
- JWT认证

## 安装

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 生产环境运行
npm start
```

## 环境变量

创建一个`.env`文件，包含以下变量：

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/jyang-blog
JWT_SECRET=your_jwt_secret_key
```

## API文档

### 文章

- `GET /api/articles` - 获取所有文章
- `GET /api/articles/:id` - 获取单个文章
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 项目

- `GET /api/projects` - 获取所有项目
- `GET /api/projects/:id` - 获取单个项目
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目

### 动态

- `GET /api/moments` - 获取所有动态
- `GET /api/moments/:id` - 获取单个动态
- `POST /api/moments` - 创建动态
- `PUT /api/moments/:id` - 更新动态
- `DELETE /api/moments/:id` - 删除动态
- `POST /api/moments/:id/like` - 点赞动态 
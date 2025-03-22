# 项目开发文档

## 项目结构

### 前端目录结构 (blog/)
```
blog/
├── src/
│   ├── api/          # API请求封装，与后端接口交互
│   ├── components/   # 可复用的Vue组件
│   ├── views/        # 页面级组件
│   ├── router/       # Vue Router路由配置
│   ├── stores/       # Pinia状态管理
│   ├── utils/        # 工具函数和通用方法
│   ├── styles/       # 全局样式和主题配置
│   ├── assets/       # 静态资源（图片、字体等）
│   ├── App.vue       # 根组件
│   └── main.js       # 应用入口文件
├── public/           # 不需要打包的静态资源
├── index.html        # HTML模板
└── vite.config.js    # Vite构建配置
```

### 后端目录结构 (server/)
```
server/
├── routes/           # API路由定义
├── controllers/      # 业务逻辑控制器
├── models/          # MongoDB数据模型
├── config/          # 配置文件
├── deploy/          # 部署相关脚本
└── index.js         # 服务器入口文件
```

## 核心功能模块

### 1. 前端模块
- **文章展示**
  - 文章列表页
  - 文章详情页
  - Markdown渲染
  - 代码高亮显示

- **项目展示**
  - 项目列表
  - 项目详情
  - GitHub项目同步

- **动态管理**
  - 动态列表
  - 动态详情
  - 图片展示
  - 留言功能（新增）
  - 点赞功能

### 2. 后端API
- **文章管理** (/api/articles)
  - GET /api/articles - 获取文章列表
  - GET /api/articles/:id - 获取文章详情
  - POST /api/articles - 创建文章
  - PUT /api/articles/:id - 更新文章
  - DELETE /api/articles/:id - 删除文章

- **项目管理** (/api/projects)
  - GET /api/projects - 获取项目列表
  - GET /api/projects/:id - 获取项目详情
  - POST /api/projects - 添加项目
  - PUT /api/projects/:id - 更新项目
  - DELETE /api/projects/:id - 删除项目

- **动态管理** (/api/moments)
  - GET /api/moments - 获取动态列表
  - GET /api/moments/:id - 获取动态详情
  - POST /api/moments - 发布动态
  - PUT /api/moments/:id - 更新动态
  - DELETE /api/moments/:id - 删除动态
  - POST /api/moments/:id/like - 点赞动态
  - GET /api/moments/:id/comments - 获取动态评论（新增）
  - POST /api/moments/:id/comments - 添加评论（新增）
  - DELETE /api/moments/:id/comments/:commentId - 删除评论（新增）

## 技术栈详解

### 前端技术栈
- **Vue 3**: 使用Composition API开发
- **Vite**: 现代化构建工具
- **Element Plus**: UI组件库
- **Vue Router**: 路由管理
- **Pinia**: 状态管理
- **Marked**: Markdown解析
- **Highlight.js**: 代码高亮

### 后端技术栈
- **Express**: Web框架
- **MongoDB**: 数据库
- **Mongoose**: ODM工具
- **Cors**: 跨域处理
- **Morgan**: 日志中间件
- **Dotenv**: 环境变量管理

## 重要文件说明

### 前端关键文件
- `blog/vite.config.js`: Vite构建配置，包含插件和构建选项
- `blog/src/main.js`: 应用入口，包含全局配置和插件注册
- `blog/src/App.vue`: 根组件，定义全局布局
- `blog/src/router/index.js`: 路由配置文件
- `blog/src/stores/index.js`: Pinia状态管理配置
- `blog/src/view/MomentDetail.vue`: 动态详情和留言功能页面（新增）

### 后端关键文件
- `server/index.js`: 服务器入口文件，包含Express配置
- `server/.env`: 环境变量配置
- `server/deploy.js`: 部署脚本
- `server/seed.js`: 数据库初始化脚本
- `server/models/Moment.js`: 动态数据模型，包含评论schema（更新）
- `server/controllers/momentController.js`: 动态控制器，处理评论相关逻辑（更新）
- `server/routes/moments.js`: 动态路由，新增评论相关路由（更新）

## 部署信息

### 前端部署
- 构建命令: `npm run build`
- 输出目录: `dist/`
- 环境变量: 需要设置 NODE_OPTIONS=--openssl-legacy-provider

### 后端部署
- 启动命令: `npm start`
- 开发模式: `npm run dev`
- 数据初始化: `npm run data:import`
- 构建命令: `node deploy.js --with-frontend`
- 环境变量: 需要配置 MONGO_URI 和 PORT

## 版本历史

### [0.1.0] - 2025-02-18
- 项目初始化
- 基础功能实现

### [0.2.0] - 2025-02-18
- 完整的前后端功能实现
- 数据库集成完成
- 部署脚本完善
- 文档系统完善

### [0.2.0] - 2025-02-19
- 优化前端UI和响应式设计
- 增强后端错误处理
- API文档完善

### [1.1.0] - 2025-03-20
- 动态留言功能实现
  - 后端: 添加评论数据模型和API接口
  - 前端: 实现动态详情页面和留言功能
  - 前端: 主页显示评论数和跳转功能

### [1.1.1] - 2025-02-22
- 优化动态详情页面的样式和交互
  - 添加页面标题和返回按钮
  - 优化日期显示，添加日历图标
  - 改进相关链接的展示方式
  - 统一按钮和主题样式
  - 优化评论区域的展示效果
    - 添加评论数量标签
    - 优化评论输入框样式
    - 添加用户头像占位符
    - 改进评论列表的展示效果

### [1.1.2] - 2025-02-24
- 重构动态卡片为独立组件
  - 创建 `MomentCard.vue` 组件
    - 实现点赞状态和交互
    - 支持外部链接跳转
    - 集成评论数量显示
    - 优化日期显示格式
  - 重构首页动态列表
    - 使用新的 `MomentCard` 组件
    - 改进卡片点击交互
    - 优化点赞按钮事件处理
  - 优化组件复用性
    - 提取公共样式和逻辑
    - 统一事件处理机制
    - 保持动画和过渡效果

### [1.1.3] - 2024-03-21
- 新增聊天室功能
  - 实现实时聊天功能
    - 支持文本和图片消息
    - 显示用户输入状态
    - 显示在线用户列表
  - 实现消息历史记录
    - 支持分页加载历史消息
    - 自动滚动到最新消息
  - 实现多房间支持
    - 公共聊天室
    - 技术交流室
    - 随便聊聊室
  - 优化用户体验
    - 消息时间格式化显示
    - 区分系统消息和用户消息
    - 标记自己发送的消息
- 优化移动端页面
  - 重构响应式布局
    - 优化小屏幕下的导航栏显示
    - 调整聊天室列表布局
    - 改进消息输入框样式
  - 提升移动端交互体验
    - 优化触摸事件处理
    - 添加页面滚动优化
    - 改进键盘弹出时的布局调整
  - 增强移动端性能
    - 减少不必要的重绘
    - 优化图片加载策略
    - 添加页面缓存支持

## 开发规范

### Git提交规范
使用语义化的emoji前缀：
- 🎉 `:tada:` 初始化项目
- ✨ `:sparkles:` 新功能
- 🐛 `:bug:` 修复bug
- 📝 `:memo:` 文档更新
- 🎨 `:art:` 代码优化
- 🚀 `:rocket:` 部署相关

### 版本号规范
遵循语义化版本 2.0.0：
- 主版本号：不兼容的API修改
- 次版本号：向下兼容的功能新增
- 修订号：向下兼容的问题修正

## 注意事项
1. 前端开发需要Node.js 14+版本
2. 后端需要MongoDB 4.4+版本
3. 开发前需要配置.env文件
4. 部署前需要进行生产环境测试

## [Unreleased]

### Added
- 新增动态卡片组件 `MomentCard.vue`
  - 支持点赞状态和交互
  - 支持外部链接跳转
  - 支持评论数量显示
  - 集成日期格式化和相对时间显示

### Changed
- 优化了动态详情页面的样式和交互体验
  - 新增页面标题和返回按钮
  - 优化日期显示，添加图标
  - 改进相关链接的展示方式
  - 统一按钮和主题样式
  - 优化评论区域的展示效果
- 重构首页动态列表，使用新的 `MomentCard` 组件
  - 改进了卡片的点击交互逻辑
  - 优化了点赞按钮的事件处理
  - 保持了原有的动画和过渡效果

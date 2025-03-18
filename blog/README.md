# 个人博客前端项目

基于 Vue 3 + Element Plus 构建的现代化博客前端项目。

## 技术栈

- **核心框架：** Vue 3 (Composition API)
- **UI 框架：** Element Plus
- **构建工具：** Vite
- **路由管理：** Vue Router
- **状态管理：** Vue 3 Reactive API
- **HTTP 客户端：** Axios

## 主要功能

### 动态列表（首页）
- 响应式卡片布局
- 骨架屏加载动画
- 点赞功能（本地存储）
- 链接预览
- 相对时间显示

### 文章详情
- 完整文章内容展示
- 骨架屏加载动画
- 点赞功能
- 返回导航

## 项目结构

```
blog/
├── src/
│   ├── view/          # 页面组件
│   │   ├── home.vue   # 首页（动态列表）
│   │   └── article.vue # 文章详情页
│   ├── api/           # API 接口
│   │   └── articles.js # 文章相关接口
│   └── utils/         # 工具函数
│       └── dateFormat.js # 日期格式化
├── public/            # 静态资源
├── vite.config.js     # Vite 配置
└── index.html         # 入口文件
```

## 开发指南

### 环境要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖
```bash
npm install
```

### 开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 项目特点

### 1. 现代化开发体验
- 使用 Vue 3 Composition API
- Vite 提供快速的开发体验
- Element Plus 组件库支持

### 2. 优秀的用户体验
- 骨架屏加载动画
- 响应式设计
- 平滑的交互效果
- 适配暗黑模式

### 3. 代码质量
- 模块化的项目结构
- 统一的错误处理
- 代码复用（Composition API）
- 命名规范统一

### 4. 性能优化
- 路由懒加载
- 组件按需加载
- 本地存储优化

## 开发规范

### 组件开发规范
- 使用 `<script setup>` 语法
- 组件名使用 PascalCase
- props 和 emits 需要明确定义
- 使用 ref/reactive 管理状态

### 样式规范
- 使用 scoped style
- 遵循 BEM 命名规范
- 使用 CSS 变量实现主题
- 统一使用 Element Plus 的设计标准

### Git 提交规范
```
feat: 新功能
fix: 修复问题
docs: 文档修改
style: 代码格式修改
refactor: 代码重构
test: 测试用例修改
chore: 其他修改
```

## 待优化项

### 功能增强
- [ ] 评论功能
- [ ] 文章分类和标签
- [ ] 搜索功能
- [ ] 用户个人中心

### 性能优化
- [ ] 虚拟滚动
- [ ] 图片懒加载
- [ ] 请求缓存
- [ ] 页面预加载

### 代码优化
- [ ] TypeScript 支持
- [ ] 单元测试
- [ ] 错误边界处理
- [ ] API 请求封装优化

## 贡献指南

1. Fork 本仓库
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 许可证

[MIT License](LICENSE)
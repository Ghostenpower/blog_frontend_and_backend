const express = require('express');
const router = express.Router();
const momentController = require('../controllers/momentController');

// 获取所有动态
router.get('/', momentController.getMoments);

// 获取单个动态
router.get('/:id', momentController.getMomentById);

// 创建动态
router.post('/', momentController.createMoment);

// 更新动态
router.put('/:id', momentController.updateMoment);

// 删除动态
router.delete('/:id', momentController.deleteMoment);

// 点赞动态
router.post('/:id/like', momentController.likeMoment);

// 添加评论相关的路由
// 获取动态的所有评论
router.get('/:id/comments', momentController.getComments);

// 添加评论
router.post('/:id/comments', momentController.addComment);

// 删除评论
router.delete('/:id/comments/:commentId', momentController.deleteComment);

module.exports = router; 
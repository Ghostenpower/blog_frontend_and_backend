const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// 获取所有文章
router.get('/', articleController.getArticles);

// 获取单个文章
router.get('/:id', articleController.getArticleById);

// 创建文章
router.post('/', articleController.createArticle);

// 更新文章
router.put('/:id', articleController.updateArticle);

// 删除文章
router.delete('/:id', articleController.deleteArticle);

module.exports = router; 
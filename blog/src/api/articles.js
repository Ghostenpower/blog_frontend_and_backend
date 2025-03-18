import { fetchAPI } from './config';

// 文章数据
const articles = [
  {
    id: 1,
    title: '如何手动切换Python版本',
    platform: '掘金',
    url: 'https://juejin.cn/post/7472957056498073619',
    date: '2024-02-28',
    description: '详细介绍了在不同操作系统下手动切换 Python 版本的方法，包括环境变量配置、版本管理工具使用等实用技巧。'
  },
  {
    id: 2,
    title: '对防抖和节流的认识',
    platform: '掘金',
    url: 'https://juejin.cn/post/7473058413791707155',
    date: '2024-02-29',
    description: '深入探讨了前端性能优化中的防抖和节流技术，包括实现原理、使用场景和实践案例。'
  },
  {
    id: 3,
    title: 'TypeScript 高级特性详解',
    platform: '掘金',
    url: 'https://juejin.cn/post/yyyy',
    date: '2025-02-05',
    description: '深入探讨 TypeScript 的高级用法和实战技巧...'
  }
]

// 模拟 API 请求延迟
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 获取所有文章
export const getArticles = async () => {
  return await fetchAPI('/articles');
};

// 获取单个文章
export const getArticleById = async (id) => {
  return await fetchAPI(`/articles/${id}`);
};

// 创建文章（如果需要）
export const createArticle = async (articleData) => {
  return await fetchAPI('/articles', {
    method: 'POST',
    body: JSON.stringify(articleData)
  });
};

// 更新文章（如果需要）
export const updateArticle = async (id, articleData) => {
  return await fetchAPI(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(articleData)
  });
};

// 删除文章（如果需要）
export const deleteArticle = async (id) => {
  return await fetchAPI(`/articles/${id}`, {
    method: 'DELETE'
  });
}; 
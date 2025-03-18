import { fetchAPI } from './config';

// 获取所有项目
export const getProjects = async () => {
  return await fetchAPI('/projects');
};

// 获取单个项目
export const getProjectById = async (id) => {
  return await fetchAPI(`/projects/${id}`);
};

// 创建项目（如果需要）
export const createProject = async (projectData) => {
  return await fetchAPI('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
};

// 更新项目（如果需要）
export const updateProject = async (id, projectData) => {
  return await fetchAPI(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
};

// 删除项目（如果需要）
export const deleteProject = async (id) => {
  return await fetchAPI(`/projects/${id}`, {
    method: 'DELETE'
  });
};

// 示例项目数据（仅供参考，实际数据将从API获取）
export const projects = [
  {
    id: 'seckill-system',
    title: '秒杀商城系统',
    description: '一个基于Vue和Java开发的秒杀商城系统，实现高并发秒杀功能。',
    github: 'https://github.com/Ghostenpower/seckill-system',
    technologies: ['Vue.js', 'Java', 'JavaScript', 'CSS'],
    techPercentages: {
      'Vue': 48.7,
      'Java': 37.5,
      'JavaScript': 11.7,
      'CSS': 1.8,
      'Other': 0.3
    },
    features: [
      '用户登录注册',
      '商品展示',
      '秒杀功能',
      '订单管理',
      '后台管理系统'
    ],
    thumbnail: '/images/projects/seckill-system.png',
    category: 'fullstack'
  }
]; 
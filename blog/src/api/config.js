// API配置
export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://blog-bankend.megajam.online/api'  // 生产环境
  : 'http://localhost:5000/api';              // 开发环境


// 通用请求函数
export const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API请求失败:', error);
    throw error;
  }
}; 
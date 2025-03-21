import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建 axios 实例
const service = axios.create({
  baseURL: 'http://blog-bankend.megajam.online', // 或者使用 https
  timeout: 15000
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在这里可以添加认证信息等
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    return res;
  },
  error => {
    console.error('Response error:', error);
    ElMessage.error(error.message || '请求失败');
    return Promise.reject(error);
  }
);

export default service; 
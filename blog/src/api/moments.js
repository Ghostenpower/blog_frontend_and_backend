import { fetchAPI } from './config';

// 获取所有动态
export const getMoments = async () => {
  return await fetchAPI('/moments');
};

// 获取单个动态
export const getMomentById = async (id) => {
  return await fetchAPI(`/moments/${id}`);
};

// 创建动态（如果需要）
export const createMoment = async (momentData) => {
  return await fetchAPI('/moments', {
    method: 'POST',
    body: JSON.stringify(momentData)
  });
};

// 更新动态（如果需要）
export const updateMoment = async (id, momentData) => {
  return await fetchAPI(`/moments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(momentData)
  });
};

// 删除动态（如果需要）
export const deleteMoment = async (id) => {
  return await fetchAPI(`/moments/${id}`, {
    method: 'DELETE'
  });
};

// 点赞/取消点赞动态
export const toggleMomentLike = async (id, isLiked) => {
  if (!id) {
    throw new Error('动态ID不能为空');
  }
  return await fetchAPI(`/moments/${id}/like`, {
    method: 'POST',
    body: JSON.stringify({ isLiked })
  });
};

// 获取动态评论
export const getMomentComments = async (momentId) => {
  if (!momentId) {
    throw new Error('动态ID不能为空');
  }
  return await fetchAPI(`/moments/${momentId}/comments`);
};

// 添加评论
export const addComment = async (momentId, commentData) => {
  if (!momentId) {
    throw new Error('动态ID不能为空');
  }
  return await fetchAPI(`/moments/${momentId}/comments`, {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
};

// 删除评论
export const deleteComment = async (momentId, commentId) => {
  if (!momentId || !commentId) {
    throw new Error('动态ID和评论ID不能为空');
  }
  return await fetchAPI(`/moments/${momentId}/comments/${commentId}`, {
    method: 'DELETE'
  });
}; 
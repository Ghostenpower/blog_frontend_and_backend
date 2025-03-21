import request from '@/utils/request';

/**
 * 获取指定聊天室的消息历史
 * @param {string} room - 聊天室名称
 * @param {number} limit - 最大消息数量
 * @returns {Promise<Array>} 消息数组
 */
export const getMessages = (room, limit = 100) => {
  return request({
    url: `/chat/rooms/${encodeURIComponent(room)}/messages`,
    method: 'get',
    params: { limit }
  });
};

/**
 * 发送新消息
 * @param {Object} message - 消息对象
 * @param {string} message.user - 用户名
 * @param {string} message.text - 文本内容
 * @param {string} message.image - 图片内容(base64)
 * @param {string} message.room - 聊天室
 * @returns {Promise<Object>} 创建的消息
 */
export const sendMessage = (message) => {
  return request({
    url: '/chat/messages',
    method: 'post',
    data: message
  });
};

export function deleteMessage(id) {
  return request({
    url: `/chat/messages/${id}`,
    method: 'delete'
  });
} 
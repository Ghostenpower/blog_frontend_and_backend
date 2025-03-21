<template>
  <div class="chat-container">
    <div class="chat-header">
      <!-- 移动端聊天室选择器 -->
      <div class="mobile-room-select">
        <div class="mobile-rooms">
          <div 
            v-for="room in rooms" 
            :key="room.value"
            class="mobile-room-item"
            :class="{ 'mobile-room-active': selectedRoom === room.value }"
            @click="changeRoom(room.value)"
          >
            {{ room.label }}
            <span class="mobile-room-badge" v-if="roomUserCounts[room.value]">{{ roomUserCounts[room.value] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-main">
      <div class="chat-sidebar">
        <h3>聊天室列表</h3>
        <div class="room-list">
          <div 
            v-for="room in rooms" 
            :key="room.value" 
            class="room-item"
            :class="{ 'room-active': selectedRoom === room.value }"
            @click="changeRoom(room.value)"
          >
            <span>{{ room.label }}</span>
            <span class="room-badge" v-if="roomUserCounts[room.value]">{{ roomUserCounts[room.value] }}</span>
          </div>
        </div>
        
        <div class="online-users-section">
          <h4>在线用户 ({{ onlineUsers.length }})</h4>
          <div class="online-users">
            <div v-for="user in onlineUsers" :key="user.id || user" class="user-item">
              <el-avatar :size="24">{{ (user.username || user).charAt(0).toUpperCase() }}</el-avatar>
              <span>{{ user.username || user }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-content">
        <div class="messages" ref="messagesContainer">
          <div v-if="loading" class="loading">
            <el-icon class="is-loading"><Loading /></el-icon>
          </div>
          <template v-else>
            <div
              v-for="(message, index) in messages"
              :key="index"
              class="message"
              :class="{
                'message-own': message.username === username,
                'system-message': message.system
              }"
            >
              <div v-if="message.system" class="system-message-content">
                {{ message.text }}
              </div>
              <template v-else>
                <div class="message-header">
                  <el-avatar :size="32">{{ message.username ? message.username.charAt(0).toUpperCase() : 'A' }}</el-avatar>
                  <span class="sender">{{ message.username || '匿名用户' }}</span>
                  <span class="time">{{ formatTime(message.timestamp) }}</span>
                </div>
                <div class="message-body">
                  <template v-if="message.text">
                    {{ message.text }}
                  </template>
                  <template v-if="message.image">
                    <div class="image-container">
                      <el-image
                        :src="message.image"
                        :preview-src-list="[message.image]"
                        fit="cover"
                        class="message-image"
                        lazy
                        :initial-index="0"
                        @load="imageLoaded"
                        @error="imageError"
                      >
                        <template #placeholder>
                          <div class="image-placeholder">
                            <el-icon class="is-loading"><Loading /></el-icon>
                            <span>图片加载中...</span>
                          </div>
                        </template>
                        <template #error>
                          <div class="image-error">
                            <el-icon><PictureIcon /></el-icon>
                            <span>图片加载失败</span>
                          </div>
                        </template>
                      </el-image>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </div>

        <div class="typing-indicator" v-if="typingUser">
          {{ typingUser }} 正在输入...
        </div>

        <div class="message-input">
          <el-input
            v-model="newMessage"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @input="handleInput"
            @keyup.enter.exact.prevent="sendMessage"
          />
          <div class="input-actions">
            <el-upload
              class="image-upload"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              @change="handleImageUpload"
            >
              <el-button type="primary" plain>
                <el-icon><PictureIcon /></el-icon>
              </el-button>
            </el-upload>
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import { io } from 'socket.io-client';
import { ElMessage, ElIcon } from 'element-plus';
import { Loading, Picture as PictureIcon } from '@element-plus/icons-vue';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { getMessages } from '@/api/chat';

// 生成随机用户名 (匿名模式)
const generateRandomUsername = () => {
  return '游客' + Math.floor(Math.random() * 10000);
};

const username = ref(generateRandomUsername());
const selectedRoom = ref('公共聊天室');
const messages = ref([]);
const newMessage = ref('');
const loading = ref(false);
const typingUser = ref('');
const onlineUsers = ref([]);
const roomUserCounts = computed(() => {
  const counts = {};
  onlineUsers.value.forEach(user => {
    const room = user.room || '公共聊天室';
    counts[room] = counts[room] ? counts[room] + 1 : 1;
  });
  return counts;
});
const messagesContainer = ref(null);
let typingTimeout = null;
let socket = null;

const rooms = [
  { label: '公共聊天室', value: '公共聊天室' },
  { label: '技术交流', value: '技术交流' },
  { label: '随便聊聊', value: '随便聊聊' }
];

const getRoomLabel = (value) => {
  const room = rooms.find(r => r.value === value);
  return room ? room.label : value;
};

// 初始化Socket
const initSocket = () => {
  // 连接到服务器Socket
  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');

  // 接收聊天历史记录
  socket.on('roomHistory', (historyMessages) => {
    // 将从MongoDB加载的历史消息转换为前端格式
    messages.value = historyMessages.map(msg => ({
      id: msg._id || Date.now(),
      text: msg.text || '',
      image: msg.image || null,
      username: msg.user,
      timestamp: new Date(msg.time).getTime(),
      system: false
    }));
    nextTick(() => {
      scrollToBottom();
    });
    loading.value = false;
  });

  // 接收用户列表
  socket.on('userList', (users) => {
    onlineUsers.value = users;
  });

  // 新消息
  socket.on('message', (message) => {
    messages.value.push(message);
    nextTick(() => {
      scrollToBottom();
    });
  });

  // 处理图片消息
  socket.on('imageMessage', (message) => {
    messages.value.push(message);
    nextTick(() => {
      scrollToBottom();
    });
  });

  // 处理用户加入事件
  socket.on('userJoined', (data) => {
    // 添加系统消息
    if (data.message) {
      messages.value.push({
        id: Date.now(),
        text: data.message,
        system: true,
        timestamp: Date.now()
      });
    }
    
    // 更新用户列表
    updateRoomUserCounts();
  });

  // 处理用户离开事件
  socket.on('userLeft', (data) => {
    // 添加系统消息
    if (data.message) {
      messages.value.push({
        id: Date.now(),
        text: data.message,
        system: true,
        timestamp: Date.now()
      });
    }
    
    // 更新用户列表和计数
    updateRoomUserCounts();
  });

  // 处理输入事件
  socket.on('userTyping', ({ username, isTyping }) => {
    if (isTyping) {
      typingUser.value = username;
    } else if (typingUser.value === username) {
      typingUser.value = '';
    }
  });

  // 处理错误事件
  socket.on('error', ({ message }) => {
    ElMessage.error(message);
  });

  // 监听连接错误
  socket.on('connect_error', (error) => {
    console.error('连接错误:', error);
    ElMessage.error('连接服务器失败，请稍后重试');
  });
};

// 获取聊天室人数
const updateRoomUserCounts = () => {
  // 直接从用户列表获取数量
  roomUserCounts.value = {
    [selectedRoom.value]: onlineUsers.value.length || 0
  };
};

// 切换聊天室
const changeRoom = (room) => {
  if (room === selectedRoom.value) return;
  
  loading.value = true;
  selectedRoom.value = room;
  messages.value = [];
  
  if (socket) {
    socket.emit('join', {
      userId: socket.id,
      username: username.value,
      room: room
    });
  }
};

// 发送消息
const sendMessage = () => {
  if (!newMessage.value.trim()) return;

  const messageData = {
    text: newMessage.value
  };

  socket.emit('message', messageData);
  newMessage.value = '';
  // 停止输入状态
  socket.emit('typing', false);
};

// 处理图片上传
const handleImageUpload = (file) => {
  // 检查文件大小，限制为5MB
  if (file.raw.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过5MB');
    return;
  }
  
  // 显示上传中的提示
  const loadingMessage = ElMessage({
    message: '图片上传中...',
    type: 'info',
    duration: 0
  });
  
  const reader = new FileReader();
  reader.onload = (e) => {
    // 关闭上传提示
    loadingMessage.close();
    
    const messageData = {
      image: e.target.result
    };
    
    socket.emit('imageMessage', messageData);
  };
  reader.onerror = () => {
    // 关闭上传提示
    loadingMessage.close();
    ElMessage.error('图片读取失败');
  };
  reader.readAsDataURL(file.raw);
};

// 图片加载成功事件处理
const imageLoaded = (e) => {
  console.log('图片加载成功');
};

// 图片加载失败事件处理
const imageError = (e) => {
  console.log('图片加载失败');
  ElMessage.error('图片加载失败');
};

// 处理输入事件
const handleInput = () => {
  if (!socket) return;
  
  if (typingTimeout) clearTimeout(typingTimeout);
  
  socket.emit('typing', true);
  
  typingTimeout = setTimeout(() => {
    socket.emit('typing', false);
  }, 1000);
};

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 格式化时间
const formatTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: zhCN
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};


// 组件挂载时自动连接
onMounted(() => {
  // 初始化Socket连接
  initSocket();
  // 自动加入默认聊天室
  loading.value = true;
  socket.emit('join', {
    userId: Date.now().toString(),
    username: username.value,
    room: selectedRoom.value
  });
});

// 组件卸载时断开连接
onUnmounted(() => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
});

// 监听消息列表变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });
</script>

<style scoped>
.chat-container {
  max-width: 1200px;
  margin: 0rem auto;
  padding: 0 1rem;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-info {
  font-size: 1rem;
  color: var(--el-text-color-secondary);
}

.chat-main {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1rem;
  height: 100vh;
  min-height: 500px;
  max-height: 80vh;
  padding: 0.5rem 0;
}

.chat-sidebar {
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.chat-sidebar h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: var(--el-text-color-primary);
}

.chat-sidebar h4 {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.room-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.room-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.room-item:hover {
  background-color: var(--el-fill-color);
}

.room-active {
  background-color: var(--el-color-primary-light-9);
  font-weight: bold;
}

.room-badge {
  font-size: 0.75rem;
  padding: 0.1rem 0.4rem;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 10px;
}

.online-users-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.online-users {
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
}

.user-item:hover {
  background-color: var(--el-fill-color-light);
}

.chat-content {
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  max-height: calc(100% - 120px);
}

.message {
  margin-bottom: 1rem;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.sender {
  font-weight: bold;
}

.time {
  font-size: 0.75rem;
  color: var(--el-text-color-secondary);
}

.message-body {
  margin-left: 2.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
  word-break: break-word;
}

.message-own .message-body {
  background-color: var(--el-color-primary-light-9);
}

.message-image {
  max-width: 200px;
  border-radius: 4px;
  cursor: pointer;
}

.typing-indicator {
  padding: 0.5rem 1rem;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  font-style: italic;
}

.message-input {
  padding: 0.5rem;
  border-top: 1px solid var(--el-border-color-light);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.image-upload {
  margin-right: 0.5rem;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.loading .el-icon {
  font-size: 2rem;
}

/* 默认情况下隐藏移动端聊天室选择器 */
.mobile-room-select {
  display: none;
}

@media (max-width: 768px) {
  .chat-main {
    grid-template-columns: 1fr;
    height: calc(100vh - 250px);
    max-height: none;
  }

  .chat-sidebar {
    display: none;
  }
  
  .chat-container {
    margin: 0rem auto;
    padding:0 0.5rem;
  }
  
  .messages {
    max-height: calc(100% - 100px);
  }
  
  /* 显示移动端聊天室选择器 */
  .mobile-room-select {
    display: block;
    width: 100%;
    padding-top: 0.5rem;
  }
  
  .mobile-rooms {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .mobile-room-item {
    padding: 0.4rem 0.8rem;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.9rem;
  }
  
  .mobile-room-active {
    background-color: var(--el-color-primary-light-9);
    font-weight: bold;
  }
  
  .mobile-room-badge {
    font-size: 0.7rem;
    padding: 0.1rem 0.3rem;
    background-color: var(--el-color-primary);
    color: white;
    border-radius: 8px;
    min-width: 1.2rem;
    text-align: center;
  }
  
  /* 调整移动端布局 */
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
}

.system-message {
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
}

.system-message-content {
  background-color: rgba(var(--el-color-info-rgb), 0.1);
  color: var(--el-text-color-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  text-align: center;
}

.image-container {
  max-width: 300px;
  max-height: 300px;
  margin-top: 0.5rem;
  position: relative;
}

.message-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 4px;
}

.image-placeholder {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  font-size: 0.85rem;
}

.image-error {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--el-fill-color);
  border-radius: 4px;
  color: var(--el-color-danger);
  font-size: 0.85rem;
}

.image-placeholder .el-icon,
.image-error .el-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}
</style> 
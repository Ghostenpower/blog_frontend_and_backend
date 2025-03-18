<template>
  <div class="moment-card" @click="$emit('click', moment._id)">
    <div class="moment-content">
      <p class="text">{{ moment.content }}</p>
      <div v-if="moment.links?.length" class="links-section">
        <div v-for="link in moment.links" 
             :key="link.url" 
             class="link-item">
          <el-link 
            :href="link.url" 
            target="_blank"
            :icon="Link"
            @click.stop
          >
            {{ link.title }}
          </el-link>
        </div>
      </div>
    </div>
    <div class="moment-footer">
      <span class="date" :title="formatDate(moment.date)">
        <el-icon><Calendar /></el-icon>
        {{ getRelativeTime(moment.date) }}
      </span>
      <div class="actions">
        <span 
          class="comment-btn" 
          title="查看详情和留言"
        >
          <el-icon><ChatLineRound /></el-icon>
          {{ moment.comments ? moment.comments.length : 0 }}
        </span>
        <span 
          class="like-btn" 
          :class="{ 'liked': isLiked }"
          @click.stop="$emit('like', moment)"
        >
          <el-icon><Star /></el-icon>
          {{ moment.likes }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Link, Star, ChatLineRound } from '@element-plus/icons-vue'
import { formatDate, getRelativeTime } from '../utils/dateFormat'

// 定义组件的属性
const props = defineProps({
  moment: {
    type: Object,
    required: true
  },
  isLiked: {
    type: Boolean,
    default: false
  }
})

// 定义组件的事件
defineEmits(['click', 'like'])
</script>

<style scoped>
.moment-card {
  padding: 25px;
  margin-bottom: 20px;
  border-radius: 12px;
  background-color: var(--card-bg-color);
  transition: all 0.3s;
  cursor: pointer;
}

.moment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.moment-content {
  margin-bottom: 20px;
}

.text {
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  white-space: pre-line;
  color: var(--el-text-color);
}

.links-section {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.link-item {
  font-size: 14px;
}

.moment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid var(--card-border-color);
}

.date {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.like-btn, .comment-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  transition: color 0.3s;
}

.like-btn:hover, .comment-btn:hover {
  color: #409EFF;
}

.like-btn.liked {
  color: #FF6B6B;
}
</style> 
<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, ArrowLeft, Star } from '@element-plus/icons-vue'
import { getArticleById } from '../api/articles'
import { ElMessage } from 'element-plus'
import { formatDate } from '../utils/dateFormat'

const route = useRoute()
const router = useRouter()
const article = ref(null)
const loading = ref(true)
const isLiked = ref(false)

const fetchArticle = async () => {
  try {
    loading.value = true
    article.value = await getArticleById(route.params.id)
    if (!article.value) {
      ElMessage.error('文章不存在')
      router.push('/')
    } else {
      // 从本地存储中获取点赞状态
      const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]')
      isLiked.value = likedArticles.includes(article.value._id)
    }
  } catch (error) {
    ElMessage.error('获取文章失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const toggleLike = () => {
  if (!article.value || !article.value._id) {
    ElMessage.error('文章ID不存在')
    return
  }
  
  // 更新点赞状态
  isLiked.value = !isLiked.value
  
  // 更新点赞数
  if (isLiked.value) {
    article.value.likes = (article.value.likes || 0) + 1
  } else {
    article.value.likes = Math.max(0, (article.value.likes || 0) - 1)
  }
  
  // 保存到本地存储
  const likedArticles = JSON.parse(localStorage.getItem('likedArticles') || '[]')
  if (isLiked.value) {
    if (!likedArticles.includes(article.value._id)) {
      likedArticles.push(article.value._id)
    }
  } else {
    const index = likedArticles.indexOf(article.value._id)
    if (index !== -1) {
      likedArticles.splice(index, 1)
    }
  }
  localStorage.setItem('likedArticles', JSON.stringify(likedArticles))
  
  ElMessage.success(isLiked.value ? '点赞成功' : '已取消点赞')
}

fetchArticle()
</script>

<template>
  <div class="article-container">
    <el-button 
      class="back-button" 
      @click="goBack"
      :icon="ArrowLeft"
      text
    >
      返回
    </el-button>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="article-skeleton">
          <el-skeleton-item variant="h1" style="width: 80%" />
          <el-skeleton-item variant="text" style="margin: 20px 0" />
          <el-skeleton-item variant="p" style="width: 100%" v-for="i in 5" :key="i" />
        </div>
      </template>

      <template #default>
        <div v-if="article" class="article-content">
          <div class="article-header">
            <h1>{{ article.title }}</h1>
            <div class="article-meta">
              <span class="article-date" :title="formatDate(article.date, 'YYYY年MM月DD日')">
                <el-icon :size="18"><Calendar /></el-icon>
                {{ formatDate(article.date, 'YYYY年MM月DD日') }}
              </span>
              <span 
                class="like-btn" 
                :class="{ 'liked': isLiked }"
                @click="toggleLike"
              >
                <el-icon :size="18"><Star /></el-icon>
                {{ article.likes || 0 }}
              </span>
            </div>
          </div>
          <div class="article-body">
            {{ article.content }}
          </div>
        </div>
        <div v-else-if="!loading" class="empty-state">
          <el-empty description="文章不存在" />
          <el-button class="mt-4" type="primary" @click="goBack">返回文章列表</el-button>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.article-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 20px;
  top: 20px;
  font-size: 16px;
}

.article-skeleton {
  padding: 20px;
}

.article-header {
  margin: 20px 0 40px;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
  color: var(--el-text-color);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.article-date {
  display: flex;
  align-items: center;
  gap: 8px;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px 8px;
  border-radius: 4px;
}

.like-btn:hover {
  background-color: rgba(var(--el-color-primary-rgb), 0.1);
  color: var(--el-color-primary);
}

.like-btn.liked {
  color: var(--el-color-danger);
}

.like-btn.liked:hover {
  background-color: rgba(var(--el-color-danger-rgb), 0.1);
}

.article-body {
  line-height: 1.8;
  color: var(--el-text-color);
  font-size: 16px;
  white-space: pre-line;
}

.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}
</style> 
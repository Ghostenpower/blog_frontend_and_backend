<script setup>
import { ref, onMounted } from 'vue'
import { Calendar, Link, Star, ChatLineRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMoments, toggleMomentLike } from '../api/moments'
import { formatDate, getRelativeTime } from '../utils/dateFormat'
import { useRouter } from 'vue-router'
import MomentCard from '../components/MomentCard.vue'

const router = useRouter()
const moments = ref([])
// 存储用户点赞状态
const likedMoments = ref(new Set())
const loading = ref(true)

onMounted(async () => {
  try {
    loading.value = true
    moments.value = await getMoments()
    // 从本地存储加载点赞状态
    const savedLikes = localStorage.getItem('likedMoments')
    if (savedLikes) {
      likedMoments.value = new Set(JSON.parse(savedLikes))
    }
  } catch (error) {
    ElMessage.error('获取动态列表失败')
  } finally {
    loading.value = false
  }
})

const toggleLike = async (moment) => {
  // 使用MongoDB的_id字段
  const momentId = moment._id
  if (!momentId) {
    ElMessage.error('动态ID不存在')
    return
  }
  
  const isCurrentlyLiked = likedMoments.value.has(momentId)
  
  try {
    // 乐观更新UI
    if (isCurrentlyLiked) {
      moment.likes--
      likedMoments.value.delete(momentId)
    } else {
      moment.likes++
      likedMoments.value.add(momentId)
    }
    
    // 保存点赞状态到本地存储
    localStorage.setItem('likedMoments', JSON.stringify([...likedMoments.value]))
    
    // 调用API
    await toggleMomentLike(momentId, !isCurrentlyLiked)
    
    ElMessage.success(isCurrentlyLiked ? '已取消点赞' : '点赞成功')
  } catch (error) {
    console.error('点赞操作失败:', error)
    
    // 发生错误时回滚UI状态
    if (isCurrentlyLiked) {
      moment.likes++
      likedMoments.value.add(momentId)
    } else {
      moment.likes--
      likedMoments.value.delete(momentId)
    }
    
    // 更新本地存储
    localStorage.setItem('likedMoments', JSON.stringify([...likedMoments.value]))
    
    ElMessage.error('操作失败，请稍后再试')
  }
}

// 跳转到动态详情页
const goToMomentDetail = (momentId) => {
  router.push({ name: 'MomentDetail', params: { id: momentId } })
}
</script>

<template>
  <div class="home-content">
    <div class="moments-list">
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="skeleton-container">
            <div v-for="i in 3" :key="i" class="skeleton-card">
              <!-- 内容区域 -->
              <el-skeleton-item variant="p" style="width: 100%; height: 80px" />
              <!-- 链接区域 -->
              <div style="margin-top: 15px">
                <el-skeleton-item variant="text" style="width: 40%; margin-right: 10px" />
                <el-skeleton-item variant="text" style="width: 30%" />
              </div>
              <!-- 底部信息 -->
              <div class="skeleton-footer">
                <el-skeleton-item variant="text" style="width: 120px" />
                <el-skeleton-item variant="text" style="width: 50px" />
              </div>
            </div>
          </div>
        </template>

        <template #default>
          <div v-if="moments.length === 0" class="empty-state">
            <el-empty description="暂无动态" />
          </div>
          <moment-card
            v-for="moment in moments"
            :key="moment._id"
            :moment="moment"
            :is-liked="likedMoments.has(moment._id)"
            @click="goToMomentDetail"
            @like="toggleLike"
          />
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<style scoped>
.home-content {
  padding: 30px;
}

.moments-list {
  max-width: 800px;
  margin: 0 auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  width: 100%;
  background-color: var(--card-bg-color);
  border-radius: 12px;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skeleton-card {
  padding: 25px;
  border-radius: 12px;
  background-color: var(--card-bg-color);
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  margin-top: 15px;
  border-top: 1px solid var(--card-border-color);
}
</style> 
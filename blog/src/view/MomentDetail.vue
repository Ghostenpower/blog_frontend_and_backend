<template>
  <div class="moment-detail-container">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="10" animated />
    </div>
    <div v-else-if="error" class="error">
      <el-alert :title="error" type="error" :closable="false" />
    </div>
    <div v-else class="moment-detail">
      <!-- 动态内容 -->
      <div class="moment-content">
        <div class="page-header">
          <h1>动态详情</h1>
          <el-button @click="goBack" size="small" round>
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
        <el-card shadow="hover" class="moment-card">
          <div class="moment-header">
            <span class="moment-date">
              <el-icon><Calendar /></el-icon>
              {{ formatDate(moment.date) }}
            </span>
          </div>
          <div class="moment-body">
            <p>{{ moment.content }}</p>
            
            <!-- 附带链接 -->
            <div v-if="moment.links && moment.links.length > 0" class="moment-links">
              <h3>相关链接:</h3>
              <div class="links-container">
                <el-link 
                  v-for="(link, index) in moment.links" 
                  :key="index"
                  :href="link.url" 
                  target="_blank"
                  :icon="Link"
                  class="link-item"
                >
                  {{ link.title }}
                </el-link>
              </div>
            </div>
          </div>
          <div class="moment-footer" @click="goToDetail">
            <el-button 
              :type="isLiked ? 'danger' : 'primary'" 
              size="small" 
              round
              @click.stop="handleLike" 
              :loading="likeLoading"
            >
              <el-icon><Star /></el-icon>
              {{ moment.likes }} 点赞
            </el-button>
          </div>
        </el-card>
      </div>

      <!-- 评论区域 -->
      <div class="comments-section">
        <h2>留言区 <el-tag round>{{ moment.comments ? moment.comments.length : 0 }}</el-tag></h2>
        
        <!-- 添加评论表单 -->
        <div class="add-comment">
          <el-form :model="commentForm" :rules="commentRules" ref="commentFormRef">
            <el-form-item prop="author">
              <el-input 
                v-model="commentForm.author" 
                placeholder="您的昵称" 
                prefix-icon="User"
                clearable
              />
            </el-form-item>
            <el-form-item prop="content">
              <el-input 
                v-model="commentForm.content" 
                type="textarea" 
                :rows="3" 
                placeholder="写下您的留言..."
                resize="none"
                show-word-limit
                maxlength="500"
              />
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="submitComment" 
                :loading="commentSubmitting"
                round
              >
                <el-icon><ChatLineRound /></el-icon>
                提交留言
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-list">
          <el-empty v-if="!moment.comments || moment.comments.length === 0" description="暂无留言" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="comment in moment.comments"
              :key="comment._id"
              :timestamp="formatDate(comment.date)"
              placement="top"
              type="primary"
            >
              <el-card shadow="hover" class="comment-card">
                <div class="comment-header">
                  <span class="comment-author">
                    <el-avatar :size="24" class="avatar">{{ comment.author.slice(0, 1) }}</el-avatar>
                    {{ comment.author }}
                  </span>
                </div>
                <div class="comment-content">
                  {{ comment.content }}
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getMomentById, toggleMomentLike, addComment } from '../api/moments';
import { Calendar, Star, Link, ChatLineRound, ArrowLeft, User } from '@element-plus/icons-vue';

export default {
  name: 'MomentDetail',
  components: {
    Calendar,
    Star,
    Link,
    ChatLineRound,
    ArrowLeft,
    User
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const moment = ref({});
    const loading = ref(true);
    const error = ref('');
    const likeLoading = ref(false);
    const commentSubmitting = ref(false);
    const commentFormRef = ref(null);
    const likedMoments = ref(new Set());
    
    // 从本地存储加载点赞状态
    try {
      const savedLikes = localStorage.getItem('likedMoments');
      if (savedLikes) {
        likedMoments.value = new Set(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error('Failed to load liked status:', error);
    }
    
    const isLiked = computed(() => {
      return likedMoments.value.has(moment.value._id);
    });
    
    const commentForm = reactive({
      author: localStorage.getItem('commentAuthor') || '',
      content: ''
    });
    
    const commentRules = {
      author: [
        { required: true, message: '请输入您的昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '昵称长度应在2到20个字符之间', trigger: 'blur' }
      ],
      content: [
        { required: true, message: '请输入留言内容', trigger: 'blur' },
        { min: 2, max: 500, message: '留言内容应在2到500个字符之间', trigger: 'blur' }
      ]
    };
    
    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // 加载动态详情
    const loadMoment = async () => {
      const id = route.params.id;
      if (!id) {
        error.value = '动态ID不能为空';
        loading.value = false;
        return;
      }
      
      try {
        loading.value = true;
        const data = await getMomentById(id);
        moment.value = data;
      } catch (err) {
        error.value = err.message || '获取动态失败';
      } finally {
        loading.value = false;
      }
    };
    
    // 处理点赞
    const handleLike = async () => {
      const momentId = moment.value._id;
      const isCurrentlyLiked = likedMoments.value.has(momentId);
      
      try {
        likeLoading.value = true;
        
        // 更新本地UI状态
        if (isCurrentlyLiked) {
          moment.value.likes = Math.max(0, moment.value.likes - 1);
          likedMoments.value.delete(momentId);
        } else {
          moment.value.likes++;
          likedMoments.value.add(momentId);
        }
        
        // 保存点赞状态到本地存储
        localStorage.setItem('likedMoments', JSON.stringify([...likedMoments.value]));
        
        // 调用API
        await toggleMomentLike(momentId, !isCurrentlyLiked);
        
        ElMessage.success(isCurrentlyLiked ? '已取消点赞' : '点赞成功');
      } catch (err) {
        // 发生错误时回滚UI状态
        if (isCurrentlyLiked) {
          moment.value.likes++;
          likedMoments.value.add(momentId);
        } else {
          moment.value.likes = Math.max(0, moment.value.likes - 1);
          likedMoments.value.delete(momentId);
        }
        
        // 更新本地存储
        localStorage.setItem('likedMoments', JSON.stringify([...likedMoments.value]));
        
        ElMessage.error('点赞失败：' + (err.message || '未知错误'));
      } finally {
        likeLoading.value = false;
      }
    };
    
    // 提交评论
    const submitComment = async () => {
      if (!commentFormRef.value) return;
      
      commentFormRef.value.validate(async (valid) => {
        if (!valid) return;
        
        try {
          commentSubmitting.value = true;
          
          // 保存用户名到本地存储
          localStorage.setItem('commentAuthor', commentForm.author);
          
          const updated = await addComment(moment.value._id, commentForm);
          moment.value = updated;
          commentForm.content = '';
          ElMessage.success('留言发布成功');
        } catch (err) {
          ElMessage.error('留言发布失败：' + (err.message || '未知错误'));
        } finally {
          commentSubmitting.value = false;
        }
      });
    };
    
    // 返回上一页
    const goBack = () => {
      router.back();
    };
    
    // 跳转到详情页
    const goToDetail = () => {
      if (moment.value && moment.value._id) {
        router.push(`/moment/${moment.value._id}`);
      }
    };
    
    onMounted(() => {
      loadMoment();
    });
    
    return {
      moment,
      loading,
      error,
      likeLoading,
      commentForm,
      commentRules,
      commentFormRef,
      commentSubmitting,
      formatDate,
      handleLike,
      submitComment,
      goBack,
      isLiked,
      goToDetail,
      Link,
    };
  }
};
</script>

<style scoped>
.moment-detail-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  padding: 30px 0;
}

.moment-detail {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--el-text-color-primary);
}

.moment-card {
  border-radius: 12px;
  transition: all 0.3s;
  overflow: hidden;
}

.moment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.moment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}

.moment-date {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.moment-body {
  margin-bottom: 20px;
  white-space: pre-line;
  font-size: 16px;
  line-height: 1.6;
}

.moment-body p {
  margin-top: 0;
}

.moment-links {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.link-item {
  margin-right: 10px;
}

.moment-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 15px;
  border-top: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background-color 0.3s;
}


.comments-section {
  margin-top: 10px;
}

.comments-section h2 {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-comment {
  margin-bottom: 30px;
  padding: 20px;
  background-color: var(--el-fill-color-light);
  border-radius: 12px;
  transition: all 0.3s;
}

.add-comment:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.comments-list {
  margin-top: 20px;
}

.comment-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.comment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.comment-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.comment-author {
  font-weight: bold;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  background-color: var(--el-color-primary);
  color: white;
}

.comment-content {
  white-space: pre-line;
  font-size: 15px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
}

:deep(.el-timeline-item__node) {
  background-color: var(--el-color-primary);
}

:deep(.el-timeline-item__tail) {
  border-left-color: var(--el-border-color);
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 20px;
}

:deep(.el-timeline-item__timestamp) {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

@media (max-width: 768px) {
  .moment-detail-container {
    padding: 15px;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .moment-body {
    font-size: 15px;
  }
}
</style> 
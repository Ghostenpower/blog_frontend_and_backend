<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProjectById } from '../api/projects'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import hljs from 'highlight.js'
import { ArrowLeft, Link } from '@element-plus/icons-vue'
import 'highlight.js/styles/github.css'

const route = useRoute()
const router = useRouter()
const project = ref(null)
const readme = ref('')
const loading = ref(true)
const readmeLoading = ref(true)

const goBack = () => {
  router.back()
}

const openSourceCode = () => {
  if (!project.value?.link) {
    ElMessage.warning('源码链接不存在')
    return
  }
  window?.open(project.value.link, '_blank')
}

// 配置marked
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true
})

// 从GitHub API获取README内容
const fetchReadme = async (repoUrl) => {
  try {
    readmeLoading.value = true
    // 从URL中提取owner和repo
    const urlParts = repoUrl.replace('https://github.com/', '').split('/')
    const owner = urlParts[0]
    const repo = urlParts[1]

    // 尝试获取README内容
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`)
    if (!response.ok) {
      throw new Error('README not found')
    }
    const data = await response.json()
    // GitHub API返回的内容是Base64编码的
    const base64Content = data.content.replace(/\n/g, '')
    const binaryContent = atob(base64Content)
    // 将二进制内容转换为Uint8Array
    const bytes = new Uint8Array(binaryContent.length)
    for (let i = 0; i < binaryContent.length; i++) {
      bytes[i] = binaryContent.charCodeAt(i)
    }
    // 使用TextDecoder正确解码UTF-8内容
    const decoder = new TextDecoder('utf-8')
    const content = decoder.decode(bytes)
    readme.value = marked(content)
  } catch (error) {
    console.error('Error fetching README:', error)
    readme.value = '暂无 README 内容'
    ElMessage.warning('获取 README 失败')
  } finally {
    readmeLoading.value = false
  }
}

onMounted(async () => {
  try {
    loading.value = true
    const response = await getProjectById(route.params.id)
    project.value = response
    if (project.value?.link) {
      await fetchReadme(project.value.link)
    }
  } catch (error) {
    ElMessage.error('获取项目信息失败')
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="project-detail">
    <el-button 
      class="back-button" 
      :icon="ArrowLeft"
      @click="goBack"
      text
    >
      返回
    </el-button>

    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="skeleton-content">
          <!-- 标题区域骨架 -->
          <el-skeleton-item variant="h1" style="width: 50%; height: 32px;" />
          
          <!-- 技术栈和按钮区域骨架 -->
          <div class="skeleton-meta">
            <div class="skeleton-tags">
              <el-skeleton-item variant="text" style="width: 60px; height: 24px; margin-right: 8px;" />
              <el-skeleton-item variant="text" style="width: 80px; height: 24px; margin-right: 8px;" />
              <el-skeleton-item variant="text" style="width: 70px; height: 24px;" />
            </div>
            <el-skeleton-item variant="button" style="width: 100px; height: 32px;" />
          </div>
          
          <!-- 描述区域骨架 -->
          <el-skeleton-item variant="p" style="width: 100%; height: 80px; margin: 20px 0;" />
          
          <!-- README内容区域骨架 -->
          <div class="skeleton-readme">
            <el-skeleton-item variant="h3" style="width: 30%; height: 24px; margin-bottom: 16px;" />
            <el-skeleton-item variant="text" style="width: 100%; height: 16px; margin-bottom: 12px;" />
            <el-skeleton-item variant="text" style="width: 90%; height: 16px; margin-bottom: 12px;" />
            <el-skeleton-item variant="text" style="width: 95%; height: 16px; margin-bottom: 12px;" />
            <el-skeleton-item variant="text" style="width: 85%; height: 16px; margin-bottom: 12px;" />
            <el-skeleton-item variant="text" style="width: 100%; height: 16px; margin-bottom: 12px;" />
          </div>
        </div>
      </template>
      
      <template #default>
        <template v-if="project">
          <div class="project-header">
            <h1>{{ project.title }}</h1>
            <div class="project-meta">
              <div class="tech-stack">
                <el-tag 
                  v-for="tech in project.tech" 
                  :key="tech"
                  size="small"
                  class="tech-tag"
                >
                  {{ tech }}
                </el-tag>
              </div>
              <el-button 
                class="source-button"
                :icon="Link"
                @click="openSourceCode"
                v-if="project.link"
              >
                查看源码
              </el-button>
            </div>
            <p class="description">{{ project.description }}</p>
          </div>

          <div class="project-content">
            <el-skeleton v-if="readmeLoading" animated>
              <template #template>
                <div class="readme-skeleton">
                  <el-skeleton-item variant="h3" style="width: 30%; height: 24px; margin-bottom: 16px;" />
                  <el-skeleton-item variant="text" style="width: 100%; height: 16px; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 92%; height: 16px; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 96%; height: 16px; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 88%; height: 16px; margin-bottom: 12px;" />
                  <el-skeleton-item variant="code" style="width: 100%; height: 120px; margin: 20px 0;" />
                  <el-skeleton-item variant="text" style="width: 94%; height: 16px; margin-bottom: 12px;" />
                  <el-skeleton-item variant="text" style="width: 90%; height: 16px; margin-bottom: 12px;" />
                </div>
              </template>
            </el-skeleton>

            <template v-else>
              <div v-if="readme" class="markdown-content" v-html="readme"></div>
              <div v-else class="fallback-content">
                <h2>项目详情</h2>
                <div class="details-grid">
                  <div class="detail-item">
                    <h3>项目简介</h3>
                    <p>{{ project.details || project.description }}</p>
                  </div>
                  <div class="detail-item">
                    <h3>技术栈</h3>
                    <ul>
                      <li v-for="tech in project.tech" :key="tech">{{ tech }}</li>
                    </ul>
                  </div>
                  <div class="detail-item" v-if="project.features">
                    <h3>主要功能</h3>
                    <ul>
                      <li v-for="(feature, index) in project.features" :key="index">
                        {{ feature }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>
      </template>
    </el-skeleton>
  </div>
</template>

<style>
.project-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.project-header {
  margin-bottom: 40px;
}

.project-header h1 {
  margin: 0 0 20px;
  font-size: 2.5em;
  color: var(--el-text-color);
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tech-stack {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tech-tag {
  background-color: rgba(128, 128, 128, 0.1);
  border: none;
}

.description {
  font-size: 1.2em;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
}

.project-content {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-content p {
  margin-bottom: 16px;
}

.markdown-content code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
}

.markdown-content pre code {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--el-fill-color-lighter);
  border-radius: 6px;
  display: block;
}

.fallback-content {
  color: var(--el-text-color);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.detail-item {
  background-color: var(--el-bg-color-left);
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-item h3 {
  margin: 0 0 16px;
  font-size: 1.2em;
  color: var(--el-text-color);
}

.detail-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-item li {
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
}

.skeleton-content {
  padding: 20px;
}

.skeleton-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
}

.skeleton-tags {
  display: flex;
  gap: 8px;
}

.skeleton-readme {
  background-color: var(--card-bg-color);
  border-radius: 8px;
  padding: 24px;
  margin-top: 20px;
}

.el-skeleton-item {
  border-radius: 4px;
}

.el-skeleton-item--button {
  border-radius: 6px;
}

.readme-skeleton {
  padding: 20px 0;
}

.el-skeleton-item--code {
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
}

.back-button {
  margin-bottom: 20px;
  font-size: 16px;
}

.back-button:hover {
  color: var(--el-color-primary);
}

.source-button {
  background-color: var(--el-bg-color-left);
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color);
  transition: all 0.3s ease;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 6px;
}

.source-button:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  background-color: var(--el-bg-color);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.source-button .el-icon {
  font-size: 16px;
}

@media (max-width: 768px) {
  .project-detail {
    padding: 20px;
  }

  .project-header h1 {
    font-size: 2em;
  }

  .project-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .project-content {
    padding: 20px;
  }
}
</style> 
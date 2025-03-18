import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  build: {
    // 调整警告限制大小
    chunkSizeWarningLimit: 600,
    // 配置Rollup选项
    rollupOptions: {
      output: {
        // 手动分块策略
        manualChunks: {
          // 将Vue相关库打包在一起
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将Element Plus单独打包
          'element-plus': ['element-plus']
        },
        // 控制chunk的输出文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // 控制入口文件的输出文件名
        entryFileNames: 'assets/js/[name]-[hash].js',
        // 控制静态资源的输出文件名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'img'
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts'
          } else if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/.test(assetInfo.name)) {
            extType = 'media'
          } else if (/\.css$/.test(assetInfo.name)) {
            extType = 'css'
          }
          return `assets/${extType}/[name]-[hash][extname]`
        }
      }
    }
  },
  // 解析配置
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  assetsInclude: ['**/*.svg']
})

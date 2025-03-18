import { defineStore } from 'pinia'
import { ref } from 'vue'
import avatorImg from '../assets/avator.jpg'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref({
    name: 'Jyang',
    avatar: avatorImg,
    bio: '前端开发工程师',
    links: {
      github: 'https://github.com/yourusername',
      juejin: 'https://juejin.cn/user/yourusername'
    }
  })

  return {
    userInfo
  }
}) 
<script setup>
// 不需要导入main.vue，它会通过路由系统被渲染
</script>

<template>
  <router-view />
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
}
</style>

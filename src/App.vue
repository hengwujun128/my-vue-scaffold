<script setup lang="ts">
  // import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <!-- 定义路由出口 -->
  <!-- 在App.vue中定义的router-view，这是顶层的出口，渲染最高级路由匹配到的组件-->
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>

  <!-- <HelloWorld msg="Vite + Vue" /> -->
</template>

<style scoped>
  /* .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
  } */

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-active {
    opacity: 0;
  }
</style>

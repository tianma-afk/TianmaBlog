<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>

<template>
  <main class="error-page">
    <p class="eyebrow">天马的书房 · {{ error.statusCode }}</p>
    <h1>{{ error.statusCode === 404 ? '这本书还不在架上。' : '书页暂时卡住了。' }}</h1>
    <p>回到书架，换一本翻翻吧。</p>
    <a href="/">← 回到书架</a>
  </main>
</template>

<style scoped>
.error-page { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 26px; min-height: 100svh; padding: 30px; text-align: center; }
h1 { font: 400 clamp(26px, 5vw, 42px)/1.5 var(--font-serif); }
p:not(.eyebrow) { color: #b0b19d; font-size: 14px; }
a { padding: 12px 0; text-underline-offset: 8px; color: #d8c296; font-size: 14px; }
</style>

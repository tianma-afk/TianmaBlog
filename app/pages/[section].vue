<script setup lang="ts">
import { books } from '~/data/library'

const enteredThisVisit = useState('entered-reading-room', () => false)
enteredThisVisit.value = true

const route = useRoute()
const book = computed(() => books.find(item => item.slug === route.params.section))

definePageMeta({
  validate: route => books.some(item => item.slug === route.params.section),
})

useSeoMeta({
  title: () => `${book.value?.title ?? '栏目'} · 天马的书房`,
  description: () => book.value?.description ?? '',
})
</script>

<template>
  <div v-if="book" class="section-page" :class="`section-page--${book.color}`">
    <header class="section-header">
      <NuxtLink class="back-link" to="/"><span aria-hidden="true">←</span> 回到书架</NuxtLink>
      <span class="section-wordmark">天马的书房</span>
    </header>

    <main class="section-paper">
      <p class="eyebrow">{{ book.english }}</p>
      <span class="section-number" aria-hidden="true">{{ book.number }}</span>
      <h1>{{ book.title }}</h1>
      <p class="section-description">{{ book.description }}</p>
      <div class="section-divider" aria-hidden="true" />
      <p class="placeholder-label">书页已打开，内容正在准备中。</p>
      <p class="placeholder-note">{{ book.note }}</p>
      <NuxtLink class="paper-back-link" to="/">先去翻翻其他书 <span aria-hidden="true">↗</span></NuxtLink>
    </main>

    <footer class="section-footer">不急，好故事值得慢慢写。</footer>
  </div>
</template>

<style scoped>
.section-page { --section-accent: #465b48; min-height: 100svh; padding: 0 max(7vw, 24px) 32px; background: #eae3d5; color: #343a2f; }
.section-page--wine { --section-accent: #864b43; }
.section-page--indigo { --section-accent: #465b78; }
.section-page--linen { --section-accent: #6c624c; }
.section-header { display: flex; align-items: center; justify-content: space-between; max-width: 1100px; height: 100px; margin: auto; }
.back-link { display: inline-flex; gap: 14px; align-items: center; color: #4f5548; text-decoration: none; font-size: 13px; padding-block: 12px; }
.back-link:hover { color: #171e14; }
.section-wordmark { font: 16px var(--font-serif); letter-spacing: .15em; }
.section-paper { position: relative; max-width: 800px; min-height: 570px; padding: clamp(32px, 7vw, 80px); margin: 28px auto 48px; border-top: 4px solid var(--section-accent); background: #f8f4ea; box-shadow: 0 15px 50px #5046300d; }
.eyebrow { color: var(--section-accent); }
.section-number { position: absolute; top: 35px; right: 35px; font: italic 35px var(--font-serif); color: var(--section-accent); opacity: .45; }
h1 { font: 400 clamp(42px, 6vw, 64px)/1.4 var(--font-serif); letter-spacing: .15em; margin: 38px 0 16px; }
.section-description { font: 16px/1.9 var(--font-serif); color: #626555; text-wrap: pretty; }
.section-divider { width: 48px; height: 1px; background: var(--section-accent); margin: 42px 0; opacity: .5; }
.placeholder-label { font: 18px/1.8 var(--font-serif); }
.placeholder-note { margin-top: 12px; max-width: 460px; font-size: 13px; color: #757768; line-height: 2.1; text-wrap: pretty; }
.paper-back-link { display: inline-flex; align-items: center; gap: 30px; margin-top: 38px; padding-bottom: 9px; border-bottom: 1px solid #c7c7b8; color: var(--section-accent); text-decoration: none; font-size: 13px; }
.paper-back-link:hover { border-color: var(--section-accent); }
.section-footer { text-align: center; color: #747667; font: 12px var(--font-serif); letter-spacing: .12em; }
@media (max-width: 600px) {
  .section-header { height: 80px; }
  .section-wordmark { font-size: 13px; }
  .section-paper { margin-top: 12px; min-height: 540px; }
  .section-number { top: 20px; right: 20px; font-size: 26px; }
}
</style>

<script setup lang="ts">
import type { CurtainPhase } from '~/components/CurtainIntro.vue'

const STORAGE_KEY = 'tianma:curtain-seen:v1'
const enteredThisVisit = useState('entered-reading-room', () => false)
const phase = ref<CurtainPhase>('checking')
const roomTitle = useTemplateRef('roomTitle')
const isBlocking = computed(() => phase.value === 'closed' || phase.value === 'opening')
let openingTimer: ReturnType<typeof setTimeout> | undefined

useHead({
  title: '天马的书房 · 翻开一页，走进一个世界',
  htmlAttrs: { class: computed(() => isBlocking.value ? 'curtain-is-blocking' : '') },
})

onMounted(() => {
  let seenBefore = enteredThisVisit.value
  try {
    seenBefore ||= localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // 隐私模式禁止存储时，本次站内浏览仍由 useState 记住状态。
  }
  enteredThisVisit.value = seenBefore
  phase.value = seenBefore ? 'open' : 'closed'
})

async function finishOpening() {
  phase.value = 'open'
  enteredThisVisit.value = true
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {
    // 无本地存储也不能阻止访客进入网站。
  }
  await nextTick()
  roomTitle.value?.focus({ preventScroll: true })
}

function enterRoom(skipAnimation = false) {
  if (phase.value !== 'closed' && phase.value !== 'opening') return
  if (phase.value === 'opening' && !skipAnimation) return
  if (openingTimer) clearTimeout(openingTimer)
  if (skipAnimation || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    void finishOpening()
    return
  }
  phase.value = 'opening'
  openingTimer = setTimeout(() => { void finishOpening() }, 2050)
}

function replayCurtain() {
  phase.value = 'closed'
}

onBeforeUnmount(() => {
  if (openingTimer) clearTimeout(openingTimer)
})
</script>

<template>
  <!-- 第一版假设：点击启幕、首次访问记忆、正面三层书架；正文暂不虚构。 -->
  <div class="reading-room" :inert="isBlocking">
    <header class="room-header">
      <NuxtLink class="wordmark" to="/" aria-label="天马的书房首页">
        <span class="wordmark-seal" aria-hidden="true">天</span>
        <span>天马的书房<small>TIANMA’S READING ROOM</small></span>
      </NuxtLink>
      <button class="replay-button" type="button" @click="replayCurtain">
        <span aria-hidden="true">↻</span> 重看启幕
      </button>
    </header>

    <main id="main-content" class="library-stage">
      <div class="room-introduction">
        <p class="eyebrow"><span aria-hidden="true" /> 文字的私人剧场 <span aria-hidden="true" /></p>
        <h1 ref="roomTitle" tabindex="-1">翻开一页，走进一个世界。</h1>
        <p class="room-description">关于我，关于所思所写。<span>选一本书，故事从这里开始。</span></p>
      </div>

      <SteppedBookshelf />

      <p class="shelf-instruction"><span aria-hidden="true">↗</span> 点击书的封面，随意翻阅</p>
    </main>

    <footer class="room-footer">
      <span>一间慢慢生长的书房</span>
      <span>愿你在这里，找到片刻安静。</span>
    </footer>
  </div>

  <CurtainIntro :phase="phase" @enter="enterRoom" />
</template>

<script setup lang="ts">
export type CurtainPhase = 'checking' | 'closed' | 'opening' | 'open' | 'closing'

const props = defineProps<{ phase: CurtainPhase }>()
const emit = defineEmits<{ enter: [skipAnimation: boolean], closed: [] }>()
const entrance = useTemplateRef('entrance')
const closedPanels = new Set<EventTarget>()

function focusEntrance() {
  entrance.value?.focus({ preventScroll: true })
}

onMounted(() => {
  if (props.phase === 'closed') {
    focusEntrance()
  }
})

watch(() => props.phase, async (phase) => {
  if (phase === 'closing') closedPanels.clear()
  if (phase === 'closed') {
    await nextTick()
    focusEntrance()
  }
}, { flush: 'post' })

function trackClosedPanel(event: TransitionEvent) {
  if (props.phase !== 'closing' || event.propertyName !== 'transform' || !event.currentTarget) return
  closedPanels.add(event.currentTarget)
  // 以两侧的真实动画完成事件为准，不能提前显示开场文字。
  if (closedPanels.size === 2) emit('closed')
}

function handleReducedMotion(event: TransitionEvent) {
  // 合拢途中切换系统动态效果偏好时，CSS 会取消动画，不能卡在 closing。
  if (props.phase === 'closing' && event.propertyName === 'transform'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    emit('closed')
  }
}
</script>

<template>
  <div
    class="theatre-curtain"
    :data-phase="phase"
    :aria-hidden="phase === 'open' || phase === 'checking' ? true : undefined"
  >
    <div
      class="curtain-panel curtain-panel--left"
      aria-hidden="true"
      @transitionend.self="trackClosedPanel"
      @transitioncancel.self="handleReducedMotion"
    />
    <div
      class="curtain-panel curtain-panel--right"
      aria-hidden="true"
      @transitionend.self="trackClosedPanel"
      @transitioncancel.self="handleReducedMotion"
    />
    <div class="curtain-pelmet" aria-hidden="true" />

    <div
      v-if="phase === 'closed' || phase === 'opening'"
      class="curtain-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="curtain-title"
      :aria-busy="phase === 'opening'"
      @keydown.tab.prevent="focusEntrance"
      @keydown.esc.prevent="emit('enter', true)"
    >
      <!-- 整幅幕布是无按钮外观的入口，保留原生键盘与读屏操作。 -->
      <button
        ref="entrance"
        class="curtain-invitation"
        type="button"
        aria-label="拉开幕布，进入书房"
        :disabled="phase === 'opening'"
        @click="emit('enter', false)"
      >
        <span id="curtain-title" class="curtain-title" lang="en">Life is a play</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.theatre-curtain {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow: hidden;
  isolation: isolate;
}

.curtain-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50.5%;
  background:
    linear-gradient(180deg, #210b0b66, transparent 23%, #220b0b55 100%),
    repeating-linear-gradient(90deg, #4f1b22 0%, #77303a 4%, #963c48 7%, #6e2530 11%, #42171f 14%, #5b1e29 17%);
  box-shadow: inset -15px 0 25px #1e080955, 10px 0 28px #170a0a77;
  transition: transform 2s cubic-bezier(.65, 0, .25, 1);
  will-change: transform;
}

.curtain-panel::after {
  content: '';
  position: absolute;
  inset: auto 0 20px;
  height: 4px;
  border-block: 1px solid #d2aa6666;
  box-shadow: 0 5px 0 #d2aa6622;
}

.curtain-panel--left { left: 0; }
.curtain-panel--right { right: 0; transform: scaleX(-1); }

.curtain-pelmet {
  position: absolute;
  inset: 0 0 auto;
  height: 24px;
  border-bottom: 2px solid #bd9754;
  background: linear-gradient(#3b121a, #69222e);
  box-shadow: 0 7px 20px #10080566;
}

.curtain-dialog, .curtain-invitation { position: absolute; inset: 0; }

.curtain-invitation {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 48px 32px;
  appearance: none;
  border: 0;
  border-radius: 0;
  background: radial-gradient(ellipse at 50% 42%, #220b0d05, #220b0d45);
  color: #eddbb7;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: opacity .5s, transform .7s;
}

.curtain-title {
  display: block;
  padding: .15em .2em .3em;
  font: 400 clamp(56px, 9.5vw, 156px)/1.3 'Pinyon Script', cursive;
  letter-spacing: .01em;
  white-space: nowrap;
  text-shadow: 0 2px 20px #250b0b55, 0 0 45px #e8c77c18;
  transition: color .3s, text-shadow .3s;
}

.curtain-invitation:focus-visible { outline: none; }
.curtain-invitation:focus-visible .curtain-title {
  color: #fff0cf;
  text-shadow: 0 2px 20px #250b0b55, 0 0 30px #e8c77c55;
}

@media (hover: hover) {
  .curtain-invitation:hover .curtain-title { color: #fff0cf; }
}

[data-phase='opening'], [data-phase='open'] { pointer-events: none; }
[data-phase='opening'] .curtain-panel--left, [data-phase='open'] .curtain-panel--left { transform: translateX(-94%); }
[data-phase='opening'] .curtain-panel--right, [data-phase='open'] .curtain-panel--right { transform: translateX(94%) scaleX(-1); }
[data-phase='opening'] .curtain-invitation { opacity: 0; transform: translateY(-10px); }
[data-phase='open'] .curtain-panel { will-change: auto; transition: none; }

@media (max-width: 600px) {
  .curtain-invitation { padding-inline: 16px; }
  .curtain-title { font-size: clamp(50px, 13.5vw, 80px); }
}

@media (prefers-reduced-motion: reduce) {
  .curtain-panel, .curtain-invitation, .curtain-title { transition: none; }
}
</style>

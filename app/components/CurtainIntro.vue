<script setup lang="ts">
export type CurtainPhase = 'checking' | 'closed' | 'opening' | 'open'

const props = defineProps<{ phase: CurtainPhase }>()
const emit = defineEmits<{ enter: [skipAnimation: boolean] }>()
const invitation = useTemplateRef('invitation')
const enterButton = useTemplateRef('enterButton')

watch(() => props.phase, async (phase) => {
  if (phase === 'closed') {
    await nextTick()
    enterButton.value?.focus({ preventScroll: true })
  }
}, { flush: 'post' })

function trapFocus(event: KeyboardEvent) {
  const buttons = invitation.value?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
  if (!buttons?.length) return
  const first = buttons[0]
  const last = buttons[buttons.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <div
    class="theatre-curtain"
    :data-phase="phase"
    :aria-hidden="phase === 'open' || phase === 'checking' ? true : undefined"
  >
    <div class="curtain-panel curtain-panel--left" aria-hidden="true" />
    <div class="curtain-panel curtain-panel--right" aria-hidden="true" />
    <div class="curtain-pelmet" aria-hidden="true" />

    <div
      v-if="phase === 'closed' || phase === 'opening'"
      ref="invitation"
      class="curtain-invitation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="curtain-title"
      aria-describedby="curtain-description"
      :aria-busy="phase === 'opening'"
      @keydown.tab="trapFocus"
      @keydown.esc.prevent="emit('enter', true)"
    >
      <span class="invitation-eyebrow">A LITTLE THEATRE OF WORDS</span>
      <span class="invitation-rule" aria-hidden="true" />
      <p class="invitation-owner">天马的书房</p>
      <h2 id="curtain-title">每一本书，<br>都是一扇门。</h2>
      <p id="curtain-description">幕布之后，有一些故事等你翻开。</p>
      <button
        ref="enterButton"
        class="enter-button"
        type="button"
        :disabled="phase === 'opening'"
        @click="emit('enter', false)"
      >
        <span>启 幕</span><span aria-hidden="true">↗</span>
      </button>
      <button
        class="skip-button"
        type="button"
        :disabled="phase === 'opening'"
        @click="emit('enter', true)"
      >跳过动画，直接入内 <span aria-hidden="true">→</span></button>
      <span class="invitation-footnote">请随意翻阅 · 不必匆忙</span>
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

.curtain-invitation {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #f4e9d5;
  text-align: center;
  text-shadow: 0 2px 15px #2e0c0a44;
  background: radial-gradient(ellipse at 50% 42%, #220b0d05, #220b0d45);
  transition: opacity .35s, transform .5s;
}

.invitation-eyebrow, .invitation-footnote {
  font: 10px var(--font-sans);
  letter-spacing: .24em;
  color: #d4b997;
}

.invitation-rule {
  width: 36px;
  height: 1px;
  margin: 24px 0 30px;
  background: #d9b87c;
}

.invitation-owner { font: 15px var(--font-serif); letter-spacing: .3em; }

h2 {
  margin: 22px 0;
  font: 400 clamp(38px, 5.2vw, 68px)/1.5 var(--font-serif);
  letter-spacing: .09em;
}

#curtain-description { color: #e0c6b4; font-size: 13px; letter-spacing: .12em; line-height: 1.8; }

.enter-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  margin-top: 36px;
  padding: 15px 25px;
  border: 1px solid #ebd5ab;
  background: #ebd5ab;
  color: #4b2226;
  font: 500 15px var(--font-serif);
  cursor: pointer;
  text-shadow: none;
  transition: background .2s, transform .2s;
}

.enter-button:hover { background: #fff0d4; transform: translateY(-2px); }
.skip-button { margin-top: 18px; padding: 8px; color: #e0c6b4; background: none; border: 0; font-size: 11px; cursor: pointer; }
.skip-button:hover { color: #fff3df; }
.invitation-footnote { margin-top: 58px; font-size: 10px; letter-spacing: .18em; }

[data-phase='opening'], [data-phase='open'] { pointer-events: none; }
[data-phase='opening'] .curtain-panel--left, [data-phase='open'] .curtain-panel--left { transform: translateX(-94%); }
[data-phase='opening'] .curtain-panel--right, [data-phase='open'] .curtain-panel--right { transform: translateX(94%) scaleX(-1); }
[data-phase='opening'] .curtain-invitation { opacity: 0; transform: translateY(-10px); }
[data-phase='open'] .curtain-panel { will-change: auto; transition: none; }

@media (max-height: 650px) {
  h2 { margin: 12px 0; font-size: 34px; }
  .invitation-rule { margin: 12px 0 16px; }
  .enter-button { margin-top: 20px; }
  .invitation-footnote { margin-top: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .curtain-panel, .curtain-invitation, .enter-button { transition: none; }
}
</style>

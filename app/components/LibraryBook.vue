<script setup lang="ts">
import type { LibraryBook } from '~/data/library'

defineProps<{ book: LibraryBook }>()
</script>

<template>
  <NuxtLink
    :to="`/${book.slug}`"
    class="library-book"
    :class="`library-book--${book.color}`"
    :aria-label="`翻开${book.title}：${book.description}`"
  >
    <div class="book-cover">
      <span class="book-number" aria-hidden="true">{{ book.number }} / 天马藏书</span>
      <span class="book-english">{{ book.english }}</span>
      <span class="book-title"><span v-for="(character, index) in book.title" :key="index">{{ character }}</span></span>
      <span class="book-ornament" aria-hidden="true">✧</span>
      <span class="book-subtitle">{{ book.subtitle }}</span>
      <span class="book-open" aria-hidden="true">翻 开 <span>↗</span></span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.library-book {
  --cover: #3d5548;
  --cover-light: #60715d;
  --ink: #eee0b9;
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: var(--book-width);
  height: var(--book-height);
  color: var(--ink);
  font-size: calc(var(--book-height) / 12);
  text-decoration: none;
  perspective: 800px;
  transform-origin: 50% 95%;
  transition: transform .4s cubic-bezier(.2, .7, .3, 1), filter .4s;
  -webkit-tap-highlight-color: transparent;
  filter: drop-shadow(7px 7px 5px #0003);
}

.library-book::before {
  content: '';
  position: absolute;
  inset: 3px -6px 3px 8px;
  border: 1px solid #c4b399;
  border-radius: 0 3px 3px 0;
  background: repeating-linear-gradient(0deg, #ded5bf 0 1px, #f4ecda 1px 3px);
  transform: skewY(-1deg);
}

.book-cover {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: .75em .75em .6em 1.1em;
  border: 1px solid #fff2;
  border-radius: 2px 3px 3px 2px;
  background:
    linear-gradient(90deg, #0004 0, #fff2 3px, #0002 6px, transparent 10px),
    linear-gradient(115deg, var(--cover-light), var(--cover) 45%);
  box-shadow: inset 10px 0 10px -9px #0009, inset -1px 0 1px #fff3;
  transition: transform .4s cubic-bezier(.2, .7, .3, 1);
  transform-origin: left;
}

.book-cover::after {
  content: '';
  position: absolute;
  inset: 8px 7px 8px 13px;
  border: 1px solid currentColor;
  opacity: .25;
  pointer-events: none;
}

.book-number { align-self: flex-start; font: .5em/1.2 var(--font-serif); letter-spacing: .08em; opacity: .7; }
.book-english { margin-top: 1.7em; font: .44em/1.2 var(--font-sans); letter-spacing: .16em; text-align: center; }
.book-title { flex-shrink: 0; margin-top: .3em; font: 400 2em/1.25 var(--font-serif); letter-spacing: .17em; padding-left: .17em; }
.book-ornament { margin-top: .25em; font-size: .9em; line-height: 1; opacity: .7; }
.book-subtitle { margin-top: auto; font: .55em/1.4 var(--font-serif); letter-spacing: .12em; }
.book-open { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 1.1em; padding-top: .8em; border-top: 1px solid #ffffff2b; font-size: .5em; line-height: 1; letter-spacing: .1em; }
.book-open > span { font-size: 1.5em; }

.library-book--wine { --cover: #753d3a; --cover-light: #94544a; }
.library-book--indigo { --cover: #3e4c64; --cover-light: #65728a; }
.library-book--linen { --cover: #c3b497; --cover-light: #e0d3b8; --ink: #443f35; }
.library-book--linen .book-open { border-color: #443f3533; }
.library-book--forest .book-title { display: flex; flex-direction: column; align-items: center; gap: .15em; margin-top: .4em; padding: 0; font-size: 1.65em; line-height: 1.2; letter-spacing: .12em; }
.library-book--forest .book-ornament { display: none; }
.library-book--indigo .book-ornament { font-size: 1.2em; }
.library-book:hover, .library-book:focus-visible { transform: translateY(-12px) rotate(-2deg); filter: drop-shadow(10px 18px 10px #0005); z-index: 2; }
.library-book:hover .book-cover, .library-book:focus-visible .book-cover { transform: rotateY(-9deg); }
.library-book:focus-visible { outline: 2px solid #f2d69b; outline-offset: 9px; }

@media (max-width: 600px) {
  .book-cover::after { inset: 6px 5px 6px 10px; }
  .book-english { letter-spacing: .1em; }
  .book-subtitle { letter-spacing: .05em; }
}

@media (prefers-reduced-motion: reduce) {
  .library-book, .book-cover { transition: none; }
  .library-book:hover, .library-book:focus-visible { transform: none; }
  .library-book:hover .book-cover, .library-book:focus-visible .book-cover { transform: none; }
}
</style>

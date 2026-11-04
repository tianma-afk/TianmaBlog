<script setup lang="ts">
import { shelfTiers } from '~/data/library'
</script>

<template>
  <nav class="bookshelf" aria-label="选择一本书，进入栏目">
    <div
      v-for="(tier, index) in shelfTiers"
      :key="index"
      class="shelf-tier"
      :class="`shelf-tier--${index + 1}`"
    >
      <div class="shelf-books">
        <div v-if="tier.decoration === 'left' || tier.decoration === 'both'" class="decorative-books" aria-hidden="true">
          <span class="decorative-spine decorative-spine--olive" />
          <span class="decorative-spine decorative-spine--sand" />
          <span v-if="index === 2" class="decorative-spine decorative-spine--clay" />
        </div>
        <LibraryBook v-for="book in tier.books" :key="book.slug" :book="book" />
        <div v-if="tier.decoration === 'right' || tier.decoration === 'both'" class="decorative-books decorative-books--right" aria-hidden="true">
          <span class="decorative-spine decorative-spine--clay" />
          <span class="decorative-spine decorative-spine--olive" />
          <span v-if="index === 2" class="decorative-spine decorative-spine--sand" />
        </div>
      </div>
      <div class="shelf-board" aria-hidden="true"><span>{{ ['I', 'II', 'III'][index] }}</span></div>
    </div>
    <div class="shelf-plinth" aria-hidden="true" />
  </nav>
</template>

<style scoped>
.bookshelf {
  --book-height: clamp(132px, calc((100svh - 470px) / 3), 191px);
  --book-width: calc(var(--book-height) * .7);
  position: relative;
  width: min(800px, 100%);
  margin: 18px auto 0;
  padding-bottom: 14px;
  isolation: isolate;
}

.bookshelf::before {
  content: '';
  position: absolute;
  z-index: -1;
  width: 88%;
  height: 35px;
  bottom: -3px;
  left: 6%;
  border-radius: 50%;
  background: #080c08;
  filter: blur(20px);
  opacity: .65;
}

.shelf-tier { position: relative; margin: 0 auto; }
.shelf-tier--1 { width: 45%; }
.shelf-tier--2 { width: 73%; }
.shelf-tier--3 { width: 100%; }

.shelf-books {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: clamp(24px, 4vw, 52px);
  min-height: calc(var(--book-height) + 8px);
  padding: 0 16px;
}

.shelf-tier--1 .shelf-books { padding-right: 34px; }
.shelf-tier--2 .shelf-books { padding-left: 44px; }
.shelf-tier--3 .shelf-books { gap: clamp(35px, 8vw, 105px); }

.shelf-board {
  position: relative;
  height: 20px;
  border-top: 4px solid #b28a5b;
  border-bottom: 2px solid #3d2b1c;
  background: linear-gradient(180deg, #886140, #684a32 75%, #5c412b);
  box-shadow: 0 7px 12px #0005, inset 0 1px #d9b68b66;
}

.shelf-board::before {
  content: '';
  position: absolute;
  inset: -9px 0 auto;
  height: 5px;
  background: #c1a078;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%);
}

.shelf-board span { position: absolute; left: 15px; top: 1px; color: #e7c694aa; font: 8px var(--font-serif); letter-spacing: .12em; }
.shelf-plinth { width: 86%; height: 17px; margin: 0 auto; background: linear-gradient(90deg, #3d3024, #6f5135 15%, #6f5135 85%, #3d3024); box-shadow: 0 3px 0 #241e16; }

.decorative-books { display: flex; align-items: flex-end; gap: 4px; }
.decorative-spine { position: relative; width: 22px; height: calc(var(--book-height) * .64); border-radius: 2px 2px 0 0; box-shadow: inset 3px 0 4px #0003, inset -1px 0 #fff2, 3px 0 3px #0003; background: #575b43; }
.decorative-spine::after { content: ''; position: absolute; inset: 13px 3px 16px; border-block: 3px double #e5c89688; }
.decorative-spine--sand { width: 27px; height: calc(var(--book-height) * .75); background: #a89a76; transform: rotate(-6deg); transform-origin: bottom; margin-left: 5px; }
.decorative-spine--clay { width: 20px; height: calc(var(--book-height) * .7); background: #815542; }
.decorative-books--right .decorative-spine--sand { transform: rotate(8deg); margin-left: 1px; }

@media (min-width: 900px) and (min-height: 900px) {
  .bookshelf { margin-top: 34px; }
}

@media (max-width: 600px) {
  .bookshelf { --book-width: 99px; --book-height: 156px; width: 100%; margin-top: 16px; }
  .shelf-tier--1 { width: 63%; }
  .shelf-tier--2 { width: 84%; }
  .shelf-books { min-height: calc(var(--book-height) + 14px); gap: 18px; padding-inline: 8px; }
  .shelf-tier--1 .shelf-books { padding-right: 18px; }
  .shelf-tier--2 .shelf-books { padding-inline: 10px; gap: 22px; }
  .shelf-tier--2 .decorative-books { display: none; }
  .shelf-tier--3 .shelf-books { gap: clamp(16px, 5vw, 30px); }
  .decorative-books { gap: 3px; }
  .decorative-spine { width: 14px; height: 88px; }
  .decorative-spine--sand { width: 17px; height: 104px; }
  .decorative-spine--clay { width: 13px; height: 96px; }
  .shelf-board { height: 18px; border-top-width: 3px; }
  .shelf-board::before { inset-block-start: -7px; height: 4px; }
}
</style>

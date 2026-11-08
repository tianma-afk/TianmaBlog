<script setup lang="ts">
defineProps<{ name: 'phone' | 'mail' | 'github' | 'school' | 'degree' | 'chart' | 'user' | 'print' | 'arrow' }>()
const paths = {
  phone: ['M8 2h8v20H8z', 'M11 18h2'],
  mail: ['M3 5h18v14H3z', 'm3 5 9 8 9-8'],
  github: ['M9 19c-4 1-4-2-6-2', 'M9 22v-4c-4-1-5-3-5-6 0-2 1-3 2-4 0-1-1-3 0-4 2 0 3 1 4 1a13 13 0 0 1 4 0c1 0 2-1 4-1 1 1 0 3 0 4 1 1 2 2 2 4 0 3-1 5-5 6v4'],
  school: ['m3 10 9-7 9 7v11H3z', 'M9 21v-7h6v7', 'M12 7v3'],
  degree: ['m2 8 10-5 10 5-10 5z', 'M6 10v6c3 3 9 3 12 0v-6', 'M22 8v7'],
  chart: ['M4 3v17h17', 'M8 16v-5', 'M13 16V7', 'M18 16V4'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M4 21v-2a8 6 0 0 1 16 0v2'],
  print: ['M6 9V3h12v6', 'M6 18H3V9h18v9h-3', 'M6 14h12v7H6z'],
  arrow: ['M20 12H4', 'm10 6-6 6 6 6'],
} as const
</script>

<template>
  <svg class="resume-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
    <path v-for="(path, index) in paths[name]" :key="index" :d="path" />
  </svg>
</template>

<script setup lang="ts">
const { isCvHost } = useSiteLinks()
</script>

<template>
  <ResumeDocument v-if="isCvHost" />
  <ReadingRoom v-else />
</template>

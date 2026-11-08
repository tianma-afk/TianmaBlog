<script setup lang="ts">
defineProps<{
  name: string
  description?: string
  role: string
  techs?: readonly { name: string, icon: string, monochrome?: boolean }[]
}>()
</script>

<template>
  <section class="resume-entry">
    <header class="resume-entry-heading">
      <h3>{{ name }}</h3>
      <span v-if="description" class="resume-entry-description">{{ description }}</span>
      <span class="resume-entry-role">{{ role }}</span>
    </header>
    <ul v-if="techs?.length" class="resume-techs" aria-label="技术栈">
      <li v-for="tech in techs" :key="tech.name">
        <img class="resume-tech-icon" :src="tech.icon" :data-monochrome="tech.monochrome ? '' : undefined" alt="" aria-hidden="true" width="16" height="16">{{ tech.name }}
      </li>
    </ul>
    <slot />
  </section>
</template>

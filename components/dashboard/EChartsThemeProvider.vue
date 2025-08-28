<template>
  <slot />
</template>

<script setup lang="ts">
import { provide, computed } from 'vue'

/**
 * ECharts Theme Provider Component
 * Uses the official nuxt-echarts THEME_KEY system to provide proper theming
 * This is the recommended approach according to nuxt-echarts documentation
 */

const colorMode = useColorMode()

// Computed theme that reacts to color mode changes
const echartsTheme = computed(() => {
  return colorMode.value === 'dark' ? 'dark' : undefined // ECharts uses 'dark' or undefined (default light)
})

// Provide the theme using nuxt-echarts THEME_KEY
// THEME_KEY is auto-imported from nuxt-echarts
provide(THEME_KEY, echartsTheme)
</script>
<template>
  <svg aria-hidden="true" :style="{ width:size, height:size }">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script lang="ts">
// 参考:https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md
import { size } from 'fp-ts/lib/ReadonlyRecord'
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'SvgIcon',
  props: {
    prefix: {
      type: String,
      default: 'icon'
    },
    name: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '20px',
    }
  },
  setup(props) {
    const symbolId = computed(() => `#${props.prefix}-${props.name}`)
    return { symbolId }
  }
})
</script>

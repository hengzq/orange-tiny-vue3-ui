<template>
  <svg aria-hidden="true" :style="{ width, height }">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script lang="ts">
  // 参考:https://github.com/vbenjs/vite-plugin-svg-icons/blob/main/README.zh_CN.md
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
      width: {
        type: String,
        default: '16px',
      },
      height: {
        type: String,
        default: '16px',
      },
    },
    setup(props) {
      const symbolId = computed(() => `#${props.prefix}-${props.name}`)
      return { symbolId }
    }
  })
</script>


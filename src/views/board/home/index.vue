<template>
  <div class="container">
<!--    <Main></Main>-->
<!--    <Curve></Curve>-->
<!--    <Falls></Falls>-->
<!--    <Round></Round>-->
    <chat-index ref="chatIndexRef" :conversation-param="formData" />
  </div>
</template>

<script lang="ts" setup>
  import ChatIndex from '@/components/chat/index.vue';
  import { ref } from 'vue';
  import { ConversationParam } from '@/api/large-model/chat';
  import Main from './components/main.vue';
  import Curve from './components/curve.vue';
  import Falls from './components/falls.vue';
  import Round from './components/round.vue';

  const formData = ref<ConversationParam>({
    modelCode: 'qwen2.5-3b-instruct',
    platform: 'ALI_BAI_LIAN',
  });
</script>

<style scoped lang="less">
  .container {
    width: 100%;
    height: inherit;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-xs) {
    .container {
      overflow-x: auto;
    }
  }
</style>

<template>
  <div class="chat-item">

    <div v-if="message.role === 'USER'" class="item question">
      <md-preview :model-value="message.content"/>
      <tiny-user-head type="icon" round min style="display: flex;align-items: center; padding-left: 10px">
        <div class="user-avatar">
          <img src="@/assets/images/avatar.png" alt="user"/>
        </div>
      </tiny-user-head>
    </div>

    <div v-if="message.role === 'ASSISTANT'" class="item answer">
      <tiny-user-head type="icon" round min style="display: flex;align-items: flex-start; padding-right: 10px">
        <div class="user-avatar">
          <img src="/favicon.ico" alt="user"/>
        </div>
      </tiny-user-head>
      <div class="answer-content">
        <div v-if="message.content === '' || !message.content" class="loading-answer-content">
          <md-preview v-model="loadingContent" style="width: fit-content;padding: 0px;"/>
          <chat-reasoning/>
        </div>
        <md-preview v-else :model-value="message.content" style="width: 100%"/>
      </div>
    </div>

  </div>
</template>
<script setup lang="ts">
import {MdPreview} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import {defineProps, PropType, ref} from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";
import ChatReasoning from '@/components/chat-reasoning/index.vue'

const loadingContent = ref("思考中")

const props = defineProps({
  message: {
    type: Object as PropType<SessionMessageApi.SessionMessageVO>,
    required: true
  },
});

</script>
<style lang="less" scoped>
.chat-item {
  .item {
    margin: 15px 0;
    display: flex;

    .user-avatar {
      background-color: #ffffff;
      display: flex;
      height: 100%;
      width: 100%;
    }
  }

  .question {
    justify-content: flex-end;
    flex-direction: row;

    .md-editor {
      background-color: var(--tv-color-bg);
      border-radius: 10px;
      width: fit-content;
    }
  }

  .answer {
    .answer-content {
      background-color: var(--tv-color-bg);
      border-radius: 10px;
      padding-right: 10px;
      width: calc(100% - 80px);

      .loading-answer-content {
        display: flex;
        flex-direction: row;

        :deep(.md-editor-preview-wrapper) {
          padding: 5px 5px 5px 12px;
        }
      }
    }

    .md-editor {
      background-color: var(--tv-color-bg);
      border-radius: 10px;
    }

  }
}

:deep(.md-editor-preview-wrapper) {
  padding: 5px 12px;
}

:deep(.md-editor-preview) {
  font-size: 13px !important;
}

</style>
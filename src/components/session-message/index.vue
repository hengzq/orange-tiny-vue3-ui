<template>
  <div ref="content" class="session-content">
    <template v-for="(item, index) in messageList" :key="index">
      <chat-item :message="item" />
    </template>
  </div>
</template>

<script setup lang="ts">
import * as SessionMessageApi from "@/api/large-model/session-message";
import ChatItem from '@/components/chat-item/index.vue';
import { defineProps, PropType, ref } from "vue";

const loadingContent = ref("思考中")

const props = defineProps({
  messageList: {
    type: Array as PropType<SessionMessageApi.SessionMessageVO[]>,
    required: true
  },
  showTool: {
    type: Boolean,
    required: false,
    default: true
  }
});


</script>

<style lang="less" scoped>
.session-content {
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 0 20px;
}

.session-content .item {
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
  }

  .loading-answer-content {
    display: flex;
    flex-direction: row;

    :deep(.md-editor-preview-wrapper) {
      padding: 5px 5px 5px 12px;
    }
  }

  .md-editor {
    background-color: var(--tv-color-bg);
    border-radius: 10px;
  }

  .tools {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
  }
}

:deep(.tiny-button) {
  min-width: 30px !important;
}

:deep(.md-editor-preview-wrapper) {
  padding: 5px 12px;
}

:deep(.md-editor-preview) {
  font-size: 13px !important;
}
</style>
<template>
  <div class="session-content" ref="content">
    <template v-for="(item, index) in messageList" :key="index">
      <chat-item :message="item"/>
<!--      <chat-reasoning/>-->

      <!--    大模型回答   -->
      <!--      <div v-if="item.role === 'ASSISTANT'" class="item answer">-->
      <!--        <tiny-user-head type="icon" round min style="display: flex;align-items: flex-start; padding-right: 10px">-->
      <!--          <div class="user-avatar">-->
      <!--            <img src="/favicon.ico" alt="user"/>-->
      <!--          </div>-->
      <!--        </tiny-user-head>-->

      <!--        <div class="answer-content">-->
      <!--          <div v-if="item.content === '' || !item.content" class="loading-answer-content">-->
      <!--            <md-preview v-model="loadingContent" style="width: fit-content;padding: 0px;"/>-->
      <!--            <div class="dots">-->
      <!--              <div></div>-->
      <!--              <div></div>-->
      <!--              <div></div>-->
      <!--            </div>-->
      <!--          </div>-->

      <!--          <md-preview v-else v-model="item.content" style="width: 100%"/>-->
      <!--        </div>-->


      <!--        <div class="tools" v-if="showTool">-->
      <!--          <tiny-tooltip type="info" content="复制" placement="top">-->
      <!--            <tiny-button type="text" @click="copyInfo(item)">-->
      <!--              <svg-icon name="system-copy" width="18" height="18" color="#3f3f3f"/>-->
      <!--            </tiny-button>-->
      <!--          </tiny-tooltip>-->
      <!--          <tiny-tooltip type="info" content="点赞" placement="top">-->
      <!--            <tiny-button type="text" @click="toRate(item, 'THUMBS_UP')">-->
      <!--              <svg-icon-->
      <!--                name="system-good" width="18" height="18"-->
      <!--                :color="-->
      <!--                    item.rating === 'THUMBS_UP'-->
      <!--                      ? 'var(&#45;&#45;ti-button-primary-normal-border-color)'-->
      <!--                      : '#3f3f3f'-->
      <!--                  "-->
      <!--              />-->
      <!--            </tiny-button>-->
      <!--          </tiny-tooltip>-->
      <!--          <tiny-tooltip type="info" content="点踩" placement="top">-->
      <!--            <tiny-button type="text" @click="toRate(item, 'THUMBS_DOWN')">-->
      <!--              <svg-icon-->
      <!--                name="system-bad" width="18" height="18"-->
      <!--                :color="-->
      <!--                    item.rating === 'THUMBS_DOWN'-->
      <!--                      ? 'var(&#45;&#45;ti-button-primary-normal-border-color)'-->
      <!--                      : '#3f3f3f'-->
      <!--                  "-->
      <!--              />-->
      <!--            </tiny-button>-->
      <!--          </tiny-tooltip>-->
      <!--        </div>-->
      <!--      </div>-->
    </template>
  </div>
</template>

<script setup lang="ts">
import {defineProps, PropType, ref} from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";
import ChatItem from '@/components/chat-item/index.vue'
import ChatReasoning from '@/components/chat-reasoning/index.vue'

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
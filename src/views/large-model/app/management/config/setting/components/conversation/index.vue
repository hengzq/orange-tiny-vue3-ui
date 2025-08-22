<template>
  <div class="s-chat-container">
    <div class="title">
      <div class="left">
        <h5> 调试与预览</h5>
      </div>
      <div class="right">
        <tiny-button class="right-btn" @click="clearSession">
          <svg-icon name="system-trash" :width="18" :height="18" />
        </tiny-button>
      </div>
    </div>
    <div class="dialog">
      <chat-index ref="chatIndexRef" :message-list="sessionMessageList" @send="handleSubmit" @stop="handleStop"
        @refresh="queryHistoryChatList" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ChatIndex from '@/components/chat/index.vue'

import { getToken } from "@/utils/auth";
import * as AppApi from "@/api/large-model/app";
import * as ChatApi from '@/api/large-model/chat';
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { defineProps, PropType, Ref, ref } from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";

const emit = defineEmits(['refresh']);

const { VITE_API_BASE_URL } = import.meta.env || {};

const props = defineProps({
  app: {
    type: Object as PropType<AppApi.AppVO>,
    required: true
  }
});

const sessionMessageList: Ref<SessionMessageApi.SessionMessageVO[]> = ref([])

const queryHistoryChatList = (sessId: string) => {
  if (sessId) {
    SessionMessageApi.listSessionMessage({
      sessionId: sessId,
    }).then((res) => {
      sessionMessageList.value = res.data;
    });
  }
  formData.value.sessionId = sessId
};

const formData = ref<ChatApi.ConversationParam>({});
const handleSubmit = (prompt: string) => {
  formData.value.prompt = prompt;
  sendMessageStream()
};

const handleStop = () => {
  if (!formData.value.sessionId) return;
  ChatApi.stopBySessionId(formData.value.sessionId).then(() => {
    console.log('停止会话成功');
  });
};

const chatIndexRef = ref<InstanceType<typeof ChatIndex>>()

const sendMessageStream = async () => {
  if (!formData.value.prompt) {
    return;
  }

  sessionMessageList.value.push({
    role: 'USER',
    content: formData.value.prompt || '',
  });
  // 占位使用 获取答案信息
  sessionMessageList.value.push({
    role: 'ASSISTANT',
    content: '',
    generating: true,
  });
  const conversationParam = {
    ...formData.value,
    appId: props.app?.id,
    'sessionType': 'AGENT_DEBUG'
  };
  formData.value.prompt = '';
  let refreshed = false;
  await fetchEventSource(
    `${VITE_API_BASE_URL}${AppApi.CONVERSATION_STREAM}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(conversationParam),
      openWhenHidden: true,
      onmessage(event) {
        // 刷新会话列表
        if (!refreshed) {
          refreshed = true;
          emit('refresh', {});
        }
        const { code, msg, data } = JSON.parse(event.data);
        let last = sessionMessageList.value[sessionMessageList.value.length - 1];
        if (code !== '200') {
          last.content += msg;
          last.generating = false;
          return
        }
        last.content += data.content;
        last.generating = data.event !== 'FINISHED';
        formData.value.sessionId = data.sessionId
      },
      onclose() {
        console.log('close stream.');
      },
      onerror(err) {
        console.log(err);
      },
    },
  );
  chatIndexRef.value?.replyComplete()
};

const clearSession = () => {
  sessionMessageList.value = []
  formData.value = {}
}

</script>


<style lang="less" scoped>
:deep(.tiny-button) {
  min-width: 20px;
  border: none;
  background-color: transparent;
  padding: 10px;
}

:deep(.tiny-button:hover) {
  min-width: 20px !important;
  border: none;
  background-color: #f3f4f7;
}

.s-chat-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;

  .title {
    padding: 10px;
    display: flex;
    justify-content: space-between;
    line-height: 32px;
    background-color: #cdd0dc26;
    border-bottom: 1px solid #26244c0d;

    h5 {
      margin: 0;
      color: var(--ti-base-common-title-color);
      font-weight: 500;
      font-size: 16px;
      letter-spacing: 0.55px;
    }
  }

  .dialog {
    height: calc(100% - 50px);
    margin: 0 20px;
    padding-bottom: 10px;
  }
}

.right-btn {
  color: #26244ca6 !important;
}
</style>
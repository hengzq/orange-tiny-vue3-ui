<template>
  <div class="container">
    <chat-index
      ref="chatIndexRef"
      :message-list="sessionMessageList"
      @send="handleSubmit"
      @refresh="queryHistoryChatList"/>
  </div>
</template>

<script lang="ts" setup>
import ChatIndex from '@/components/chat/index.vue'

import {getToken} from "@/utils/auth";
import * as ChatApi from '@/api/large-model/chat';
import * as AppApi from "@/api/large-model/app";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import {defineProps, PropType, Ref, ref} from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";

const emit = defineEmits(['refresh']);

const {VITE_API_BASE_URL} = import.meta.env || {};

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
const chatSender = ref()
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
    'sessionType': 'AGENT'
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
        const {code, msg, data} = JSON.parse(event.data);
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
  chatSender.value.replyComplete()
};

const addSession = () => {
  sessionMessageList.value = []
  formData.value = {}
}

defineExpose({
  addSession,
  queryHistoryChatList,
});
</script>


<style lang="less" scoped>

:deep(.tiny-button) {
  min-width: 30px !important;
}

.container {
  height: calc(100vh - 100px);
  width: 100%;
  padding: 0 15%;
  background-color: #ffffff;
}
</style>
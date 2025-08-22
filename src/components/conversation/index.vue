<template>
  <tiny-dialog-box :visible="visible" title="Orange AI 助手" width="25%" max-height="800px" draggable :modal="false"
    :close-on-click-modal="false" @close="close">
    <div class="container_x5eE">
      <chat-index ref="chatIndexRef" :message-list="sessionMessageList" @send="handleSubmit" @stop="handleStop"
        @refresh="queryHistoryChatList" />
    </div>
  </tiny-dialog-box>

</template>

<script lang="ts" setup>
import ChatIndex from '@/components/chat/index.vue'

import { getToken } from "@/utils/auth";
import * as ChatApi from '@/api/large-model/chat';
import * as AppApi from "@/api/large-model/app";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { defineProps, PropType, Ref, ref } from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";

const visible = ref(false);

const emit = defineEmits(['refresh']);

const app = ref<AppApi.AppVO>()
const sessionIdKey = ref<string>('ai-session-id')

const { VITE_API_BASE_URL } = import.meta.env || {};

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
    appId: app.value?.id,
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
        if (!localStorage.getItem(sessionIdKey.value)) {
          localStorage.setItem(sessionIdKey.value, data.sessionId)
        }
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

const close = () => {
  visible.value = false;
};

const open = () => {
  visible.value = true;
  AppApi.getLatestAppById("1", true).then((res) => {
    app.value = res.data;
  });
  const sessionId = localStorage.getItem(sessionIdKey.value)
  if (sessionId) {
    queryHistoryChatList(sessionId);
  }
};


defineExpose({
  open,
});
</script>


<style lang="less" scoped>
:deep(.tiny-dialog-box .tiny-dialog-box__body) {
  padding: 0;
}


.container_x5eE {
  height: 580px;
  width: 100%;
  padding: 10px 20px;
  background-color: #ffffff;
}
</style>
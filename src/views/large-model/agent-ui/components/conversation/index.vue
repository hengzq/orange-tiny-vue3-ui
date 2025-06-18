<template>
  <div>
    <session-message-index :message-list="sessionMessageList" :show-tool="false" class="session-message"/>
    <div class="dialog">
      <md-editor
        v-model="formData.prompt"
        :toolbars="toolbars"
        :footers="footers"
        :preview="false"
        class="editor"
        @keyup.enter="sendMessageStream"
      />
      <div class="tools">
        <tiny-button type="text" @click="sendMessageStream" class="btn-send">
          <svg-icon name="system-send" width="18" height="18" color="#ffffff"/>
        </tiny-button>
      </div>
    </div>

  </div>
</template>

<script lang="ts" setup>
import SessionMessageIndex from '@/components/session-message/index.vue';
import {getToken} from "@/utils/auth";
import * as AgentApi from "@/api/large-model/agent";
import * as ChatApi from "@/api/large-model/chat";
import {fetchEventSource} from "@microsoft/fetch-event-source";
import {MdEditor} from "md-editor-v3";
import {defineProps, PropType, Ref, ref} from "vue";
import * as SessionMessageApi from "@/api/large-model/session-message";

const emit = defineEmits(['refresh']);

const {VITE_API_BASE_URL} = import.meta.env || {};

const props = defineProps({
  agent: {
    type: Object as PropType<AgentApi.AgentVO>,
    required: true
  }
});

const toolbars: any[] = [];
const footers: any[] = [];


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

const formData = ref<AgentApi.ConversationParam>({});
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
    agentId: props.agent.id,
    'sessionType': 'AGENT'
  };
  formData.value.prompt = '';
  let refreshed = false;
  await fetchEventSource(
    `${VITE_API_BASE_URL}${ChatApi.AGENT_CONVERSATION_STREAM}`,
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

.session-message {
  height: calc(100vh - 280px);
}

:deep(.tiny-button) {
  min-width: 30px !important;
}

.dialog {
  margin: 0 20px;
  border: 1px solid #e6e6e6;
  border-radius: 20px;
  background-color: #ffffff;
  padding: 0 15px 10px 0;

  .editor {
    height: calc(100% - 30px);
    border-radius: 20px;
    border: none;
  }

  .tools {
    display: flex;
    justify-content: flex-end;
    height: 35px;
    line-height: 35px;

    .btn-send {
      display: grid;
      place-items: center;
      background-color: #356bfd;
      border: 1px solid;
      border-radius: 10%;
    }
  }
}
</style>
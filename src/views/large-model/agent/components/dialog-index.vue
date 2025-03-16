<template>
  <div>
    <session-message-index :message-list="chatList" :show-tool="false" class="session-message"/>
    <div class="footer">
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
import {defineProps, getCurrentInstance, PropType, ref, Ref} from 'vue';
import SessionMessageIndex from '@/components/session-message/index.vue';
import * as ChatApi from '@/api/large-model/chat';
import * as AgentApi from '@/api/large-model/agent';
import * as SessionMessageApi from '@/api/large-model/session-message';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {getToken} from '@/utils/auth';
import {useClipboard} from '@vueuse/core';

const {copy} = useClipboard();
const {proxy} = getCurrentInstance() as any;
// const emit = defineEmits(['refresh', 'validate']);

const toolbars: any[] = [];
const footers: any[] = [];

const {VITE_API_BASE_URL} = import.meta.env || {};
const props = defineProps({
  agentParam: {
    type: Object as PropType<AgentApi.AgentVO>,
    required: true,
  },
});

const chatList: Ref<SessionMessageApi.SessionMessageVO[]> = ref([]);
const queryHistoryChatList = (sessId = props.conversationParam.sessionId) => {
  if (props.conversationParam.sessionId) {
    SessionMessageApi.listSessionMessage({
      sessionId: sessId,
    }).then((res) => {
      chatList.value = res.data;
    });
  }
};

const formData = ref<ChatApi.ConversationParam>({});
const sendMessageStream = async () => {
  if (!formData.value.prompt) {
    return;
  }
  let valid = false;
  // 参数校验
  // await emit('validate', (result: boolean) => {
  //   valid = result;
  // });
  // if (!valid) {
  //   return;
  // }

  chatList.value.push({
    role: 'USER',
    content: formData.value.prompt || '',
  });
  // 占位使用 获取答案信息
  chatList.value.push({
    role: 'ASSISTANT',
    content: '',
    generating: true,
  });
  const conversationParam = {
    ...props.agentParam,
    ...formData.value,
  };
  formData.value.prompt = '';
  await fetchEventSource(
      `${VITE_API_BASE_URL}${AgentApi.DEBUG_CONVERSATION_STREAM_URL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(conversationParam),
        openWhenHidden: true,
        onmessage(event) {
          const {data} = JSON.parse(event.data);
          let last = chatList.value[chatList.value.length - 1];
          last.content += data.content;
          last.generating = data.event !== 'FINISHED';
          last.id = data.id
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

const copyInfo = (item: SessionMessageApi.SessionMessageVO) => {
  copy(item.content || '').then(() => {
    proxy.$modal.message({message: '复制成功', status: 'success'});
  });
};

const toRate = (item: SessionMessageApi.SessionMessageVO, rating?: string) => {
  if (!item || !item.id || !rating) {
    return;
  }
  const param = {
    id: item.id,
    rating,
  } as SessionMessageApi.SessionMessageVO;
  SessionMessageApi.rateSessionMessageById(item.id, param)
      .then((res) => {
        proxy.$modal.message({message: '感谢支持', status: 'success'});
        item.rating = rating;
      })
};

const addChatSession = () => {
  chatList.value = [];
};

defineExpose({});
</script>

<style lang="less" scoped>
.session-message {
  height: calc(100vh - 350px);
}

.footer {
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

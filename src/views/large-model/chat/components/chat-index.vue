<template>
  <div class="chat-container">
    <div class="content">
      <tiny-card v-if="sessionMessageList.length == 0" auto-width="100%">
        <h1>欢迎体验AI 聊天大模型</h1>
        <p style="font-size: 13px; text-indent: 2em">
          在这里，您可以亲身体验来自阿里、智谱、OpenAI等顶尖供应商的聊天大模型在实际业务场景中的效果。
          我们的平台支持快速接入和便捷测试，让您轻松对比不同模型的表现，找到最适合您需求的解决方案。
        </p>
        <tiny-alert size="large" title="提示" type="warning" :closable="false">
          <h4>
            1.模型既有免费版本也有付费版本，具体费用详情请在模型管理页面查看.
          </h4>
          <h4>2.请避免输入有违公序良俗的问题，模型可能无法回答不合适的问题.</h4>
        </tiny-alert>
      </tiny-card>
      <session-message-index :message-list="sessionMessageList" :show-tool="false" class="session-message"/>
    </div>

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
import * as ChatApi from '@/api/large-model/chat';
import * as SessionMessageApi from '@/api/large-model/session-message';
import {fetchEventSource} from '@microsoft/fetch-event-source';
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {getToken} from '@/utils/auth';
import {useClipboard} from '@vueuse/core';
import SessionMessageIndex from "@/components/session-message/index.vue";

const {copy} = useClipboard();
const {proxy} = getCurrentInstance() as any;
const emit = defineEmits(['refresh', 'validate']);

const toolbars: any[] = [];
const footers: any[] = [];

const {VITE_API_BASE_URL} = import.meta.env || {};
const props = defineProps({
  conversationParam: {
    type: Object as PropType<ChatApi.ConversationParam>,
    required: true,
  },
});

const sessionMessageList: Ref<SessionMessageApi.SessionMessageVO[]> = ref([]);
const queryHistoryChatList = (sessId = props.conversationParam.sessionId) => {
  if (props.conversationParam.sessionId) {
    SessionMessageApi.listSessionMessage({
      sessionId: sessId,
    }).then((res) => {
      sessionMessageList.value = res.data;
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
  await emit('validate', (result: boolean) => {
    valid = result;
  });
  if (!valid) {
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
    ...props.conversationParam,
    ...formData.value,
  };
  formData.value.prompt = '';
  let refreshed = false;
  await fetchEventSource(
      `${VITE_API_BASE_URL}${ChatApi.CONVERSATION_STREAM_URL}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify(conversationParam),
        openWhenHidden: true,
        onmessage(event) {
          if (!props.conversationParam.sessionId && !refreshed) {
            refreshed = true;
            emit('refresh', {}, true);
          }
          const {data} = JSON.parse(event.data);
          let last = sessionMessageList.value[sessionMessageList.value.length - 1];
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
  sessionMessageList.value = [];
};

defineExpose({
  addChatSession,
  queryHistoryChatList,
});
</script>

<style lang="less" scoped>
:deep(.tiny-button) {
  min-width: 30px !important;
}

.chat-container {
  width: 98%;
  margin: auto;
}

.content {
  height: calc(100vh - 300px);
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 0 20px;
}

.content .item {
  margin: 15px 0;
  flex-direction: row;
}

.question {
  display: flex;
  justify-content: flex-end;
  width: auto;
}

.answer {
  width: 100%;
  background-color: #ffffff;
  padding: 10px 15px 15px 0;

  .tools {
    display: flex;
    justify-content: flex-end;
    padding: 10px 0;
  }
}

.footer {
  margin: 0 20px;
  //height: 100px;
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

:deep(.md-editor-preview-wrapper) {
  padding: 0 20px !important;
}

:deep(.md-editor-preview) {
  font-size: 13px !important;
}
</style>

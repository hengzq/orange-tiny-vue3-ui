<template>
  <div class="chat-container">
    <div class="content">
      <tiny-card v-if="chatList.length == 0" auto-width="100%">
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
      <div
        v-for="(item, index) in chatList"
        v-else
        :key="index"
        :class="[item.messageType === 'USER' ? 'question' : 'answer', 'card']"
      >
        <md-preview v-model="item.content" />
      </div>
    </div>

    <div class="footer">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="11">
          <tiny-input
            v-model="formData.prompt"
            placeholder="请输入内容"
            @keyup.enter="sendMessageStream"
          ></tiny-input>
        </tiny-col>
        <tiny-col :span="1">
          <tiny-button type="primary" @click="sendMessageStream">
            发送
          </tiny-button>
        </tiny-col>
      </tiny-row>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { defineProps, PropType, ref, Ref, watch } from 'vue';
  import * as ChatApi from '@/api/large-model/chat';
  import * as ChatSessionRecordApi from '@/api/large-model/chat-sesssion-record';
  import { fetchEventSource } from '@microsoft/fetch-event-source';
  import { MdPreview } from 'md-editor-v3';
  import 'md-editor-v3/lib/style.css';
  import { getToken } from '@/utils/auth';

  const emit = defineEmits(['refresh']);

  const { VITE_API_BASE_URL } = import.meta.env || {};
  const props = defineProps({
    conversationParam: {
      type: Object as PropType<ChatApi.ConversationParam>,
      required: true,
    },
  });

  const chatList: Ref<ChatSessionRecordApi.ChatSessionRecordVO[]> = ref([]);

  const queryHistoryChatList = (sessId = props.conversationParam.sessionId) => {
    if (props.conversationParam.sessionId) {
      ChatSessionRecordApi.listChatSessionRecord({
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
    chatList.value.push({
      messageType: 'USER',
      content: formData.value.prompt || '',
    });
    // 占位使用 获取答案信息
    chatList.value.push({ messageType: 'ASSISTANT', content: '' });
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
          const { data } = JSON.parse(event.data);
          let last = chatList.value[chatList.value.length - 1];
          last.content += data.content;
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

  const addChatSession = () => {
    chatList.value = [];
  };

  defineExpose({
    addChatSession,
    queryHistoryChatList,
  });
</script>

<style lang="less" scoped>
  .chat-container {
    width: 98%;
    margin: auto;
  }

  .content {
    height: calc(100vh - 230px);
    overflow-y: auto;
    margin-bottom: 20px;
  }

  .content .card {
    margin: 10px 0px;
  }

  .question {
    display: flex;
    justify-content: flex-end;
    background-color: #f5f5f5;
    width: auto;
    float: right;
  }

  .answer {
    width: 100%;
  }

  .footer {
    //position: relative;
  }

  :deep(.md-editor-preview-wrapper) {
    padding: 0 20px !important;
  }

  :deep(.md-editor-preview) {
    font-size: 13px !important;
  }
</style>

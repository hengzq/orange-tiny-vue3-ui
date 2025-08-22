<template>
  <div class="chat">
    <div ref="chatListRef" class="chat-list">
      <template v-for="(item, index) in messageList" :key="index">
        <chat-item :message="item" />
      </template>
    </div>

    <chat-sender ref="chatSenderRef" @send="handleSend" @stop="handleStop" />
  </div>
</template>

<script lang="ts" setup>
import ChatSender from '@/components/chat-sender/index.vue'
import ChatItem from '@/components/chat-item/index.vue'
import { defineProps, PropType, ref, watch, nextTick } from 'vue';
import * as SessionMessageApi from "@/api/large-model/session-message";

const emit = defineEmits(['refresh', 'send', 'stop']);

const props = defineProps({
  messageList: {
    type: Array as PropType<SessionMessageApi.SessionMessageVO[]>,
    required: true
  },
});

const chatListRef = ref<HTMLElement | null>()

watch(
  () => props.messageList,
  async () => {
    await nextTick()
    if (chatListRef.value) {
      chatListRef.value.scrollTop = chatListRef.value.scrollHeight
    }
  },
  { deep: true }
)

const handleSend = (prompt: string) => {
  emit("send", prompt);
};

const handleStop = () => {
  emit("stop", "");
};

const chatSenderRef = ref<InstanceType<typeof ChatSender>>()
const replyComplete = () => {
  chatSenderRef.value?.replyComplete();
}

defineExpose({
  replyComplete
});
</script>

<style lang="less" scoped>
.chat {
  height: 100%;
  display: flex;
  flex-direction: column;

  .chat-list {
    overflow-y: auto;
    margin-bottom: 20px;
    padding: 0 10px;
    flex-grow: 1;
    /* 自适应剩余空间 */
  }

}
</style>

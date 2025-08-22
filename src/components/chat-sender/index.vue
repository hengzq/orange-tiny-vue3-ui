<template>
  <div class="chat-sender">
    <div class="textarea">
      <tiny-input v-model="prompt" type="textarea" :cols="100" resize="none" placeholder="请输入内容.."
        @keyup.enter="!isComposing ? sendMessage() : null" @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd" />
      <div class="footer">
        <div class="model-select">
          <!--          深度思考-->
        </div>
        <div class="sender-btn">
          <tiny-button v-if="!isStreamLoad" type="text" class="btn-send"
            :style="{ background: prompt == '' ? '#cfd5de' : '#356bfd' }" @click="sendMessage">
            <svg-icon name="system-arrow-top" width="25" height="25" color="#ffffff" />
          </tiny-button>
          <tiny-button v-else type="text" class="btn-send" @click="handleStop">
            <svg-icon name="system-stop" width="18" height="18" color="#ffffff" />
          </tiny-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const emit = defineEmits(['send','stop']);
// 流式加载中
const isStreamLoad = ref(false)
const replyComplete = () => {
  isStreamLoad.value = false;
}


const prompt = ref("")
const sendMessage = () => {
  if (isStreamLoad.value) return; // 回复中，禁止再次发送给消息
  isStreamLoad.value = true;
  emit("send", prompt.value);
  prompt.value = "";
}

const handleStop = () => {
  isStreamLoad.value = false;
  emit("stop", ""); 
};

// 中文输入监听
const isComposing = ref(false);
const handleCompositionStart = () => {
  isComposing.value = true;
};
const handleCompositionEnd = () => {
  isComposing.value = false;
};


defineExpose({
  replyComplete
});
</script>

<style lang="less" scoped>
.chat-sender {
  padding: 10px 0;

  .textarea {
    position: relative;
    border: 1px solid #eee;
    border-radius: 20px;
    padding: 10px;
    background-color: #f3f4f7;

    :deep(.tiny-textarea__inner) {
      border: none;
      background-color: transparent;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      padding: 0 10px 10px;

      .model-select {}

      .sender-btn {
        display: flex;
        align-items: center;

        .btn-send {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          background-color: #356bfd;
          //border: 1px solid;
          border-radius: 50%;
        }
      }
    }
  }
}
</style>
<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="false" width="50%" @close="onClose(false)">
    <session-message-index :message-list="sessionMessageList" :show-tool="false"/>
    <template #footer>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import SessionMessageIndex from '@/components/session-message/index.vue';
import * as SessionMessageApi from '@/api/large-model/session-message';
import {computed, getCurrentInstance, Ref, ref} from 'vue';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = computed(() => {
  return '会话记录';
});

const onClose = (refresh: boolean) => {
  visible.value = false;
  if (refresh) {
    emit('ok');
  }
};

const resetForm = () => {

};
const sessionMessageList: Ref<SessionMessageApi.SessionMessageVO[]> = ref([])
const open = (sessionId: string) => {
  resetForm();
  if (sessionId) {
    SessionMessageApi.listSessionMessage({"sessionId": sessionId}).then((res) => {
      sessionMessageList.value = res.data
    })
    visible.value = true;
  }
}

defineExpose({
  open,
});
</script>


<style lang="less" scoped>

</style>


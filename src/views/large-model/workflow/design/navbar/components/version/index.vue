<template>
  <tiny-drawer :title="title" :visible="visible" width="18%" @close="onClose()">
    <tiny-time-line vertical :data="versionList" shape="dot">
      <template #right="{ slotScope }">
        <div class="time-line-right" @click="onClick">
          <span v-if="slotScope.versionStatus === 'PUBLISHED'">
            {{ slotScope.publishAt }}
          </span>
          <span v-else>
            当前草稿
          </span>
          <div class="info" v-if="slotScope.versionStatus === 'PUBLISHED'">
            <div>发布人：{{ slotScope.publishBy }}</div>
            <div>发布时间：{{ slotScope.publishAt }}</div>
          </div>
        </div>
      </template>
    </tiny-time-line>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref } from 'vue';
import * as WfVersionApi from "@/api/large-model/wf-version";

const emit = defineEmits(['ok']);
const { proxy } = getCurrentInstance() as any;
const visible = ref(false);
const title = computed(() => {
  return '历史版本';
});


const onClose = () => {
  visible.value = false;
};

const onClick = () => {
  // alert('..')
};
const versionList = ref<WfVersionApi.WfVersionVO[]>()
const getListByAppId = (wfId: string) => {
  if (!wfId) {
    return
  }
  WfVersionApi.listWfVersion({ workflowId: wfId }).then((res) => {
    versionList.value = res.data.map((item: WfVersionApi.WfVersionVO) => ({
      ...item,
      ...(item.versionStatus === 'DRAFT' ? { 'type': 'success' } : {})
    }))

  })
}

const open = (wfId: string) => {
  visible.value = true;
  getListByAppId(wfId)
};

defineExpose({
  open,
});
</script>

<style scoped>
.time-line-right {
  line-height: 28px;
  width: 100%;
  padding: 0 15px 15px;
  margin-bottom: 10px;

  .info {
    color: #26244ca6;
    font-size: 12px;
    font-weight: 400;
  }
}

.time-line-right:hover {
  background-color: var(--tv-color-bg);
}
</style>
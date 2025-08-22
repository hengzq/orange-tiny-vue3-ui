<template>
  <tiny-container pattern="classic" footer-height="0">
    <template #header>
      <navbar-index :save-time="saveTime" />
    </template>
    <div>
      <design-index @refresh="refresh" />
    </div>
    <template #footer>
      <div>Footer</div>
    </template>
  </tiny-container>

</template>

<script lang="ts" setup>
import * as WfRunApi from '@/api/large-model/wf-run';
import { useWfStore } from "@/store/modules/wf";
import { getCurrentInstance, ref, watch } from "vue";

import NavbarIndex from './navbar/index.vue';
import DesignIndex from "./workflow/index.vue";

const { proxy } = getCurrentInstance() as any;
const wfStore = useWfStore();

const saveTime = ref()

// 用于存储轮询定时器
let wfRunPollTimer: ReturnType<typeof setInterval> | null = null;

watch(() => wfStore.runId, (newVal) => {
  if (!newVal) return;

  if (wfRunPollTimer) {
    clearInterval(wfRunPollTimer);
  }
  fetchAndSetWfRunDetail(newVal);

  // 启动每 1 秒轮询一次
  wfRunPollTimer = setInterval(() => {
    fetchAndSetWfRunDetail(newVal);
  }, 1000);

  console.log('runId changed:', newVal);
});

const fetchAndSetWfRunDetail = async (runId: string) => {
  try {
    const res = await WfRunApi.getWfRunDetailById(runId);
    const runDetail = res.data as WfRunApi.WfRunVO;

    wfStore.updateWfRun(runDetail);

    if (wfStore.getRunCompleted() && wfRunPollTimer) {
      clearInterval(wfRunPollTimer);
      wfRunPollTimer = null;
    }

  } catch (error) {
    console.error('Failed to fetch workflow run detail:', error);
    if (wfRunPollTimer) {
      clearInterval(wfRunPollTimer);
      wfRunPollTimer = null;
    }
  }
}

const refresh = () => {
  const date = new Date();
  saveTime.value = date.toLocaleTimeString()
}


const init = () => {
  wfStore.clearWf();
  wfStore.getWfById(proxy.$route.params.wfId);
}
init();

</script>
<style lang="less" scoped></style>
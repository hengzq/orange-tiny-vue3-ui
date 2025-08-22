<template>
  <div class="navbar">
    <div class="left">
      <div style="display: flex; align-items: center">
        <tiny-button :icon="IconArrowLeft" style="width: 38px;" @click="handleCancel"></tiny-button>
        <h5>{{ wfStore.name }}</h5>
        <!--                <div class="divider"></div>-->
        <!--                <img class="vue-icon" alt="logo" src="@/assets/images/pro.png"/>-->
        <!--                <h4>TinyPro of Vue</h4>-->
        <div v-if="saveTime" class="info">已于{{ saveTime }}自动保存</div>
      </div>
    </div>

    <!--    <div class="center">-->
    <!--      <tiny-button-group :data="groupData" v-model="checkedVal" @change="handleChange"></tiny-button-group>-->
    <!--    </div>-->
    <div class="right">
      <tiny-button type="primary" @click="handeVersion">版本管理</tiny-button>
      <tiny-button type="info" @click="handelPublish">发布</tiny-button>
    </div>

  </div>
  <version-index ref="versionIndexRef" />
</template>

<script lang="ts" setup>
import * as WfApi from "@/api/large-model/wf";
import { useWfStore } from "@/store/modules/wf";
import { defineProps, getCurrentInstance, ref } from 'vue';

import router from "@/router";
import { iconArrowLeft } from '@opentiny/vue-icon';
import VersionIndex from './components/version/index.vue';

const IconArrowLeft = iconArrowLeft()

const { proxy } = getCurrentInstance() as any;
const wfStore = useWfStore();

const props = defineProps({
  saveTime: {
    type: String,
    required: false
  }
});

const handleCancel = () => {
  router.push(`${import.meta.env.VITE_CONTEXT}large-model/workflow`);
};

const versionIndexRef = ref()
const handeVersion = () => {
  versionIndexRef.value.open(wfStore.id)
}

const handelPublish = () => {
  WfApi.publishWfById(wfStore.id)
    .then((res) => {
      proxy.$modal.message({ message: '发布成功', status: 'success' });
    })
}

</script>

<style scoped lang="less">
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
  margin: 0 15px;

  .left {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60px;
    cursor: pointer;

    h5 {
      margin: 0 30px 0 12px;
      color: var(--ti-base-common-title-color);
      font-weight: 500;
      font-size: 20px;
      line-height: 32px;
      letter-spacing: 0.55px;
    }

    .info {
      color: #26244c96;
      font-size: 12px;
      font-weight: 400;
    }
  }

  .right {}

}
</style>

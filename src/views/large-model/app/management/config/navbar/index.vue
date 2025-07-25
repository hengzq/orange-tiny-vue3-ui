<template>
  <div class="navbar">
    <div class="left">
      <div style="display: flex; align-items: center">
        <tiny-button :icon="IconArrowLeft" style="width: 38px;" @click="handleCancel"></tiny-button>
        <h5>{{ app.latestVersion?.name }}</h5>
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
      <tiny-button v-if="currentMenu === 'SETTING'" type="primary" @click="handeVersion">版本管理</tiny-button>
      <tiny-button v-if="currentMenu === 'SETTING'" type="info" @click="handelPublishApp">发布</tiny-button>
    </div>

  </div>
  <version-index ref="versionIndexRef"/>
</template>

<script lang="ts" setup>
import {defineProps, getCurrentInstance, PropType, ref} from 'vue';
import {LOCALE_OPTIONS} from '@/locale';
import useUser from '@/hooks/user';
import * as AppApi from "@/api/large-model/app";
import router from "@/router";
import {iconArrowLeft} from '@opentiny/vue-icon'

import VersionIndex from './components/version/index.vue'

const IconArrowLeft = iconArrowLeft()

const {proxy} = getCurrentInstance() as any;

const {logout} = useUser();
const locales = [...LOCALE_OPTIONS];

const props = defineProps({
  app: {
    type: Object as PropType<AppApi.AppVO>,
    required: true
  },
  currentMenu: {
    type: String,
    required: true
  },
  saveTime:{
    type:String,
    required:false
  }
});

const handleCancel = () => {
  router.push(`${import.meta.env.VITE_CONTEXT}large-model/app`);
};

const versionIndexRef = ref()
const handeVersion = () => {
  versionIndexRef.value.open(props.app?.id)
}

const handelPublishApp = () => {
  if (!props.app?.id) {
    return
  }
  AppApi.publishAppById(props.app.id)
    .then((res) => {
      proxy.$modal.message({message: '发布成功', status: 'success'});
    })
}


// 点击图标跳转首页
const jumpUrl = () => {
  window.location.href = `${window.location.protocol}//${window.location.host}`;
};
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

  .right {
  }

}


</style>

<template>
  <tiny-container :aside-width="asideWidth" :header-height="headerHeight">
    <template #header>
      <tiny-layout>
        <div class="layout-navbar">
          <navbar-index :app="app" :current-menu="currentMenu" :save-time="saveTime"/>
        </div>
      </tiny-layout>
    </template>
    <template #aside>
      <tiny-layout class="layout-aside">
        <tiny-tree-menu :show-filter="false" :data="treeData" @node-click="handleNodeClick"/>
      </tiny-layout>
    </template>
    <tiny-layout class="layout-main">
      <overview v-if="currentMenu === 'OVERVIEW'"/>
      <setting v-else-if="currentMenu === 'SETTING'" ref="appSettingRef" :app="app" @save="refreshApp"/>
      <monitor v-else-if="currentMenu === 'MONITOR'" :app="app"/>
      <session v-else-if="currentMenu === 'SESSION'" :app="app"/>
    </tiny-layout>
  </tiny-container>
</template>
<script setup lang="ts">
import {getCurrentInstance, ref} from "vue";
import * as AppApi from '@/api/large-model/app';

import Overview from './overview/index.vue'
import Setting from './setting/index.vue'
import Session from './session/index.vue'
import NavbarIndex from './navbar/index.vue';
import Monitor from './monitor/index.vue'

const {proxy} = getCurrentInstance() as any;

const title = ref('我是一个智能体');
const asideWidth = ref(260)
const headerHeight = ref(60)

const saveTime = ref()

const treeData = ref([
  // {
  //   id: 'OVERVIEW',
  //   label: '概览'
  // },
  {
    id: 'SETTING',
    label: '设置',
  },
  // {
  //   id: 'MONITOR',
  //   label: '监测',
  // },
  {
    id: 'SESSION',
    label: '对话日志',
  },

])

const currentMenu = ref('SETTING')
const appSettingRef = ref();
const handleNodeClick = (data) => {
  currentMenu.value = data.id;
}

const refreshApp = () => {
  getApp();
  const date = new Date();
  saveTime.value = date.toLocaleTimeString()
}

const app = ref<AppApi.AppVO>({});
const getApp = () => {
  AppApi.getLatestAppById(proxy.$route.params.appId, false).then((res) => {
    app.value = res.data
  });
}
getApp()

</script>

<style scoped lang="less">
@import './config.less';

.layout-main {
  margin: 15px;
}
</style>
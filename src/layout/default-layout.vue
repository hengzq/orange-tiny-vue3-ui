<template>
  <div class="layout">
    <tiny-container :aside-width="250" :pattern="myPattern">
      <template #header>
        <tiny-layout>
          <div class="layout-navbar">
            <NavBar/>
          </div>
        </tiny-layout>
      </template>
      <template #aside>
        <tiny-layout class="layout-sider">
          <div class="menu-wrapper">
            <Menu/>
          </div>
        </tiny-layout>
      </template>
      <tiny-layout class="layout-content">
        <PageLayout/>
      </tiny-layout>
      <template #footer>
        <tiny-layout>
          <div class="layout-footer">
            <Footer/>
          </div>
        </tiny-layout>
      </template>
    </tiny-container>

    <div class="theme-box" @click="themeVisible">
      <img src="@/assets/images/theme.png"/>
    </div>
    <div v-if="disTheme">
      <tiny-modal
        v-model="disTheme" :lock-scroll="true" show-header show-footer :title="$t('theme.title.main')" mask-closable="true" height="922"
        width="748">
        <template #default>
          <Theme/>
        </template>
        <template #footer></template>
      </tiny-modal>
    </div>
    <img v-if="!appStore.navbar" src="@/assets/images/global.png" class="global-setting" @click="switchSet"/>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, watch} from 'vue';
import {Container as TinyContainer, Layout as TinyLayout, Modal as tinyModal,} from '@opentiny/vue';
import TinyThemeTool from '@opentiny/vue-theme/theme-tool.js';
import {useAppStore} from '@/store';

import Footer from '@/components/footer/index.vue';
import NavBar from '@/components/navbar/index.vue';
import Theme from '@/components/theme/index.vue';
import Menu from '@/components/menu/index.vue';
import {DefaultTheme} from '@/components/theme/default-theme';
import PageLayout from './page-layout.vue';

// 动态切换
const appStore = useAppStore();
const changefooter = ref('#fff');

// 切换简约模式，图标按钮
const top = ref('10px');

// 判断是否显示设置图标
const switchSet = () => {
  appStore.updateSettings({Settings: true});
};

// 是否显示切换框架结构
const myPattern = ref('legend');

// 主题配置
const disTheme = ref(false);
const theme = new TinyThemeTool()
const themeVisible = () => {
  disTheme.value = !disTheme.value;
};

watch(appStore.$state, (newValue, oldValue) => {
  if (!newValue.navbar) {
    myPattern.value = 'simple';
  } else if (!newValue.footer) {
    myPattern.value = 'fashion';
  } else if (!newValue.menu) {
    myPattern.value = 'classic';
  } else {
    myPattern.value = 'legend';
  }
  appStore.footer ? (top.value = '10px') : (top.value = '60px');
});

watch(appStore.$state, (newValue, oldValue) => {
  if (newValue.theme === 'dark') {
    changefooter.value = '#262323;';
  } else {
    changefooter.value = '#fff;';
  }
});
// 初始化默认主题
onMounted(() => {
  appStore.updateSettings({theme: 'light'});
  theme.changeTheme(DefaultTheme);
  appStore.updateSettings({themelist: 'default'});
});
</script>

<style scoped lang="less">
.layout {
  width: 100%;
  height: 100%;
}

.menu-wrapper {
  width: inherit;
  height: 92vh;
  //margin-top: v-bind(top);
  overflow-x: hidden;
  overflow-y: auto;
}

.global-setting {
  position: fixed;
  top: 280px;
  right: 0;
  z-index: 99;
  width: 30px;
  height: 30px;
}

.layout :deep(.tiny-container .tiny-container__aside) {
  z-index: 100;
  border-left: 1px solid var(--o-border-line-1, #e8e8e8);
}

.layout :deep(.tiny-container .tiny-container__main) {
  //color: #ccc;
  background-color: var(--tv-color-bg);
}

.layout :deep(.layout-content) {
  height: 100%;
  padding: 15px 15px 0;
  overflow: hidden;
}

.layout :deep(.tiny-container .tiny-container__footer) {
  display: flex;
  padding-top: 15px;
  justify-content: center;
  background-color: #f5f6f7;
}

// 组件无法固定非message的modal类型距离顶部距离
:deep(.tiny-modal__box) {
  top: 8px !important;
}


.theme-box {
  position: fixed;
  top: 90%;
  right: 30px;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #fff;
  border-radius: 100%;
  cursor: pointer;

  img {
    display: block;
    width: inherit;
    height: inherit;
  }
}
</style>

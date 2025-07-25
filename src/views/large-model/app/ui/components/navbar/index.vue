<template>
  <div class="navbar">
    <div class="left-side">
      <div style="display: flex; align-items: center">
        <img src="/favicon.ico" class="logo" alt="logo" @click="jumpUrl"/>
        <h5 @click="jumpUrl">{{ app.app?.name }}</h5>
        <!--        <div class="divider"></div>-->
        <!--        <img class="vue-icon" alt="logo" src="@/assets/images/pro.png"/>-->
        <!--        <h4>TinyPro of Vue</h4>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, PropType, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import {IconCheckOut, IconUser} from '@opentiny/vue-icon';
import {useAppStore} from '@/store';
import router from '@/router';
import {LOCALE_OPTIONS} from '@/locale';
import useLocale from '@/hooks/locale';
import useUser from '@/hooks/user';
import * as AppApi from "@/api/large-model/app";

const i18 = useI18n();
const iconUser = IconUser();
const iconCheckOut = IconCheckOut();
const lan = ref(false);

const appStore = useAppStore();
const {logout} = useUser();
const {changeLocale} = useLocale();
const locales = [...LOCALE_OPTIONS];


const props = defineProps({
  app: {
    type: Object as PropType<AppApi.AppDetailVO>,
    required: true
  }
});


// 切换语言
const changeLan = () => {
  lan.value = !lan.value;
};

// 帮助中心
const help = () => {
  window.open('http://hengzq.cn', '_blank');
};

// 设置页面显示
const setVisible = () => {
  appStore.updateSettings({Settings: true});
};

// 用户设置
const userList = [
  {label: 'messageBox.userCenter', value: 1},
  {label: 'messageBox.logout', value: 10},
];

const switchUser = (e: number) => {
  switch (e) {
    case 1:
      router.push({name: 'Info'});
      break;
    case 10:
      logout();
      break;
    default:
    // eslint-disable-next-line no-console
  }
};

// 点击图标跳转首页
const jumpUrl = () => {
  window.location.href = `${window.location.protocol}//${window.location.host}`;
};
</script>

<style scoped lang="less">
.navbar {
  display: flex;
  justify-content: space-between;
  height: 100%;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
}


.divider {
  width: 1px;
  height: 18px;
  margin: 0 2px;
  margin-top: 1px;
  background: #dfe1e6;
}

.left-side {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding-left: 10px;
  cursor: pointer;

  .logo {
    width: 48px;
    height: 48px;
  }

  .vue-icon {
    width: 24px;
    height: 24px;
    margin-left: 30px;
  }

  h5 {
    margin: 0 30px 0 12px;
    color: var(--ti-base-common-title-color);
    font-weight: 700;
    font-size: 22px;
    line-height: 32px;
    letter-spacing: 0.55px;
  }

  h4 {
    width: 135px;
    height: 22px;
    margin-left: 10px;
    color: var(--ti-base-common-title-color);
    font-weight: normal;
    font-size: 16px;
    line-height: 22px;
    text-align: left;
  }
}

</style>

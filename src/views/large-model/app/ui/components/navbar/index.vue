<template>
  <div class="navbar">
    <div class="left-side">
      <div style="display: flex; align-items: center">
        <img src="/favicon.ico" class="logo" alt="logo" @click="jumpUrl"/>
        <h5 @click="jumpUrl">{{ app.latestVersion?.name }}</h5>
        <!--        <div class="divider"></div>-->
        <!--        <img class="vue-icon" alt="logo" src="@/assets/images/pro.png"/>-->
        <!--        <h4>TinyPro of Vue</h4>-->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineProps, PropType} from 'vue';
import * as AppApi from "@/api/large-model/app";

const props = defineProps({
  app: {
    type: Object as PropType<AppApi.AppVO>,
    required: true
  }
});

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
  padding-left: 20px;
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

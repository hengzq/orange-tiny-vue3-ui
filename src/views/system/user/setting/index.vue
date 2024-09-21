<template>
  <div class="user-setting">
    <tiny-tabs v-model="activeName" position="left">
      <tiny-tab-item title="表单" name="first"> 表单组件,具有与用户交互，并可完成数据采集功能的控件。 </tiny-tab-item>
    </tiny-tabs>
  </div>
</template>

<style lang="less">
.user-setting {
  background: var(--ti-base-color-bg-1);
}
</style>
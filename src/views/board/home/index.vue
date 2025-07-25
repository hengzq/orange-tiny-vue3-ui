<template>
  <div class="container">
    <Main></Main>
    <Curve></Curve>
    <Falls></Falls>
    <Round></Round>
  </div>
</template>

<script lang="ts" setup>
import Main from './components/main.vue';
import Curve from './components/curve.vue';
import Falls from './components/falls.vue';
import Round from './components/round.vue';
</script>

<style scoped lang="less">
.container {
  width: 100%;
  height: inherit;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
}
</style>

<style lang="less" scoped>
 //responsive
@media (max-width: @screen-xs) {
  .container {
    overflow-x: auto;
  }
}
</style>

<template>
  <div class="container">
    <total/>
    <Curve></Curve>
    <!--    <Falls></Falls>-->
    <!--    <Round></Round>-->
  </div>
</template>
<script setup lang="ts">
import Total from './components/total.vue';
import Curve from './components/curve.vue';
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: inherit;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0;
}
</style>

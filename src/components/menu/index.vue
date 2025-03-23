<template>
  <div class="menu-router">
    <tiny-tree-menu
        ref="tree" :data="treeDataFilter" :show-filter="false" node-key="id" wrap @current-change="currentChange">
      <template #default="slotScope">
        <span class="menu-title">
          <svg-icon :name="slotScope.data.icon" class="svg-icon"/>
          <span :class="slotScope.data.children ? 'main-title' : 'title'">
            {{ slotScope.data.label || slotScope.data.name }}
          </span>
        </span>
      </template>
    </tiny-tree-menu>
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import router from '@/router';
import {useUserStore} from '@/store';
import {listToTreeConverter} from '@/utils/tree';
import {isExternal} from '@/utils/validate';

const tree = ref();
const treeDataFilter = ref();
const queryRouters = async () => {
  const userStore = useUserStore();
  treeDataFilter.value = listToTreeConverter(userStore.menus);
};

queryRouters();

const currentChange = (data: any) => {
  if (data.path) {
    if (isExternal(data.path)) {
      window.open(data.path, '_blank');
    } else {
      router.push(`${import.meta.env.VITE_CONTEXT}${data.path}`);
    }
  }
};
</script>

<style lang="less" scoped>
.main-title {
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  color: #000;
}

.title {
  height: 20px;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
}

.menu-title {
  display: flex;
  align-items: center;
  height: 20px;

  > svg {
    width: 1.5em;
    height: 1.5em;
  }
}
</style>

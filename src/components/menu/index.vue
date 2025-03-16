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
  gap: 10px;
  align-items: center;
  height: 20px;

  > svg {
    width: 1.3em;
    height: 1.3em;
  }
}

:deep(.tiny-tree-node__wrapper > .is-current > .tiny-tree-node__content) {
  color: #000 !important;
  background: none !important;
  margin-left: 0 !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        > .tiny-tree-node__wrapper
        > .is-current
        > .tiny-tree-node__content
    ) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
  margin-left: 0 !important;

  &:hover {
    background: var(--ti-tree-menu-node-hover-bg-color) !important;
  }
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        .tiny-tree-node__wrapper
        .is-current
        .tiny-tree-node__content
        .tree-node-name
    ) {
  border-left: 2px solid var(--ti-tree-menu-square-left-border-color, '#fff') !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        .tiny-tree-node__wrapper
        .is-current
        .tiny-tree-node__content
        .tiny-tree-node__content-right
    ) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        .tiny-tree-node__wrapper
        .is-current
        .tiny-tree-node__content
        .tiny-tree-node__content-left
        .tiny-tree-node__content-box
    ) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        .tiny-tree-node__wrapper
        .is-current
        .tiny-tree-node__content
        .tiny-tree-node__content-left
        .tiny-tree-node__content-box:before
    ) {
  display: none !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-expanded
        > .tiny-tree-node__children
        .tiny-tree-node__wrapper
        .is-current
        .tiny-tree-node__content
        .tiny-tree-node__content-left:before
    ) {
  display: none !important;
}

:deep(.tiny-tree-node__wrapper > .is-current > .tiny-tree-node__content) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
}

:deep(
      .tiny-tree-node__wrapper
        > .is-current
        > .tiny-tree-node__content
        .tiny-tree-node__content-box
    ) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
}

:deep(.tiny-tree-node__content:hover) {
  background-color: var(--ti-tree-menu-node-hover-bg-color) !important;
}

:deep(
      .tiny-tree-menu__wrap
        > .tiny-tree-node__wrapper
        > .is-root
        > .tiny-tree-node__content
        > .tiny-tree-node__content-left
        .tiny-tree-node__content-box
        .tree-node-name
    ) {
  padding: 0 8px !important;
}

:deep(.tiny-tree-node > .tiny-tree-node__content) {
  margin-left: 0 !important;
}

.tiny-tree-menu
.tiny-tree
.tiny-tree-node.is-current
> .tiny-tree-node__content
.tree-node-name
.tiny-svg {
  fill: var(--ti-base-icon-color);
}
</style>

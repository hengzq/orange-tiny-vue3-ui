<template>
  <div style="background: #fff; padding: 20px">
    <tiny-tabs v-model="activeName" panel-max-height="100px">
      <tiny-tab-item title="System" name="system">
        <tiny-popover v-for="item in systemIds" :key="item" placement="top-start" width="200" trigger="hover"
          append-to-body :content="`<svg-icon name=&quot;${item}&quot;/>`">
          <template #reference>
            <div class="icon-item" @click="copyIcon(item.substring(5))">
              <svg-icon :name="item.substring(5)" width="30" height="30" />
              <span>{{ item.substring(5) }}</span>
            </div>
          </template>
        </tiny-popover>
      </tiny-tab-item>
      <tiny-tab-item title="Logo" name="logo">
        <tiny-popover v-for="item in logoIds" :key="item" placement="top-start" width="200" trigger="hover"
          append-to-body :content="`<svg-icon name=&quot;${item}&quot;/>`">
          <template #reference>
            <div class="icon-item" @click="copyIcon(item.substring(5))">
              <svg-icon :name="item.substring(5)" width="30" height="30" />
              <span>{{ item.substring(5) }}</span>
            </div>
          </template>
        </tiny-popover>
      </tiny-tab-item>
      <tiny-tab-item title="Workflow" name="workflow">
        <tiny-popover v-for="item in wfIds" :key="item" placement="top-start" width="200" trigger="hover" append-to-body
          :content="`<svg-icon name=&quot;${item}&quot;/>`">
          <template #reference>
            <div class="icon-item" @click="copyIcon(item.substring(5))">
              <svg-icon :name="item.substring(5)" width="30" height="30" />
              <span>{{ item.substring(5) }}</span>
            </div>
          </template>
        </tiny-popover>
      </tiny-tab-item>
    </tiny-tabs>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from '@vueuse/core';
// eslint-disable-next-line import/no-unresolved
import ids from 'virtual:svg-icons-names';
import { computed, getCurrentInstance, ref } from 'vue';

const activeName = ref('system');
const { copy } = useClipboard();
const { proxy } = getCurrentInstance() as any;

const systemIds = computed(() =>
  ids.filter((item) => item.includes('system')),
);
const logoIds = computed(() => ids.filter((item) => item.includes('logo')));
const wfIds = computed(() => ids.filter((item) => item.includes('wf')));

const copyIcon = (id: string) => {
  const text = `<svg-icon name="${id}" />`;
  copy(text);
  proxy.$modal.message({ message: '复制成功', status: 'success' });
};
</script>

<style scoped lang="less">
:deep(.tiny-tabs__content) {
  height: calc(100vh - 230px);
  overflow-y: auto;
}

.icon-item {
  margin: 20px;
  height: 85px;
  text-align: center;
  width: 100px;
  float: left;
  font-size: 30px;
  color: #24292e;
  cursor: pointer;

  span {
    display: block;
    font-size: 12px;
    margin-top: 10px;
  }
}
</style>

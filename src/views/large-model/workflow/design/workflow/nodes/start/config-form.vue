<template>
  <tiny-drawer class="config-dialog" :title="title" :visible="visible" :mask="false" width="30%" @close="onClose">
    <tiny-input v-model="formData.description" class="description" placeholder="请输入描述..." @change="updateFormData" />
    <tiny-divider />
    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="输入" name="1">
        <template #title-right>
          <tiny-button type="info" :icon="IconPlus()" size="mini" @click="addInputParam"></tiny-button>
        </template>
        <tiny-grid ref="inputGridTableRef" :data="inputData" show-overflow="tooltip"
          :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }" @edit-closed="updateFormData">
          <tiny-grid-column field="name" title="变量名" :editor="{ component: 'input', type: 'visible' }">
            <template #edit="data">
              <tiny-input v-model="data.row.name" placeholder="请输入内容" @change="updateFormData"></tiny-input>
            </template>
          </tiny-grid-column>
          <tiny-grid-column title="变量值" :editor="{ type: 'visible' }" width="145px">
            <template #edit="data">
              <param-value-index :param="data.row" :node="formData" :input-visible="false"
                @delete-value="deleteInputParam" />
            </template>
          </tiny-grid-column>
          <template #empty>
          </template>
        </tiny-grid>
      </tiny-collapse-item>
    </tiny-collapse>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as WfNodeApi from '@/api/large-model/wf-node';
import { useWfStore } from "@/store/modules/wf";
import { IconPlus } from '@opentiny/vue-icon';
import { v4 as uuidv4 } from 'uuid';
import { computed, getCurrentInstance, ref } from 'vue';
import { updateWfGraphDebounced } from '../utils';

import ParamValueIndex from '../components/param-value/index.vue';

const wfStore = useWfStore();

const { proxy } = getCurrentInstance() as any;

const visibleKey = 'start-config-from';

const visible = computed(() => {
  console.log('visible', wfStore.getConfigVisible);
  return wfStore.getConfigVisible === visibleKey;
});

const title = computed(() => {
  return '开始';
});

const activeNames = ref(['1']);
const formData = ref<WfNodeApi.WfNode>({
  id: '',
  nodeCode: '',
  nodeType: 'START',
  name: '',
  description: '',
  inputConfig: {}
});

const inputData = ref<WfNodeApi.Param[]>([])
const addInputParam = () => {
  inputData.value.push({
    id: uuidv4().substring(0, 6),
    name: '',
    value: '',
    type: 'STRING'
  });
  updateFormData();
}

const deleteInputParam = (id: string) => {
  inputData.value = inputData.value.filter(item => item.id !== id);
  updateFormData();
}

const updateFormData = () => {
  if (!formData.value.inputConfig) {
    formData.value.inputConfig = {};
  }
  formData.value.inputConfig.inputParams = inputData.value ?? [];
  if (!formData.value.outputConfig) {
    formData.value.outputConfig = {};
  }
  formData.value.outputConfig.outParams = JSON.parse(JSON.stringify(inputData.value)) ?? [];

  // 更新数据
  wfStore.updateNode(formData.value)
  updateWfGraphDebounced();
}

const onClose = () => {
  if (visible.value) {
    wfStore.setConfigVisible('');
  }
};


const open = (nodeId: string) => {
  const node = wfStore.getNodeById(nodeId);
  if (!node) return;

  formData.value = node
  formData.value.inputConfig = formData.value.inputConfig ?? {}
  inputData.value = formData.value.inputConfig.inputParams ?? []

  formData.value.outputConfig = formData.value.outputConfig ?? {}

  wfStore.setConfigVisible(visibleKey);
};

defineExpose({
  open,
});
</script>

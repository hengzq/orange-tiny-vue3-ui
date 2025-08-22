<template>
  <tiny-drawer class="config-dialog" :title="title" :visible="visible" :mask="false" width="30%" @close="onClose">
    <tiny-input v-model="formData.description" class="description" placeholder="请输入描述..." @change="updateFormData" />
    <tiny-divider />
    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="输出变量" name="outputParams">
        <template #title-right>
          <tiny-button type="info" :icon="IconPlus()" size="mini" @click="addOutputParam"></tiny-button>
        </template>
        <tiny-grid ref="outputGridTableRef" :data="outputData" show-overflow="tooltip"
          :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }" @edit-closed="updateFormData">
          <tiny-grid-column field="name" title="变量名" :editor="{ component: 'input', type: 'visible' }" width="150px" />
          <tiny-grid-column title="变量值" :editor="{ type: 'visible' }">
            <template #edit="data">
              <param-value-index :param="data.row" :node="formData" @delete-value="deleteOutputParam" />
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
import * as WfNodeApi from "@/api/large-model/wf-node";
import { useWfStore } from "@/store/modules/wf";
import { IconPlus } from '@opentiny/vue-icon';
import { v4 as uuidv4 } from 'uuid';
import { computed, getCurrentInstance, ref } from 'vue';
import { updateWfGraphDebounced } from '../utils';

import ParamValueIndex from '../components/param-value/index.vue';

const wfStore = useWfStore();

const emit = defineEmits(['update']);
const { proxy } = getCurrentInstance() as any;

const visibleKey = 'end-config-from';

const visible = computed(() => {
  return wfStore.getConfigVisible === visibleKey;
});

const title = computed(() => {
  return '结束';
});

const formData = ref<WfNodeApi.WfNode>({
  id: '',
  nodeCode: 'END',
});

const activeNames = ref(['outputParams']);
const outputData = ref<WfNodeApi.Param[]>([])

const addOutputParam = () => {
  outputData.value.push({
    id: uuidv4().substring(0, 6),
    name: '',
    value: '',
    valueFrom: 'INPUT',
    type: 'STRING'
  });
  updateFormData();
}

const deleteOutputParam = (id: string) => {
  outputData.value = outputData.value.filter(item => item.id !== id);
  updateFormData();
}

const updateFormData = () => {
  if (!formData.value.outputConfig) {
    formData.value.outputConfig = {};
  }
  formData.value.outputConfig.outParams = outputData.value ?? [];

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

  formData.value = node;
  formData.value.outputConfig = formData.value.outputConfig ?? {}
  outputData.value = formData.value.outputConfig.outParams ?? []

  wfStore.setConfigVisible(visibleKey);
};

defineExpose({
  open,
});
</script>

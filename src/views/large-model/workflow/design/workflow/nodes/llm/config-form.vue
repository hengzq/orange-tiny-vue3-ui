<template>
  <tiny-drawer class="config-dialog" :title="title" :visible="visible" :mask="false" width="30%" @close="onClose">
    <tiny-input v-model="formData.description" class="description" placeholder="请输入描述..." @change="updateFormData" />
    <tiny-divider />
    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="模型配置" name="modelConfig">
        <tiny-cascader v-model="llmParam.modelId" :options="modelList" :props="{ emitPath: false }" style="width: 100%"
          @change="updateFormData" />
      </tiny-collapse-item>
    </tiny-collapse>

    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="输入" name="inputParams">
        <template #title-right>
          <tiny-button type="info" :icon="IconPlus()" size="mini" @click="addInputAttr"></tiny-button>
        </template>
        <tiny-grid ref="inputGridTableRef" :data="inputData" show-overflow="tooltip"
          :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }" @edit-closed="updateFormData">
          <tiny-grid-column field="name" title="变量名" width="150px" :editor="{ component: 'input', type: 'visible' }">
            <template #edit="data">
              <tiny-input v-model="data.row.name" placeholder="请输入内容" @change="updateFormData"></tiny-input>
            </template>
          </tiny-grid-column>
          <tiny-grid-column title="变量值" :editor="{ type: 'visible' }">
            <template #edit="data">
              <param-value-index :param="data.row" :node="formData" @delete-value="deleteInputParam" />
            </template>
          </tiny-grid-column>
          <template #empty>
          </template>
        </tiny-grid>
      </tiny-collapse-item>
    </tiny-collapse>

    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="系统提示词" name="systemPrompt">
        <tiny-input v-model="llmParam.systemPrompt" type="textarea" :autosize="{ minRows: 5 }" :maxlength="5000"
          show-word-limit :placeholder="$t('llm.app.systemPrompt.placeholder')" @change="updateFormData" />
      </tiny-collapse-item>
    </tiny-collapse>

    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="用户提示词" name="prompt">
        <tiny-input v-model="llmParam.prompt" type="textarea" :autosize="{ minRows: 5 }" :maxlength="5000"
          show-word-limit :placeholder="$t('llm.app.systemPrompt.placeholder')" @change="updateFormData" />
      </tiny-collapse-item>
    </tiny-collapse>

    <tiny-collapse v-model="activeNames">
      <tiny-collapse-item title="输出变量" name="outputParams">
        <template #title-right>
          <tiny-button type="info" :icon="IconPlus()" size="mini" @click="addOutputAttr"></tiny-button>
        </template>
        <tiny-grid ref="outputGridTableRef" :data="outputData" show-overflow="tooltip"
          :edit-config="{ trigger: 'click', mode: 'row', showStatus: true }" @edit-closed="updateFormData">
          <tiny-grid-column field="name" title="变量名" :editor="{ component: 'input' }">
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
import * as ModelApi from '@/api/large-model/model';
import * as PlatformApi from '@/api/large-model/platform';
import * as WfNodeApi from "@/api/large-model/wf-node";
import { useWfStore } from "@/store/modules/wf";
import { IconPlus } from '@opentiny/vue-icon';
import { computed, getCurrentInstance, ref } from 'vue';
import ParamValueIndex from '../components/param-value/index.vue';
import { updateWfGraphDebounced } from '../utils';


const wfStore = useWfStore();

const emit = defineEmits(['update']);
const { proxy } = getCurrentInstance() as any;

const visibleKey = 'llm-config-from';

const visible = computed(() => {
  return wfStore.getConfigVisible === visibleKey;
});

const title = computed(() => {
  return '大模型';
});

const activeNames = ref(['modelConfig', 'inputParams', 'systemPrompt', 'prompt', 'outputParams']);

const formData = ref<WfNodeApi.WfNode>({} as WfNodeApi.WfNode);
const llmParam = ref<WfNodeApi.LlmParam>({} as WfNodeApi.LlmParam);

const onClose = () => {
  if (visible.value) {
    wfStore.setConfigVisible('');
  }
};

const inputData = ref<WfNodeApi.Param[]>([])
const addInputAttr = () => {
  proxy.$refs.inputGridTableRef.insert({}).then((res: any) => {
    proxy.$refs.inputGridTableRef.setActiveRow(res.row);
  });
}

const deleteInputParam = (id: string) => {
  inputData.value = inputData.value.filter(item => item.id !== id);
  updateFormData();
}

const outputData = ref<WfNodeApi.Param[]>([])
const addOutputAttr = () => {
  proxy.$refs.outputGridTableRef.insert({}).then((res: any) => {
    proxy.$refs.outputGridTableRef.setActiveRow(res.row);
  });
}

const updateFormData = () => {
  if (!formData.value.inputConfig) {
    formData.value.inputConfig = {};
  }
  formData.value.inputConfig.llmParam = llmParam.value ?? {}

  formData.value.inputConfig.inputParams = proxy.$refs.inputGridTableRef.getTableData().fullData;

  if (!formData.value.outputConfig) {
    formData.value.outputConfig = {};
  }
  formData.value.outputConfig.outParams = proxy.$refs.outputGridTableRef.getTableData().fullData;

  // 更新数据
  wfStore.updateNode(formData.value)
  updateWfGraphDebounced();
}

const modelList = ref<ModelApi.PlatformModelTree[]>([])
const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    modelList.value = res.data.map((item: PlatformApi.PlatformVO) => ({ 'value': item.code, 'label': item.name }))
    queryModelList()
  });
};

const queryModelList = () => {
  ModelApi.listModel({
    modelType: 'CHAT',
    enabled: true,
  }).then((res) => {
    const models = res.data.map((item: ModelApi.ModelVO) => ({ 'value': item.id, 'label': item.name, 'platform': item.platform }))
    modelList.value.forEach(item => {
      item.children = models.filter((model: ModelApi.ModelVO) => model.platform === item.value)
    })
  });
};

const open = (node: WfNodeApi.WfNode) => {
  formData.value = node;
  formData.value.inputConfig = formData.value.inputConfig ?? {}
  llmParam.value = formData.value.inputConfig.llmParam ?? {}
  inputData.value = formData.value.inputConfig.inputParams ?? []

  formData.value.outputConfig = formData.value.outputConfig ?? {}
  outputData.value = formData.value.outputConfig?.outParams ?? []

  wfStore.setConfigVisible(visibleKey);
  queryPlatformList()
};

defineExpose({
  open,
});
</script>

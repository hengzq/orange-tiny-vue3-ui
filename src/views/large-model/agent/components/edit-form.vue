<template>
  <tiny-drawer
      :title="title" :visible="visible" :show-footer="true" width="85%" @close="onClose(false)">
    <tiny-row>
      <tiny-col :span="5">
        <tiny-form
            ref="formDataRef"
            :rules="formDataRules"
            :model="formData"
            label-position="top"
            label-width="110px"
            validate-position="bottom"
            validate-type="text"
        >
          <tiny-form-item :label="$t('large-model.agent.name')" prop="name">
            <tiny-input v-model="formData.name" :placeholder="$t('large-model.agent.name.placeholder')"/>
          </tiny-form-item>
          <tiny-form-item prop="modelId">
            <template #label>
              <div class="ai-model-label">
                {{ $t('large-model.agent.modelId') }}
                <tiny-button type="text" @click="setModelConfig(formData)" :disabled="!formData.modelId">参数设置</tiny-button>
              </div>
            </template>
            <tiny-cascader v-model="formData.modelId" :options="modelList" :props="{ emitPath: false }" style="width: 100%"/>
          </tiny-form-item>
          <tiny-form-item :label="$t('large-model.agent.baseIds')" prop="baseIds">
            <tiny-select v-model="formData.baseIds" :placeholder="$t('large-model.agent.baseIds.placeholder')" multiple :show-alloption="false">
              <tiny-option v-for="item in knowledgeBaseList" :key="item.id" :label="item.name" :value="item.id"/>
            </tiny-select>
          </tiny-form-item>
          <tiny-form-item :label="$t('large-model.agent.systemPrompt')" prop="systemPrompt">
            <tiny-input
                v-model="formData.systemPrompt" type="textarea" :autosize="{ minRows: 5 }" :maxlength="5000" show-word-limit
                :placeholder="$t('large-model.agent.systemPrompt.placeholder')"/>
          </tiny-form-item>
        </tiny-form>
      </tiny-col>
      <tiny-col :span="7">
        <div v-if="!formData.id" class="right-dialog">
          <tiny-button @click="onSubmit(false)">保存并调试</tiny-button>
          <!--          <dialog-index ref="dialogIndexRef" :agent-param="formData"></dialog-index>-->
        </div>
        <tiny-card v-else title="调试预览" style="width: 100%">
          <dialog-index ref="dialogIndexRef" :agent-param="formData"></dialog-index>
        </tiny-card>
      </tiny-col>
    </tiny-row>


    <model-config ref="modelConfigRef"></model-config>

    <template #footer>
      <tiny-button type="primary" @click="onSubmit(true)">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as PlatformApi from '@/api/large-model/platform';
import * as AgentApi from '@/api/large-model/agent';
import {computed, getCurrentInstance, Ref, ref, toRaw} from 'vue';
import * as ModelApi from "@/api/large-model/model";
import * as KnowledgeBaseApi from "@/api/large-model/knowledge-base";

import DialogIndex from './dialog-index.vue';
import ModelConfig from "./model-config.vue";

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改智能体' : '新增智能体';
});

const formData = ref<AgentApi.AgentVO>({});

const formDataRules = {
  name: [{required: true, message: '模型名称不能为空', trigger: 'change'}],
  modelId: [{required: true, message: '请选择模型', trigger: 'change'}],
};

const modelConfigRef = ref()
const setModelConfig = (item: AgentApi.AgentVO) => {
  modelConfigRef.value.open(item.modelConfig)
}


const onSubmit = (isColse: boolean) => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        AgentApi.updateAgentById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              if (isColse) {
                onClose(true);
              }
            })
            .catch((err) => {
              console.log(err);
            });
      } else {
        AgentApi.addAgent(toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '创建成功', status: 'success'});
              if (isColse) {
                onClose(true);
              } else {
                formData.value.id = res.data
                // 刷新一下列表
                emit('ok');
              }
            })
            .catch((err) => {
              console.log(err);
            });
      }
    }
  });
};

const onClose = (refresh: boolean) => {
  visible.value = false;
  if (refresh) {
    emit('ok');
  }
};

const modelList: Ref<ModelApi.PlatformModelTree[]> = ref([])
const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    modelList.value = res.data.map((item: ModelApi.ModelVO) => ({'value': item.code, 'label': item.name}))
    queryModelList()
  });
};

const queryModelList = () => {
  ModelApi.listModel({
    modelType: 'CHAT',
    enabled: true,
  }).then((res) => {
    const models = res.data.map((item: ModelApi.ModelVO) => ({'value': item.id, 'label': item.name, 'platform': item.platform}))
    modelList.value.forEach(item => {
      item.children = models.filter((model: ModelApi.ModelVO) => model.platform === item.value)
    })
    // 过滤掉没有模型的供应商
    modelList.value = modelList.value.filter(item => item.children && item.children.length > 0)
  });
};

//  查询知识库
const knowledgeBaseList = ref<Array<KnowledgeBaseApi.KnowledgeVO>>([])
const queryKnowledgeBaseList = () => {
  KnowledgeBaseApi.listKnowledge({
    enabled: true
  }).then((res) => {
    knowledgeBaseList.value = res.data
  })
}

const resetForm = () => {
  formData.value = {
    modelConfig: {
      temperature: 0.85
    }
  };
  proxy.$refs.formDataRef.resetFields();
};

const open = (id: string) => {
  isModify.value = false;
  resetForm();
  if (id) {
    AgentApi.getAgentById(id).then((res) => {
      formData.value = res.data;
      isModify.value = true;
    });
  }
  queryPlatformList();
  queryKnowledgeBaseList()
  visible.value = true;
};

defineExpose({
  open,
});
</script>

<style scoped>

:deep(.tiny-card .tiny-card__body .tiny-card--logo.tiny-card--medium-padding) {
  padding: 0px
}

.ai-model-label {
  display: inline-flex;
  justify-content: space-between;
  width: 98%;
}

.right-dialog {
  border: 1px solid #e6e6e6;
  display: grid;
  place-items: center;
  height: calc(100vh - 200px);
}
</style>
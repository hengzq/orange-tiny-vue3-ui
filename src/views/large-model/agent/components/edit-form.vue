<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      width="85%"
      @close="onClose(false)"
  >
    <tiny-row>
      <tiny-col :span="5">
        <tiny-form
            ref="formDataRef"
            label-position="left"
            :rules="formDataRules"
            :model="formData"
            label-width="100px"
            validate-position="bottom"
            validate-type="text"
        >
          <tiny-form-item :label="$t('large-model.agent.name')" prop="name">
            <tiny-input v-model="formData.name" :placeholder="$t('large-model.agent.name.placeholder')"/>
          </tiny-form-item>
          <tiny-form-item :label="$t('large-model.agent.modelId')" prop="modelId">
            <tiny-cascader v-model="formData.modelId" :options="modelList" :props="{ emitPath: false }" style="width: 100%"/>
          </tiny-form-item>
          <tiny-form-item :label="$t('large-model.agent.systemPrompt')" prop="systemPrompt">
            <tiny-input type="textarea" v-model="formData.systemPrompt" :autosize="{ minRows: 5 }" :maxlength="5000" show-word-limit
                        :placeholder="$t('large-model.agent.systemPrompt.placeholder')"/>
          </tiny-form-item>
        </tiny-form>
      </tiny-col>
      <tiny-col :span="7">
        <tiny-card title="调试"  style="width: 100%">
          <dialog-index ref="dialogIndexRef" :agent-param="formData"></dialog-index>
        </tiny-card>

      </tiny-col>
    </tiny-row>


    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import * as PlatformApi from '@/api/large-model/platform';
import * as AgentApi from '@/api/large-model/agent';
import {computed, getCurrentInstance, Ref, ref, toRaw} from 'vue';
import * as ModelApi from "@/api/large-model/model";

import DialogIndex from './dialog-index.vue';

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


const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        AgentApi.updateAgentById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
      } else {
        AgentApi.addAgent(toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '创建成功', status: 'success'});
              onClose(true);
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
    type: 'CHAT',
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

const resetForm = () => {
  formData.value = {};
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
  visible.value = true;
};

defineExpose({
  open,
});
</script>

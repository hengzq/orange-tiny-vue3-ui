<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="32%" @close="onClose(false)">
    <tiny-form
      ref="formDataRef" :rules="formDataRules" :model="formData" label-width="90px"
      validate-position="bottom" validate-type="text">
      <tiny-form-item :label="$t('llm.app.name')" prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('llm.app.name.placeholder')"/>
      </tiny-form-item>

      <tiny-form-item :label="$t('llm.app.type')" prop="appType">
        <tiny-select v-model="formData.appType" :placeholder="$t('llm.app.type.placeholder')" clearable>
          <tiny-option
            v-for="item in proxy.$dict.getDictData('ai_app_type')" :key="item.dictValue" :label="item.dictLabel"
            :value="item.dictValue"/>
        </tiny-select>
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.app.description')" prop="description">
        <tiny-input
          v-model="formData.description" type="textarea" :autosize="{ minRows: 5 }" :maxlength="1500" show-word-limit
          :placeholder="$t('llm.app.description.placeholder')"/>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button @click="onClose(false)">取消</tiny-button>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as PlatformApi from '@/api/large-model/platform';
import * as AppApi from '@/api/large-model/app';
import {computed, getCurrentInstance, Ref, ref, toRaw} from 'vue';
import * as ModelApi from "@/api/large-model/model";
import * as KnowledgeBaseApi from "@/api/large-model/knowledge-base";


const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改应用' : '新增应用';
});

const formData = ref<AppApi.EditAppVO>({});

const formDataRules = {
  name: [{required: true, message: '模型名称不能为空', trigger: 'change'}],
  modelId: [{required: true, message: '请选择模型', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        AppApi.updateAppById(formData.value.id, toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({message: '修改成功', status: 'success'});
            onClose(true);
          })
      } else {
        AppApi.addApp(toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({message: '创建成功', status: 'success'});
            onClose(true);
          })
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
    AppApi.getLatestAppById(id, false).then((res) => {
      formData.value = res.data;
      const {latestVersion} = res.data;
      if (latestVersion) {
        formData.value.name = latestVersion.name;
        formData.value.description = latestVersion.description;
      }
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

</style>
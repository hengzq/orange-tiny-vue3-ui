<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      @close="onClose(false)"
  >
    <tiny-form
        ref="formDataRef" label-position="left" :rules="formDataRules" :model="formData" label-width="120px" validate-position="bottom"
        validate-type="text">

      <tiny-form-item :label="$t('large-model.knowledge.name')" prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('large-model.knowledge.name.placeholder')"/>
      </tiny-form-item>
      <tiny-form-item :label="$t('large-model.model.platform')" prop="platform">
        <tiny-select v-model="formData.platform" @change="changePlatform">
          <tiny-option v-for="item in platformList" :key="item.code" :label="item.name" :value="item.code"/>
        </tiny-select>
      </tiny-form-item>
      <tiny-form-item :label="$t('large-model.knowledge.document.embeddingModel')" prop="embeddingModel">
        <tiny-select v-model="formData.embeddingModel">
          <tiny-option v-for="item in filterModelList" :key="item.code" :label="item.name" :value="item.code"/>
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item :label="$t('attribute.enabled.status')" prop="enabled">
        <tiny-radio
            v-for="(item, index) in proxy.$dict.getDictData(
                proxy.$dict.SYS_DATA_ENABLE_STATUS,
              )"
            :key="index"
            v-model="formData.enabled"
            :label="item.dictValue == 'true'"
        >
          {{ item.dictLabel }}
        </tiny-radio>
      </tiny-form-item>
      <tiny-form-item :label="$t('attribute.sort')" prop="sort">
        <tiny-numeric v-model="formData.sort"></tiny-numeric>
      </tiny-form-item>
      <tiny-form-item :label="$t('large-model.knowledge.description')" prop="description">
        <tiny-input
            v-model="formData.description" :placeholder="$t('large-model.knowledge.description.placeholder')"
            type="textarea" :maxlength="500" :rows="5" show-word-limit/>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as KnowledgeApi from '@/api/large-model/knowledge-base';
import {computed, getCurrentInstance, Ref, ref, toRaw} from 'vue';
import * as PlatformApi from "@/api/large-model/platform";
import * as ModelApi from "@/api/large-model/model";

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改知识库' : '新增知识库';
});

const formData = ref<KnowledgeApi.KnowledgeVO>({});

const formDataRules = {
  name: [{required: true, message: '模型名称不能为空', trigger: 'change'}],
};

const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);
const queryPlatformList = () => {
  PlatformApi.listPlatform({"modelType": "EMBEDDING"}).then((res) => {
    platformList.value = res.data;
    const defaultCode = platformList.value[0]?.code;
    if (defaultCode) {
      formData.value.platform = defaultCode;
    }
  });
};
queryPlatformList();
const filterModelList: Ref<ModelApi.ModelVO[]> = ref([]);
const changePlatform = (item: any) => {
  filterModelList.value = modelList.value.filter((p) => p.platform === item);
  if (formData.value.embeddingModel) {
    formData.value.embeddingModel = '';
  }
};

const modelList: Ref<ModelApi.ModelVO[]> = ref([]);
const queryModelList = () => {
  ModelApi.listModel({
    type: 'EMBEDDING',
    enabled: true,
  }).then((res) => {
    modelList.value = res.data;
    if (formData.value.platform) {
      changePlatform(formData.value.platform);
      formData.value.embeddingModel = filterModelList.value[0].code;
    }
  });
};
queryModelList();

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        KnowledgeApi.updateKnowledgeById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              onClose(true);
            });
      } else {
        KnowledgeApi.addKnowledge(toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '创建成功', status: 'success'});
              onClose(true);
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

const resetForm = () => {
  formData.value = {
    enabled: true,
    sort: 1,
  };
  proxy.$refs.formDataRef.resetFields();
};

const open = (id: string) => {
  isModify.value = false;
  resetForm();
  if (id) {
    KnowledgeApi.getKnowledgeById(id).then((res) => {
      formData.value = res.data;
      isModify.value = true;
    });
  }
  visible.value = true;
};

defineExpose({
  open,
});
</script>

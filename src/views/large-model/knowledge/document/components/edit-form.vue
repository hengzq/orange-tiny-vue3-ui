<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      width="60%"
      :show-footer="true"
      @close="onClose(false)"
  >
    <tiny-form
        ref="formDataRef" :rules="formDataRules" :model="formData" label-width="110px" validate-position="bottom"
        validate-type="text">

      <tiny-form-item :label="$t('llm.knowledge.document.fileName')" prop="fileName">
        <tiny-input v-model="formData.fileName" :placeholder="$t('llm.knowledge.document.fileName.placeholder')"/>
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.knowledge.document.slice')" prop="embeddingModel">
        <tiny-card v-for="(item,index) in formData.documentSliceList" :key="index" type="text" style="width: 100%">
          {{ item.content }}
        </tiny-card>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <!--      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>-->
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as KnowledgeDocumentApi from "@/api/large-model/knowledge-document";
import {computed, getCurrentInstance, Ref, ref} from 'vue';
import * as PlatformApi from "@/api/large-model/platform";
import * as ModelApi from "@/api/large-model/model";

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改知识库' : '新增知识库';
});

const formData = ref<KnowledgeDocumentApi.KnowledgeVO>({});

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
    modelType: 'EMBEDDING',
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
        // KnowledgeDocumentApi.updateKnowledgeById(formData.value.id, toRaw(formData.value))
        //     .then((res) => {
        //       proxy.$modal.message({message: '修改成功', status: 'success'});
        //       onClose(true);
        //     });
      } else {
        // KnowledgeDocumentApi.addKnowledge(toRaw(formData.value))
        //     .then((res) => {
        //       proxy.$modal.message({message: '创建成功', status: 'success'});
        //       onClose(true);
        //     });
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
    KnowledgeDocumentApi.getKnowledgeDocumentById(id).then((res) => {
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

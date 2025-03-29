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
      <tiny-form-item :label="$t('large-model.knowledge.document.slice')" prop="embeddingModel">
        <md-editor v-model="formData.content" :toolbars="toolbars" :footers="footers" :preview="false"/>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {MdEditor} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import * as KnowledgeDocSliceApi from "@/api/large-model/knowledge-doc-slice";
import {computed, getCurrentInstance, ref, toRaw} from 'vue';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改切片' : '新增切片';
});

const toolbars: any[] = [];
const footers: any[] = [];

const formData = ref<KnowledgeDocSliceApi.KnowledgeDocSliceVO>({});

const formDataRules = {
  name: [{required: true, message: '模型名称不能为空', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        KnowledgeDocSliceApi.updateKnowledgeDocSliceById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              onClose(true);
            });
      } else {
        KnowledgeDocSliceApi.addKnowledgeDocSlice(toRaw(formData.value))
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
  formData.value = {};
  proxy.$refs.formDataRef.resetFields();
};

const open = (id: string) => {
  isModify.value = false;
  resetForm();
  if (id) {
    KnowledgeDocSliceApi.getKnowledgeDocSliceById(id).then((res) => {
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

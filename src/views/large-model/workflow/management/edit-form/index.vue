<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="32%" @close="onClose(false)">
    <tiny-form ref="formDataRef" :rules="formDataRules" :model="formData" label-width="120px" validate-position="bottom"
      validate-type="text">
      <tiny-form-item :label="$t('llm.wf.name')" prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('llm.wf.name.placeholder')" />
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.wf.description')" prop="description">
        <tiny-input v-model="formData.description" type="textarea" :autosize="{ minRows: 5 }" :maxlength="1500"
          show-word-limit :placeholder="$t('llm.wf.description.placeholder')" />
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button @click="onClose(false)">取消</tiny-button>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as WfApi from '@/api/large-model/wf';
import { computed, getCurrentInstance, ref, toRaw } from 'vue';


const emit = defineEmits(['ok']);
const { proxy } = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改工作流' : '新增工作流';
});

const formData = ref<WfApi.EditWfVO>({
  id: '',
  name: '',
  description: '',
  baseList: [],
  mcpServerList: [],
});

const formDataRules = {
  name: [{ required: true, message: '工作流名称不能为空', trigger: 'change' }],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        WfApi.updateWfById(formData.value.id, toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({ message: '修改成功', status: 'success' });
            onClose(true);
          })
      } else {
        WfApi.addWf(toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({ message: '创建成功', status: 'success' });
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

const resetForm = () => {
  formData.value = {
    id: '',
    name: '',
    description: '',
    baseList: [],
    mcpServerList: [],
  };
  proxy.$refs.formDataRef.resetFields();
};

const open = (id: string) => {
  isModify.value = false;
  resetForm();
  if (id) {
    WfApi.getWfById(id, false).then((res) => {
      formData.value = res.data;
      const { latestVersion } = res.data;
      if (latestVersion) {
        formData.value.name = latestVersion.name;
        formData.value.description = latestVersion.description;
      }
      isModify.value = true;
    });
  }
  visible.value = true;
};

defineExpose({
  open,
});
</script>

<style scoped></style>
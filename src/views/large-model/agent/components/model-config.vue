<template>
  <tiny-drawer
    :title="title" :visible="visible" :show-footer="true" width="30%" @close="onClose()">
    <tiny-form
      ref="formDataRef"
      :rules="formDataRules"
      :model="formData"
      label-width="110px"
      validate-position="bottom"
      validate-type="text"
    >
      <tiny-form-item :label="$t('large-model.model.config.temperature')">
        <tiny-slider v-model="formData.temperature" :show-input="true" :min="0" :max="1" :step="0.01" unit=""></tiny-slider>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button type="primary" @click="onSubmit()">确定</tiny-button>
      <tiny-button @click="onClose()">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, ref} from 'vue';
import * as ModelApi from "@/api/large-model/model";

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = computed(() => {
  return '模型参数设置';
});

const formData = ref<ModelApi.ModelConfig>({});
const formDataRules = {};


const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      onClose();
    }
  });
};

const onClose = () => {
  visible.value = false;
};

const resetForm = () => {
  formData.value = {};
  proxy.$refs.formDataRef.resetFields();
};

const open = (modelConfig: ModelApi.ModelConfig) => {
  resetForm();
  formData.value = modelConfig
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
<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="30%" @close="onClose()">
    <tiny-form ref="formDataRef" :rules="formDataRules" :model="formData" label-width="150px" validate-position="bottom"
      validate-type="text">
      <tiny-form-item>
        <template #label>
          {{ $t('large-model.model.config.temperature') }}
          <tiny-tooltip type="normal" :content="temperatureTooltip" placement="bottom">
            <tiny-button type="text" class="prompt-explanation">
              <svg-icon name="system-explanation" color="#6b6d75" />
            </tiny-button>
          </tiny-tooltip>
        </template>
        <tiny-slider v-model="formData.temperature" :show-input="true" :min="0" :max="1" :step="0.01" unit="" />
      </tiny-form-item>

      <tiny-form-item>
        <template #label>
          {{ $t('large-model.model.config.sessionRound') }}
          <tiny-tooltip type="normal" :content="sessionRoundTooltip" placement="bottom">
            <tiny-button type="text" class="prompt-explanation">
              <svg-icon name="system-explanation" color="#6b6d75" />
            </tiny-button>
          </tiny-tooltip>
        </template>
        <tiny-slider v-model="formData.sessionRound" :show-input="true" :min="0" :max="100" :step="1" unit="" />
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button @click="onClose()">取消</tiny-button>
      <tiny-button type="primary" @click="onSubmit()">确定</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import { computed, getCurrentInstance, ref } from 'vue';
import * as ModelApi from "@/api/large-model/model";

const emit = defineEmits(['config']);
const { proxy } = getCurrentInstance() as any;
const visible = ref(false);
const title = computed(() => {
  return '模型参数设置';
});

const formData = ref<ModelApi.ModelConfig>({});
const formDataRules = {};

const temperatureTooltip = computed(() => {
  return '温度（Temperature）是一个控制生成文本的随机性和多样性的参数。较低的温度值（如0.1）会使模型生成更确定、更一致的文本，而较高的温度值（如0.9）则会增加生成文本的随机性和多样性。';
});

const sessionRoundTooltip = computed(() => {
  return '设置带入模型上下文的对话历史轮数。轮数越多，多轮对话的相关性越高，但消耗的 Token 也越多。';
});


const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      emit('config', formData.value);
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
  formData.value = modelConfig || {
    temperature: 0.85,
    sessionRound: 5,
  };
  visible.value = true;
};

defineExpose({
  open,
});
</script>

<style scoped>
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
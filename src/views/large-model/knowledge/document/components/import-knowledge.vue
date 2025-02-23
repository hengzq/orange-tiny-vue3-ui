<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      width="60%"
      @close="onClose(false)"
  >

    <tiny-form
        ref="formDataRef" label-position="left" :rules="formDataRules" :model="formData" label-width="0" validate-position="bottom"
        validate-type="text">
      <!--      <tiny-form-item prop="name">-->
      <!--        <tiny-radio-group v-model="value" fill="#fa9841" text-color="#fff">-->
      <!--          <tiny-radio-button label="1">文档</tiny-radio-button>-->
      <!--          <tiny-radio-button label="2">URL</tiny-radio-button>-->
      <!--        </tiny-radio-group>-->
      <!--      </tiny-form-item>-->

      <tiny-form-item prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('large-model.knowledge.name.placeholder')"/>
      </tiny-form-item>
      <tiny-form-item prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('large-model.knowledge.name.placeholder')"/>
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
import {computed, getCurrentInstance, reactive, ref, toRaw} from 'vue';

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

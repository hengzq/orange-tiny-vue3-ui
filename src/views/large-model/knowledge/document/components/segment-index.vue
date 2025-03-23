<template>
  <tiny-drawer
      :title="formData.fileName"
      :visible="visible" width="70%" :show-footer="true" @close="onClose(false)">
    <tiny-card v-for="(item,index) in formData.documentSliceList" :key="index" type="text" custom-class="slice-card">
      {{ item.content }}
    </tiny-card>
    <template #footer>
      <!--      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>-->
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as KnowledgeDocumentApi from "@/api/large-model/knowledge-document";
import {getCurrentInstance, ref} from 'vue';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
// const title = computed(() => {
//   return isModify.value ? formData.fileName;
// });

const formData = ref<KnowledgeDocumentApi.KnowledgeDocumentVO>({});


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
  formData.value = {};
  // proxy.$refs.formDataRef.resetFields();
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
<style scoped>
.slice-card {
  padding: 10px;
  background-color: #f0f0f0;
  width: 100%;
  color: snow;
  margin-bottom: 10px;
}
</style>
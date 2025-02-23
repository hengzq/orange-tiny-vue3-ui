<template>
  <tiny-drawer
      :title="title" :visible="visible" :show-footer="true" width="60%" @close="onClose()">
    <tiny-steps line vertical style="padding-bottom: 30px" :data="data" :active="active" @click="advancedClick"></tiny-steps>

    <tiny-form
        v-if="active == 0" ref="webFormDataRef" label-position="left" :rules="webFormDataRules" :model="webFormData" label-width="80px"
        validate-position="bottom" validate-type="text">
      <tiny-form-item :label="$t('large-model.knowledge.document.webUrl')" prop="url">
        <tiny-input v-model="webFormData.url" :placeholder="$t('large-model.knowledge.document.webUrl.placeholder')"/>
      </tiny-form-item>
    </tiny-form>

    <tiny-form
        v-if="active == 1" ref="formDataRef" label-position="left" :rules="formDataRules" :model="formData" label-width="0"
        validate-position="bottom" validate-type="text">
      <tiny-form-item prop="fileName">
        <tiny-input v-model="formData.fileName"/>
      </tiny-form-item>
      <tiny-form-item prop="content">
        <md-editor v-model="formData.content" :preview="false"/>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button v-if="active == 0" type="primary" @click="next()">下一步</tiny-button>
      <tiny-button v-if="active == 1" type="primary" @click="saveToFile()">保存为文档</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {MdEditor} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import * as KnowledgeDocumentApi from "@/api/large-model/knowledge-document";
import {getCurrentInstance, reactive, ref, toRaw} from 'vue';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = "从网页导入知识"

const active = ref(0)
const data = reactive([
  {name: '从URL获取知识'},
  {name: '知识配置'}
])

const webFormData = ref<KnowledgeDocumentApi.UrlParam>({});
const webFormDataRules = {
  url: [{required: true, message: '请输入网站URL', trigger: 'change'}],
};

const next = () => {
  proxy.$refs.webFormDataRef.validate((valid: boolean) => {
    if (valid) {
      KnowledgeDocumentApi.getMarkdownFromUrl(toRaw(webFormData.value)).then((res) => {
        formData.value.content = res.data.content
        formData.value.fileName = res.data.title
        // 下一步
        active.value += 1
      });
    }
  })
}

const formData = ref<KnowledgeDocumentApi.AddTextToKnowledgeParam>({});
const formDataRules = {
  url: [{required: true, message: '请输入网站URL', trigger: 'change'}],
};
const saveToFile = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      KnowledgeDocumentApi.addTextToKnowledge(toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({message: '创建成功', status: 'success'});
            onClose(true);
          });
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
  active.value = 0;
};

const open = (baseId: string) => {
  resetForm();
  formData.value.baseId = baseId
  visible.value = true;
};

defineExpose({
  open,
});
</script>

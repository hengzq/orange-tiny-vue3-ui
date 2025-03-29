<template>
  <tiny-drawer
      :title="title" :visible="visible" :show-footer="true" width="80%" @close="onClose()">
    <tiny-steps line vertical style="padding-bottom: 30px" :data="stepData" :active="active"></tiny-steps>

    <tiny-form
        v-if="active == 0" ref="webFormDataRef" label-width="80px"
        validate-position="bottom" validate-type="text">
      <tiny-form-item prop="url">
        <tiny-file-upload :http-request="uploadHttpRequest" :file-list="fileList" list-type="saas" :before-remove="beforeRemoveFile">
          <template #trigger>
            <tiny-button>选取文件</tiny-button>
          </template>
          <template #tip>
            <div class="tiny-upload__tip">支持格式：TXT、MarkDown、DOCX</div>
          </template>
        </tiny-file-upload>
      </tiny-form-item>
    </tiny-form>


    <tiny-row v-if="active == 1">
      <tiny-col :span="4" style="padding-right: 20px">
        <tiny-form
            ref="formDataRef" :rules="formDataRules" label-width="110px" :model="formData" validate-position="bottom"
            validate-type="text">
          <tiny-form-item :label="$t('large-model.knowledge.document.sliceIdentifierList')" prop="fileName">
            <tiny-select
                v-model="formData.sliceIdentifierList" :placeholder="$t('large-model.knowledge.document.sliceIdentifierList.placeholder')"
                multiple clearable :show-alloption="false">
              <tiny-option
                  v-for="item in proxy.$dict.getDictData('ai_knowledge_base_doc_slice_identifier')" :key="item.dictValue" :label="item.dictLabel"
                  :value="item.dictValue"/>
            </tiny-select>
          </tiny-form-item>
          <tiny-form-item align="right">
            <tiny-button type="primary" plain @click="splitDocument"> 生成预览</tiny-button>
          </tiny-form-item>
        </tiny-form>
      </tiny-col>
      <tiny-col :span="8">
        <tiny-tabs v-model="activeName2" separator size="large">
          <tiny-tab-item
              v-for="(item, index) in knowledgeDocumentSliceList" :key="index" :title="item.fileInfo.fileName"
              :name="item.fileInfo.fileName">
            <tiny-card v-for="(segment,sIndex) in item.sliceList" :key="sIndex" type="text" class="slice-card">
              {{ segment.content }}
            </tiny-card>
          </tiny-tab-item>
        </tiny-tabs>
      </tiny-col>
    </tiny-row>


    <template #footer>
      <tiny-button v-if="active == 0" type="primary" @click="next()">下一步</tiny-button>
      <tiny-button v-if="active == 1" type="primary" @click="previous()">上一步</tiny-button>
      <tiny-button v-if="active == 1" type="primary" @click="saveToFile()">保存为文档</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import 'md-editor-v3/lib/style.css';

import * as KnowledgeDocumentApi from "@/api/large-model/knowledge-document";
import {KnowledgeDocumentSlice} from "@/api/large-model/knowledge-document";
import {getCurrentInstance, reactive, Ref, ref} from 'vue';
import * as ObjectApi from "@/api/system/storage/object";

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = "本地文档导入"

const active = ref(0)
const stepData = reactive([
  {name: '上传文件'},
  {name: '分段预览'}
])


const fileList: Ref<ObjectApi.FileInfo []> = ref([])
const uploadHttpRequest = ({file}: { file: File }) => {
  const formData = new FormData();
  formData.append("file", file);
  ObjectApi.upload(formData).then((res) => {
    const {fileName, filePath, fileSize} = res.data;
    fileList.value.push(
        {
          'name': fileName,
          'fileName': fileName,
          'filePath': filePath,
          'size': Number(fileSize),
          'fileSize': Number(fileSize)
        }
    )
  })
}
const beforeRemoveFile = (file: ObjectApi.FileInfo) => {
  fileList.value = fileList.value.filter(item => item.name !== file.name && item.fileName !== file.fileName)
}

const previous = () => {
  active.value -= 1
}

const activeName2 = ref('')


const knowledgeDocumentSliceList: Ref<KnowledgeDocumentApi.DocumentInfo[]> = ref([])
const next = () => {
  splitDocument()
  // 下一步
  active.value += 1
}

const splitDocument = () => {
  KnowledgeDocumentApi.knowledgeDocumentSplit({
    "fileList": fileList.value
  }).then((res) => {
    knowledgeDocumentSliceList.value = res.data
    activeName2.value = res.data[0].fileInfo.fileName
  })
}


const formData = ref<KnowledgeDocumentApi.KnowledgeDocumentSlice>({});
const formDataRules = {
  url: [{required: true, message: '请输入网站URL', trigger: 'change'}],
};
const saveToFile = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      const knowledgeDocumentSlice: KnowledgeDocumentSlice = {
        baseId: formData.value.baseId,
        documentList: knowledgeDocumentSliceList.value
      }
      KnowledgeDocumentApi.batchAddDocumentAndSlice(knowledgeDocumentSlice)
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
<style scoped>
.slice-card {
  padding: 10px;
  background-color: #f0f0f0;
  width: 100%;
  color: snow;
  margin-bottom: 10px;
}
</style>
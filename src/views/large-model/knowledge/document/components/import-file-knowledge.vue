<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="80%" @close="onClose(false)">
    <tiny-steps line vertical style="padding-bottom: 30px" :data="stepData" :active="active"></tiny-steps>

    <!-- 文件上传 -->
    <tiny-form
      v-if="active == 0" ref="webFormDataRef" label-width="80px" validate-position="bottom" validate-type="text">
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

    <!-- 切片预览 -->
    <tiny-row v-if="active == 1" v-loading="previewLoading">
      <tiny-col :span="4" style="padding-right: 20px">
        <tiny-form ref="formDataRef" :rules="formDataRules" label-width="110px" :model="formData" validate-position="bottom" validate-type="text">
          <tiny-form-item :label="$t('llm.knowledge.document.sliceIdentifierList')" prop="fileName">
            <tiny-select
              v-model="formData.sliceIdentifierList" :placeholder="$t('llm.knowledge.document.sliceIdentifierList.placeholder')"
              multiple clearable :show-alloption="false">
              <tiny-option
                v-for="item in proxy.$dict.getDictData('ai_knowledge_base_doc_slice_identifier')" :key="item.dictValue" :label="item.dictLabel"
                :value="item.dictValue"/>
            </tiny-select>
          </tiny-form-item>
          <tiny-form-item :label="$t('llm.knowledge.document.chunkSize')" prop="chunkSize">
            <tiny-slider v-model="formData.chunkSize" :show-input="true" :min="100" :max="6000" unit=""/>
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
            <div class="preview-chunks">
              <div v-for="(segment,sIndex) in item.chunks" :key="sIndex" class="item">
                <div class="content"> {{ segment.text }}</div>
              </div>
            </div>
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
import {AddDocAndChunkParam} from "@/api/large-model/knowledge-document";
import {getCurrentInstance, reactive, Ref, ref} from 'vue';
import * as ObjectApi from "@/api/system/storage/object";
import {TinyButton, TinyLoading} from '@opentiny/vue'

const vLoading = TinyLoading.directive

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = "本地文档导入"

const active = ref(0)
const stepData = reactive([
  {name: '上传文件'},
  {name: '分段预览'}
])

const formData = ref<KnowledgeDocumentApi.DocSplitParam>({});
const formDataRules = {
  url: [{required: true, message: '请输入网站URL', trigger: 'change'}],
};


const fileList: Ref<ObjectApi.FileInfo []> = ref([])
const uploadHttpRequest = ({file}: { file: File }) => {
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  ObjectApi.upload(uploadFormData).then((res) => {
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
// -------------------------------------------------------

const previewLoading = ref(false)
const activeName2 = ref('')


const knowledgeDocumentSliceList: Ref<KnowledgeDocumentApi.DocumentInfo[]> = ref([])
const next = () => {
  splitDocument()
  // 下一步
  active.value += 1
}

const splitDocument = () => {
  KnowledgeDocumentApi.knowledgeDocumentSplit({
    ...formData.value,
    "fileList": fileList.value
  }).then((res) => {
    knowledgeDocumentSliceList.value = res.data
    activeName2.value = res.data[0].fileInfo.fileName
  })
}


const saveToFile = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      previewLoading.value = true
      const addDocAndChunkParam: AddDocAndChunkParam = {
        baseId: formData.value.baseId,
        docs: knowledgeDocumentSliceList.value
      }
      KnowledgeDocumentApi.batchAddDocAndChunk(addDocAndChunkParam)
        .then((res) => {
          previewLoading.value = false;
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
  formData.value.chunkSize = 800;
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
.preview-chunks {
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  display: flex;
  height: 60vh;
  overflow-y: auto;
  padding-right: 8px;

  .item {
    border: 1px solid #878aab26;
    border-radius: 16px;
    width: 100%;
    padding: 12px 20px;

    .content {
      color: #26244ccc;
      min-height: 44px;
      font-size: 12px;
      line-height: 22px;
      word-wrap: break-word; /* 允许长单词或 URL 在需要时断行 */
    }
  }
}

</style>
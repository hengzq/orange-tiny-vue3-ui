<template>
  <tiny-drawer
      :title="title" :visible="visible" :show-footer="true" width="80%" @close="onClose()">
    <tiny-steps line vertical style="padding-bottom: 30px" :data="stepData" :active="active"></tiny-steps>

    <tiny-form
        v-if="active == 0" ref="webFormDataRef" label-position="left" label-width="80px"
        validate-position="bottom" validate-type="text">
      <tiny-form-item prop="url">
        <tiny-file-upload :http-request="uploadHttpRequest" :file-list="fileList" :before-remove="beforeRemoveFile">
          <template #trigger>
            <tiny-button>选取文件</tiny-button>
          </template>
          <template #tip>
            <div class="tiny-upload__tip">只能上传 word 文件，且不超过 10MB</div>
          </template>
        </tiny-file-upload>
      </tiny-form-item>
    </tiny-form>


    <tiny-row v-if="active == 1">
      <tiny-col :span="5">
        <tiny-form
            ref="formDataRef" label-position="left" :rules="formDataRules" :model="formData" validate-position="bottom" validate-type="text">
          <tiny-form-item :label="$t('large-model.knowledge.document.fileName')" prop="fileName">
            <tiny-input v-model="formData.fileName"/>
          </tiny-form-item>
        </tiny-form>
      </tiny-col>
      <tiny-col :span="7">

        <tiny-tabs v-model="activeName2" separator size="large">
          <tiny-tab-item v-for="(item, index) in knowledgeDocumentSliceList" :key="index" :title="item.fileInfo.originalName"
                         :name="item.fileInfo.originalName">
            <tiny-card v-for="(segment,sIndex) in item.sliceList" :key="sIndex" type="text" title="sIndex" style="width: 100%;margin-bottom: 10px">
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
import {getCurrentInstance, reactive, Ref, ref, toRaw} from 'vue';
import * as ObjectApi from "@/api/system/storage/object";
import {DocumentInfo, KnowledgeDocumentSlice} from "@/api/large-model/knowledge-document";

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
    const {originalName, fileName, size} = res.data;
    fileList.value.push(
        {
          'name': originalName,
          'fileName': fileName,
          'originalName': originalName,
          'size': size
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
  KnowledgeDocumentApi.knowledgeDocumentSplit({
    "fileList": fileList.value
  }).then((res) => {
    knowledgeDocumentSliceList.value = res.data
    activeName2.value = res.data[0].fileInfo.originalName
  })
  // 下一步
  active.value += 1
}

const formData = ref<KnowledgeDocumentApi.AddTextToKnowledgeParam>({});
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

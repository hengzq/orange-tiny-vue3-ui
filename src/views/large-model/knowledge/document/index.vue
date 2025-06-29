<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.knowledge.document.fileName')">
            <tiny-input v-model="filterOptions.fileName" clearable :placeholder="$t('large-model.knowledge.document.fileName.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="8">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
        </tiny-col>
      </tiny-row>
    </tiny-form>
    <tiny-grid
      ref="gridTableRef" class="table-list" :fetch-data="fetchTableData" :pager="pagerConfig" :loading="loading"
      @cell-click="cellClickEvent" @toolbar-button-click="toolbarButtonClickEvent">
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="fileName" :title="$t('large-model.knowledge.document.fileName')"/>
      <tiny-grid-column field="fileSize" :title="$t('large-model.knowledge.document.fileSize')" width="100">
        <template #default="scope"> {{ formatFileSize(scope.row.fileSize) }}</template>
      </tiny-grid-column>
      <tiny-grid-column field="fileStatus" :title="$t('large-model.knowledge.document.fileStatus')" align="center" width="120">
        <template #default="scope">
          <!--          <icon-loading-shadow v-if="['PARSING','EMB_PENDING','EMB_PROCESSING'].includes(scope.row.fileStatus)"-->
          <!--                               style="fill: blue;  margin-right: 6px"/>-->
          <!--          <icon-operationfaild-l v-else-if="['PARSE_FAILED','EMB_FAILED'].includes(scope.row.fileStatus)" style="fill: red; margin-right: 6px"/>-->
          <!--          <icon-successful v-else style="fill: green; margin-right: 6px"/>-->
          <dict-tag :value="scope.row.fileStatus" :options="proxy.$dict.getDictData('ai_knowledge_doc_status')"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="170"/>
      <tiny-grid-column field="updatedAt" :title="$t('attribute.updatedAt')" align="center" width="170"/>
      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        :width="proxy.$hasPermission(options).length * 80"
      >
        <template #default="scope">
          <tiny-action-menu
            :max-show-num="3" :spacing="8" :options="proxy.$hasPermission(options)"
            @item-click="(data: any) => optionsClick(data.itemData.label, scope.row)">
            <template #item="{ data }">
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">{{ $t(data.label) }}</span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
  <slice-index ref="segmentIndexRef" @ok="handleFormQuery"></slice-index>
  <import-web-knowledge ref="importWebKnowledgeRef" @ok="handleFormQuery"></import-web-knowledge>
  <import-file-knowledge ref="importFileKnowledgeRef" @ok="handleFormQuery"></import-file-knowledge>
</template>

<script lang="ts" setup>
import {formatFileSize} from '@/utils/format';
import {IconLoadingShadow, IconOperationfaildL, IconSuccessful} from '@opentiny/vue-icon'

import * as KnowledgeDocumentApi from '@/api/large-model/knowledge-document';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import ImportWebKnowledge from './components/import-web-knowledge.vue';
import ImportFileKnowledge from './components/import-file-knowledge.vue';
import EditForm from './components/edit-form.vue';
import SliceIndex from './components/slice-index.vue';

const {proxy} = getCurrentInstance() as any;
const iconLoadingShadow = IconLoadingShadow();
const iconSuccessful = IconSuccessful();
const iconOperationfaildL = IconOperationfaildL();

const pagerConfig = reactive({
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 30, 50, 100],
    total: 0,
    align: 'right',
    layout: 'total, prev, pager, next, jumper, sizes',
  },
});

const state = reactive<{
  loading: boolean;
  filterOptions: KnowledgeDocumentApi.KnowledgeDocumentPageParam;
}>({
  loading: false,
  filterOptions: {
    baseId: proxy.$route.params.baseId
  } as KnowledgeDocumentApi.KnowledgeDocumentPageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {
    baseId: proxy.$route.params.baseId
  } as KnowledgeDocumentApi.KnowledgeDocumentPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive<any[]>([
  {
    permission: 'orange-ai:knowledge-doc:add-text-to-knowledge',
    code: 'import-web-knowledge',
    name: '从网页导入',
  },
  {
    permission: 'orange-ai:knowledge-doc:batch-add-document-and-slice',
    code: 'import-file-knowledge',
    name: '本地文档导入',
  },
]);

const importWebKnowledgeRef = ref();
const importFileKnowledgeRef = ref();
const toolbarButtonClickEvent = ({code}: any) => {
  switch (code) {
    case 'import-web-knowledge': {
      importWebKnowledgeRef.value.open(proxy.$route.params.baseId);
      break;
    }
    case 'import-file-knowledge': {
      importFileKnowledgeRef.value.open(proxy.$route.params.baseId);
      break;
    }
    default:
      console.log('code is error.');
  }
};

const cellClickEvent = ({row, column}) => {
  if (column.property === "fileName") {
    segmentIndexRef.value.open(row.id);
  }
}

const options = ref<any[]>([
  {
    label: 'large-model.knowledge.document.segment',
  },
  {
    permission: 'orange-ai:knowledge-doc:delete',
    label: 'opt.delete',
  },
]);

const editFormRef = ref()
const segmentIndexRef = ref()
const optionsClick = (label: string, data: KnowledgeDocumentApi.KnowledgeDocumentVO) => {
  switch (label) {
    case 'large-model.knowledge.document.segment': {
      segmentIndexRef.value.open(data.id);
      break;
    }
    case 'opt.delete': {
      handleDelete(data);
      break;
    }
    default:
      console.log('code is error.');
  }
};

const handleDelete = (data: KnowledgeDocumentApi.KnowledgeDocumentVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除模型【${data.fileName}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        KnowledgeDocumentApi.deleteKnowledgeDocumentById(data.id).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '删除成功',
            status: 'success',
          });
        });
      }
    });
};

const fetchTableData = reactive({
  api: ({page}: any) => {
    const {currentPage, pageSize} = page;
    return getPageData({
      pageNo: currentPage,
      pageSize,
    });
  },
});

const refreshTimer = ref();

async function getPageData(
  params: KnowledgeDocumentApi.KnowledgeDocumentPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: KnowledgeDocumentApi.KnowledgeDocumentPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    if (refreshTimer.value) {
      clearTimeout(refreshTimer.value)
      refreshTimer.value = null
    }
    const {data} = await KnowledgeDocumentApi.pageKnowledgeDocument(queryParams);
    const {records, total} = data;
    const loadingFileStatus = records.filter((item: KnowledgeDocumentApi.KnowledgeDocumentVO) => item.fileStatus && ['PARSING', 'EMB_PENDING', 'EMB_PROCESSING'].includes(item.fileStatus))
      .map((item: KnowledgeDocumentApi.KnowledgeDocumentVO) => item.fileStatus) as string[];
    if (loadingFileStatus.length > 0) {
      refreshTimer.value = setTimeout(() => {
        handleFormQuery()
      }, 5000)
    }
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}


</script>

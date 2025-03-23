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
          <tiny-button type="primary" @click="handleFormQuery">
            {{ $t('opt.search') }}
          </tiny-button>
          <tiny-button @click="handleFormReset">
            {{ $t('opt.reset') }}
          </tiny-button>
        </tiny-col>
      </tiny-row>
    </tiny-form>
    <tiny-grid
        ref="gridTableRef" class="table-list" :fetch-data="fetchTableData" :pager="pagerConfig" :loading="loading"
        @toolbar-button-click="toolbarButtonClickEvent">
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="fileName" :title="$t('large-model.knowledge.document.fileName')"/>
      <tiny-grid-column field="fileSize" :title="$t('large-model.knowledge.document.fileSize')" width="100">
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center"/>
      <tiny-grid-column field="updatedAt" :title="$t('attribute.updatedAt')" align="center"/>
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
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">
                {{ $t(data.label) }}
              </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
  <segment-index ref="segmentIndexRef" @ok="handleFormQuery"></segment-index>
  <import-web-knowledge ref="importWebKnowledgeRef" @ok="handleFormQuery"></import-web-knowledge>
  <import-file-knowledge ref="importFileKnowledgeRef" @ok="handleFormQuery"></import-file-knowledge>
</template>

<script lang="ts" setup>
import {formatFileSize} from '@/utils/ format';

import * as KnowledgeDocumentApi from '@/api/large-model/knowledge-document';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import ImportWebKnowledge from './components/import-web-knowledge.vue';
import ImportFileKnowledge from './components/import-file-knowledge.vue';
import EditForm from './components/edit-form.vue';
import SegmentIndex from './components/segment-index.vue';

const {proxy} = getCurrentInstance() as any;

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
    permission: 'orange-ai:model:add',
    code: 'import-web-knowledge',
    name: '从网页导入',
  },
  {
    permission: 'orange-ai:model:add',
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
const options = ref<any[]>([
  {
    label: 'large-model.knowledge.document.segment',
  },
  {
    permission: 'orange-ai:model:delete',
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
    const {data} = await KnowledgeDocumentApi.pageKnowledgeDocument(queryParams);
    const {records, total} = data;
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}
</script>

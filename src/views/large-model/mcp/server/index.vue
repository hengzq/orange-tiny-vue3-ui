<template>
  <div class="container-list">
    <tiny-form
      :model="filterOptions"
      label-width="130px"
      class="filter-form"
    >
      <tiny-row :flex="true">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.mcp-server.name')">
            <tiny-input
              v-model="filterOptions.name"
              clearable
              :placeholder="$t('large-model.mcp-server.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="8" class="search-btn">
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
      ref="gridTableRef"
      class="table-list"
      :fetch-data="fetchTableData"
      :pager="pagerConfig"
      :loading="loading"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar
          :buttons="proxy.$hasPermission(toolbarButtons)"
          full-screen
        />
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="name" :title="$t('large-model.mcp-server.name')"/>
      <tiny-grid-column field="transportProtocol" :title="$t('large-model.mcp-server.transportProtocol')"/>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center"/>

      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        :width="proxy.$hasPermission(options).length * 50"
      >
        <template #default="scope">
          <tiny-action-menu
            :max-show-num="3"
            :spacing="8"
            :options="proxy.$hasPermission(options)"
            @item-click="
              (data: any) => optionsClick(data.itemData.label, scope.row)
            "
          >
            <template #item="{ data }">
              <span
                v-if="data.label == 'opt.delete'"
                style="color: var(--button-delete-color)"
              >
                {{ $t(data.label) }}
              </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <detail ref="detailRef"/>
  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
</template>

<script lang="ts" setup>
import * as McpServerApi from '@/api/large-model/mcp-server';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';
import Detail from './components/detail.vue';

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
  filterOptions: McpServerApi.McpServerPageParam;
}>({
  loading: false,
  filterOptions: {} as McpServerApi.McpServerPageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as McpServerApi.McpServerPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive<any[]>([
  {
    permission: 'orange-ai:model:add',
    code: 'insert',
    name: '新增',
  },
]);
const editFormRef = ref();
const toolbarButtonClickEvent = ({code}: any) => {
  switch (code) {
    case 'insert': {
      editFormRef.value.open();
      break;
    }
    default:
      console.log('code is error.');
  }
};
const options = ref<any[]>([
  // {
  //   label: 'opt.detail',
  // },
  {
    permission: 'orange-ai:model:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:model:delete',
    label: 'opt.delete',
  },
]);
const detailRef = ref();
const optionsClick = (label: string, data: McpServerApi.McpServerVO) => {
  switch (label) {
    case 'opt.detail': {
      detailRef.value.open(data.id);
      break;
    }
    case 'opt.edit': {
      editFormRef.value.open(data.id);
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

const handleDelete = (data: McpServerApi.McpServerVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除模型【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        McpServerApi.deleteMcpServerById(data.id).then(() => {
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
  params: McpServerApi.McpServerPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: McpServerApi.McpServerPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await McpServerApi.pageMcpServer(queryParams);
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

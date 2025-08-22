<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-width="130px" class="filter-form">
      <tiny-row :flex="true">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.mcp-server.name')">
            <tiny-input v-model="filterOptions.name" clearable :placeholder="$t('llm.mcp-server.name.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.mcp-server.transportProtocol')" prop="platform">
            <tiny-select v-model="filterOptions.transportProtocol">
              <tiny-option v-for="(item) in proxy.$dict.getDictData('ai_mcp_server_transport_protocol')"
                           :key="item.dictValue" :label="item.dictLabel" :value="item.dictValue"/>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4" class="search-btn">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
        </tiny-col>
      </tiny-row>
    </tiny-form>
    <tiny-grid ref="gridTableRef" class="table-list" :fetch-data="fetchTableData" :pager="pagerConfig"
               :loading="loading" @cell-click="cellClickEvent" @toolbar-button-click="toolbarButtonClickEvent">
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="name" :title="$t('llm.mcp-server.name')"/>
      <tiny-grid-column field="enabled" :title="$t('llm.mcp-server.url')" align="center">
        <template #default="scope">
          {{ scope.row.connectionUrl }}{{ scope.row.sseEndpoint }}
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="enabled" :title="$t('attribute.enabled.status')" align="center" width="90">
        <template #default="scope">
          <dict-tag :value="scope.row.enabled" :options="proxy.$dict.getDictData(proxy.$dict.SYS_DATA_ENABLE_STATUS)"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="transportProtocol" :title="$t('llm.mcp-server.transportProtocol')" align="center"
                        width="120"/>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="170"/>

      <tiny-grid-column v-if="proxy.$hasPermission(options).length !== 0" :title="$t('table.operations')" align="center"
                        width="150">
        <template #default="scope">
          <tiny-action-menu :max-show-num="2" :spacing="8" :options="proxy.$hasPermission(optionsBtnFilter(scope.row))"
                            @item-click="(data: any) => optionsClick(data.itemData.label, scope.row)">
            <template #item="{ data }">
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">{{
                  $t(data.label)
                }}</span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
</template>

<script lang="ts" setup>
import * as McpServerApi from '@/api/large-model/mcp-server';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import EditForm from './edit-form/index.vue';

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


const cellClickEvent = ({column, row}: { column: any, row: McpServerApi.McpServerVO }) => {
  if (column.title === '操作') return;
  editFormRef.value.open(row.id, true);
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
  {
    label: 'opt.view'
  },
  {
    label: 'opt.disabled',
  },
  {
    label: 'opt.enabled',
  },
  {
    permission: 'orange-ai:model:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:model:delete',
    label: 'opt.delete',
  },
]);

const optionsBtnFilter = (data: McpServerApi.McpServerVO) => {
  if (data.enabled) {
    return options.value.filter((item) => ['opt.view', 'opt.disabled', 'opt.edit', 'opt.delete'].includes(item.label))
  }
  return options.value.filter((item) => ['opt.view', 'opt.enabled', 'opt.edit', 'opt.delete'].includes(item.label))
}

const optionsClick = (label: string, data: McpServerApi.McpServerVO) => {
  switch (label) {
    case 'opt.view': {
      editFormRef.value.open(data.id, true);
      break;
    }
    case 'opt.disabled': {
      handleEnableDisable(data.id, false);
      break;
    }
    case 'opt.enabled': {
      handleEnableDisable(data.id, true);
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

const handleEnableDisable = (id: string | undefined, enabled: boolean) => {
  if (!id) return;
  McpServerApi.updateMcpServerEnabledById(id, enabled).then(() => {
    handleFormQuery();
    proxy.$modal.message({
      message: enabled ? '启用成功' : '禁用成功',
      status: 'success',
    });
  });
}

const handleDelete = (data: McpServerApi.McpServerVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除MCP服务【${data.name}】吗?`,
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

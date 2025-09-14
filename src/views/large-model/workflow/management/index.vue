<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.wf.name')">
            <tiny-input v-model="filterOptions.name" clearable :placeholder="$t('llm.wf.name.placeholder')"
              @keyup.enter="handleFormQuery" />
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="8" class="search-btn">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
        </tiny-col>
      </tiny-row>
    </tiny-form>
    <tiny-grid ref="gridTableRef" class="table-list" :fetch-data="fetchTableData" :pager="pagerConfig"
      :loading="loading" @toolbar-button-click="toolbarButtonClickEvent">
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen />
      </template>
      <tiny-grid-column type="selection" width="60" />
      <tiny-grid-column field="name" :title="$t('llm.wf.name')" />
      <tiny-grid-column field="workflowStatus" :title="$t('llm.wf.wfStatus')" width="120" align="center">
        <template #default="scope">
          <dict-tag :value="scope.row.workflowStatus" :options="proxy.$dict.getDictData('ai_app_status')" />
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="description" show-overflow :title="$t('attribute.description')" width="260" />
      <tiny-grid-column field="updatedAt" :title="$t('attribute.updatedAt')" align="center" width="170" />
      <tiny-grid-column v-if="proxy.$hasPermission(options).length !== 0" :title="$t('table.operations')" align="center"
        :width="proxy.$hasPermission(options).length * 50">
        <template #default="scope">
          <tiny-action-menu :max-show-num="3" :spacing="8" :options="proxy.$hasPermission(options)" @item-click="
            (data: any) => optionsClick(data.itemData.label, scope.row)
          ">
            <template #item="{ data }">
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)"> {{ $t(data.label) }}
              </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <edit-form ref="editFormRef" @ok="handleFormQuery" />
</template>

<script lang="ts" setup>
import * as WfApi from '@/api/large-model/wf';
import router from "@/router";

import { getCurrentInstance, reactive, ref, toRefs } from 'vue';
import EditForm from './edit-form/index.vue';

const { proxy } = getCurrentInstance() as any;

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
  filterOptions: WfApi.WfPageParam;
}>({
  loading: false,
  filterOptions: {} as WfApi.WfPageParam,
});
const { loading, filterOptions } = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as WfApi.WfPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive<any[]>([
  {
    permission: 'orange-ai:agent:add',
    code: 'insert',
    name: '新增',
  },
]);
const editFormRef = ref();
const toolbarButtonClickEvent = ({ code }: any) => {
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
    label: 'llm.wf.opt.design',
  },
  {
    permission: 'orange-ai:agent:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:agent:delete',
    label: 'opt.delete',
  },
]);

const optionsClick = (label: string, data: WfApi.WfVO) => {
  switch (label) {
    case 'llm.wf.opt.design': {
      router.push(`${import.meta.env.VITE_CONTEXT}workflow/design/${data.id}`);
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

const handleDelete = (data: WfApi.WfVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除工作流【${data?.latestVersion?.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        WfApi.deleteWfById(data.id).then(() => {
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
  api: ({ page }: any) => {
    const { currentPage, pageSize } = page;
    return getPageData({
      pageNo: currentPage,
      pageSize,
    });
  },
});

async function getPageData(params: WfApi.WfPageParam = {
  pageNo: 1,
  pageSize: 10,
}) {
  const queryParams: WfApi.WfPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const { data } = await WfApi.pageWf(queryParams);
    const { records, total } = data;
    return {
      result: records,
      page: { total },
    };
  } finally {
    state.loading = false;
  }
}
</script>

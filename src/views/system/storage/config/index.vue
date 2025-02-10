<template>
  <div class="container-list">
    <tiny-form
        :model="filterOptions"
        label-position="right"
        label-width="100px"
        class="filter-form"
    >
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.role.name')">
            <tiny-input
                v-model="filterOptions.nameLike"
                clearable
                :placeholder="$t('system.role.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.role.permission')">
            <tiny-input
                v-model="filterOptions.permissionLike"
                clearable
                :placeholder="$t('system.role.permission.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
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
        max-height="88%"
        :fetch-data="fetchTableData"
        :pager="pagerConfig"
        :loading="loading"
        :auto-resize="true"
        @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" refresh full-screen/>
      </template>
      <tiny-grid-column type="selection" width="50"></tiny-grid-column>
      <tiny-grid-column field="name" :title="$t('system.storage-config.name')" align="center"/>
      <tiny-grid-column field="mode" :title="$t('system.storage-config.mode')" align="center"/>
      <tiny-grid-column field="master" :title="$t('system.storage-config.master')" align="center" width="80">
        <template #default="scope">
          {{ scope.row.master }}
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="150"/>
      <tiny-grid-column field="description" show-overflow :title="$t('attribute.description')" width="260"/>
      <tiny-grid-column
          v-if="proxy.$hasPermission(options).length !== 0"
          :title="$t('table.operations')"
          align="center"
          :width="proxy.$hasPermission(options).length * 55"
      >
        <template #default="scope">
          <tiny-action-menu
              :max-show-num="3"
              :spacing="8"
              :options="proxy.$hasPermission(options)"
              @item-click="(data: any) => optionsClick(data.itemData.label, scope.row)"
          >
            <template #item="{ data }">
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)"> {{ $t(data.label) }} </span>
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
import * as StorageConfigApi from '@/api/system/storage/config';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';

const {proxy} = getCurrentInstance() as any;
const editFormRef = ref();

const state = reactive<{
  loading: boolean;
  filterOptions: StorageConfigApi.StorageConfigPageParam;
}>({
  loading: false,
  filterOptions: {} as StorageConfigApi.StorageConfigPageParam,
});

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

const gridTableRef = ref();
const {loading, filterOptions} = toRefs(state);

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
    params: StorageConfigApi.StorageConfigPageParam = {
      pageNo: 1,
      pageSize: 10,
    },
) {
  const queryParams: StorageConfigApi.StorageConfigPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await StorageConfigApi.pageStorageConfig(queryParams);
    const {records, total} = data;
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}

const options = ref([
  {
    label: 'opt.edit',
    permission: 'system:role:update',
  },
  {
    label: 'opt.delete',
    permission: 'system:role:delete',
  },
]);

const optionsClick = (
    label: string,
    data: StorageConfigApi.StorageConfigVO,
) => {
  switch (label) {
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

const handleDelete = (data: StorageConfigApi.StorageConfigVO) => {
  proxy.$modal
      .confirm({
        message: `确定要删除角色【${data.name}】吗?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          StorageConfigApi.deleteStorageConfigById(data.id).then(() => {
            handleFormQuery();
            proxy.$modal.message({message: '删除成功', status: 'success'});
          });
        }
      });
};

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload');
};
const handleFormReset = () => {
  state.filterOptions = {} as StorageConfigApi.StorageConfigPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive([
  {
    code: 'insert',
    name: '新增',
    permission: 'system:role:add',
  },
  // {
  //   code: 'batchDelete',
  //   name: '批量删除'
  // }
]);

const toolbarButtonClickEvent = ({code, $grid}: any) => {
  const data = $grid.getSelectRecords();
  switch (code) {
    case 'insert': {
      editFormRef.value.open();
      break;
    }
    case 'batchDelete': {
      debugger;
      break;
    }
    default:
      console.log('code is error.');
  }
};
</script>

<style scoped lang="less"></style>

<template>
  <div class="container-list">
    <tiny-form
        :model="filterOptions"
        label-position="right"
        label-width="110px"
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
        :fetch-data="fetchTableData"
        :pager="pagerConfig"
        :loading="loading"
        :auto-resize="true"
        @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar
            :buttons="proxy.$hasPermission(toolbarButtons)"
            refresh
            full-screen
        />
      </template>
      <tiny-grid-column type="selection" width="50"></tiny-grid-column>
      <tiny-grid-column
          field="name"
          :title="$t('system.role.name')"
          align="center"
      />
      <tiny-grid-column
          field="permission"
          :title="$t('system.role.permission')"
          align="center"
      />
      <tiny-grid-column
          field="enabled"
          :title="$t('attribute.enabled.status')"
          align="center"
          width="90"
      >
        <template #default="scope">
          <dict-tag
              :value="scope.row.enabled"
              :options="
              proxy.$dict.getDictData(proxy.$dict.SYS_DATA_ENABLE_STATUS)
            "
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
          field="sort"
          :title="$t('attribute.sort')"
          align="center"
      />
      <tiny-grid-column
          field="updatedAt"
          :title="$t('attribute.updatedAt')"
          align="center"
          width="170"
      />
      <tiny-grid-column
          field="remark"
          show-overflow
          :title="$t('attribute.remark')"
          width="260"
      />

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
  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
  <allot-resource ref="allotResourceRef"></allot-resource>
</template>

<script lang="ts" setup>
import * as RoleApi from '@/api/system/role';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';
import AllotResource from './components/allot-resource.vue';

const {proxy} = getCurrentInstance() as any;
const editFormRef = ref();
const allotResourceRef = ref();

const state = reactive<{
  loading: boolean;
  filterOptions: RoleApi.RolePageParam;
}>({
  loading: false,
  filterOptions: {} as RoleApi.RolePageParam,
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
    params: RoleApi.RolePageParam = {
      pageNo: 1,
      pageSize: 10,
    },
) {
  const queryParams: RoleApi.RolePageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await RoleApi.pageRole(queryParams);
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
    label: 'system.role.opt.assignResourcesToOneRole',
    permission: 'system:permission:assign-resources-to-one-role'
  },
  {
    label: 'opt.delete',
    permission: 'system:role:delete',
  },
]);

const optionsClick = (label: string, data: RoleApi.RoleVO) => {
  switch (label) {
    case 'opt.edit': {
      editFormRef.value.open(data.id);
      break;
    }
    case 'system.role.opt.assignResourcesToOneRole': {
      allotResourceRef.value.open(data.id);
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

const handleDelete = (data: RoleApi.RoleVO) => {
  proxy.$modal
      .confirm({
        message: `确定要删除角色【${data.name}】吗?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          RoleApi.deleteRoleById(data.id).then(() => {
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
  state.filterOptions = {} as RoleApi.RolePageParam;
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
      break;
    }
    default:
      console.log('code is error.');
  }
};
</script>

<style scoped lang="less"></style>

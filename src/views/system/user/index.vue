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
          <tiny-form-item :label="$t('system.user.name')">
            <tiny-input
              v-model="filterOptions.nameLike"
              clearable
              :placeholder="$t('system.user.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.user.loginAccount')" prop="id">
            <tiny-input
              v-model="filterOptions.loginAccountLike"
              clearable
              :placeholder="$t('system.user.loginAccount.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4" class="search-btn">
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
        :title="$t('system.user.name')"
        align="center"
      />
      <tiny-grid-column
        field="loginAccount"
        :title="$t('system.user.loginAccount')"
        align="center"
      />
      <tiny-grid-column field="email" :title="$t('system.user.email')"/>
      <tiny-grid-column
        field="gender"
        :title="$t('system.user.gender')"
        align="center"
        width="80"
      >
        <template #default="data">
          <dict-tag
            :value="data.row.gender"
            :options="proxy.$dict.getDictData('sys_user_gender')"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="phone"
        :title="$t('system.user.phone')"
        align="center"
      />
      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        width="200"
      >
        <template #default="scope">
          <tiny-action-menu
            :max-show-num="2"
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
  <allot-role ref="allotRoleRef"></allot-role>
  <reset-password ref="resetPasswordRef"></reset-password>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';
import AllotRole from './components/allot-role.vue';
import ResetPassword from './components/reset-password.vue';

const {proxy} = getCurrentInstance() as any;

const state = reactive<{
  loading: boolean;
  filterOptions: UserApi.UserPageParam;
}>({
  loading: false,
  filterOptions: {} as UserApi.UserPageParam,
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
  params: UserApi.UserPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: UserApi.UserPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await UserApi.pageUser(queryParams);
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
    permission: 'system:user:update',
  },
  {
    label: 'system.user.opt.allotUserRole',
    permission: 'system:permission:assign-roles-to-one-user',
  },
  {
    label: 'system.user.opt.resetPassword',
  },
  {
    label: 'opt.delete',
    permission: 'system:user:delete',
  },
]);

const editFormRef = ref();
const allotRoleRef = ref();
const resetPasswordRef = ref();

const optionsClick = (label: string, data: UserApi.UserVO) => {
  switch (label) {
    case 'opt.edit': {
      editFormRef.value.open(data.id);
      break;
    }
    case 'system.user.opt.allotUserRole': {
      allotRoleRef.value.open(data.id);
      break;
    }
    case 'system.user.opt.resetPassword': {
      resetPasswordRef.value.open(data.id);
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

const handleDelete = (data: UserApi.UserVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除用户【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        UserApi.deleteUserById(data.id).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '删除成功',
            status: 'success',
          });
        });
      }
    });
};

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload');
};
const handleFormReset = () => {
  state.filterOptions = {} as UserApi.UserPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive([
  {
    code: 'insert',
    name: '新增',
    permission: 'system:user:add',
  },
  {
    code: 'batchDelete',
    name: '批量删除',
  },
]);

const toolbarButtonClickEvent = ({code, $grid}: any) => {
  const data = $grid.getSelectRecords();
  switch (code) {
    case 'insert': {
      editFormRef.value.open();
      break;
    }
    case 'batchDelete': {
      handleBatchDelete(data);
      break;
    }
    default:
      console.log('code is error.');
  }
};

const handleBatchDelete = (data: UserApi.UserVO[]) => {
  let ids: string[] = data.map((item) => item.id) as string[];
  if (ids.length === 0) {
    proxy.$modal.message({
      message: '请选择需要删除的用户',
      status: 'warning',
    });
    return;
  }
  proxy.$modal
    .confirm({
      message: `确定要批量删除用户吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (res === 'confirm') {
        UserApi.deleteUserByIds(ids).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '批量删除成功',
            status: 'success',
          });
        });
      }
    });
};
</script>

<style scoped lang="less"></style>

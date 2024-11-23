<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="100px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.log.login.account')">
            <tiny-input v-model="filterOptions.account" clearable :placeholder="$t('system.log.login.account.placeholder')"/>
          </tiny-form-item>
        </tiny-col>

        <tiny-col :span="8">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
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

      <tiny-grid-column field="requestId" :title="$t('system.log.login.requestId')" align="center" width="150"/>
      <tiny-grid-column field="account" :title="$t('system.log.login.account')" align="center"/>
      <tiny-grid-column
          field="userName"
          :title="$t('system.log.login.userName')"
          align="center"
          width="80"
      />
      <tiny-grid-column
          field="userIp"
          :title="$t('system.log.login.userIp')"
          align="center"
          width="120"
      />
      <tiny-grid-column
          field="userLocation"
          :title="$t('system.log.operation.userLocation')"
          align="center"
          width="120"
      />
      <tiny-grid-column
          field="status"
          :title="$t('attribute.status')"
          align="center"
          width="80"
      >
        <template #default="data">
          <dict-tag
              :value="data.row.status"
              :options="proxy.$dict.getDictData('sys_operation_status')"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
          field="type"
          :title="$t('system.log.login.type')"
          align="center"
          width="80"
      >
        <template #default="data">
          <dict-tag
              :value="data.row.type"
              :options="proxy.$dict.getDictData('sys_log_login_type')"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
          field="loginTime"
          :title="$t('system.log.login.loginTime')"
          align="center"
          width="150"
      />
      <tiny-grid-column
          field="userAgent"
          show-overflow
          :title="$t('system.log.login.userAgent')"
      />

      <tiny-grid-column
          :title="$t('table.operations')"
          align="center"
          width="100"
      >
        <template #default="data">
          <tiny-button type="text" @click="handleDetail(data.row)">
            {{ $t('opt.detail') }}
          </tiny-button>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>
  <detail ref="detailRef"></detail>
</template>

<script lang="ts" setup>
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import * as LoginLogApi from '@/api/system/log/login';
import detail from './components/detail.vue';

const {proxy} = getCurrentInstance() as any;
const detailRef = ref();

const state = reactive<{
  loading: boolean;
  filterOptions: LoginLogApi.LoginLogPageParam;
}>({
  loading: false,
  filterOptions: {} as LoginLogApi.LoginLogPageParam,
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
    params: LoginLogApi.LoginLogPageParam = {
      pageNo: 1,
      pageSize: 10,
    },
) {
  const queryParams: LoginLogApi.LoginLogPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await LoginLogApi.pageLoginLog(queryParams);
    const {records, total} = data;
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}

const handleDetail = (data: LoginLogApi.LoginLogVO) => {
  detailRef.value.open(data.id);
};

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload');
};
const handleFormReset = () => {
  state.filterOptions = {} as LoginLogApi.LoginLogPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive([
  {
    code: 'export',
    name: '导出',
  },
]);

const toolbarButtonClickEvent = ({code}: any) => {
  switch (code) {
    case 'clear': {
      handleClear();
      break;
    }
    case 'export': {
      proxy.$modal.message('开发中...');
      break;
    }
    default:
      console.log('code is error.');
  }
};

const handleClear = () => {
  proxy.$modal
      .confirm({
        message: `确定清空所有登录日志吗？`,
        maskClosable: true,
        title: '系统提示',
      })
      .then((res: string) => {
        if (res === 'confirm') {
          // SystemRequest.recordLogin.clear().then(() => {
          //   handleFormQuery();
          //   proxy.$modal.message({ message: '清空成功', status: 'success' });
          // });
        }
      });
};
</script>

<style scoped lang="less"></style>

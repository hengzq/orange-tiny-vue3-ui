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
          <tiny-form-item :label="$t('system.record.login.form.account')">
            <tiny-input
              v-model="filterOptions.account"
              clearable
              :placeholder="$t('system.record.login.form.account.placeholder')"
            ></tiny-input>
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
      ref="gridTableRef"
      max-height="580px"
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
          :setting="{ simple: true }"
        />
      </template>

      <tiny-grid-column
        field="traceId"
        :title="$t('system.record.login.table.columns.traceId')"
        align="center"
        width="150"
      />
      <tiny-grid-column
        field="account"
        :title="$t('system.record.login.table.columns.account')"
        align="center"
      />
      <tiny-grid-column
        field="userName"
        :title="$t('system.record.login.table.columns.userName')"
        align="center"
        width="80"
      />
      <tiny-grid-column
        field="userIp"
        :title="$t('system.record.login.table.columns.userIp')"
        align="center"
        width="120"
      />
      <tiny-grid-column
        field="userLocation"
        :title="$t('system.record.operation.table.columns.userLocation')"
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
            :options="proxy.$dict.getDictData('sys_common_operation_status')"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="type"
        :title="$t('system.record.login.table.columns.type')"
        align="center"
        width="80"
      >
        <template #default="data">
          <dict-tag
            :value="data.row.type"
            :options="proxy.$dict.getDictData('sys_record_login_type')"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="loginTime"
        :title="$t('system.record.login.table.columns.loginTime')"
        align="center"
        width="150"
      />
      <tiny-grid-column
        field="userAgent"
        show-overflow
        :title="$t('system.record.login.table.columns.userAgent')"
      />

      <tiny-grid-column
        :title="$t('table.operations')"
        align="center"
        width="100"
      >
        <template #default="data">
          <tiny-button type="text" @click="handleDetail(data.row)">
            {{ $t('global.table.operations.detail') }}
          </tiny-button>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>
  <!--  <detail ref="detailsRef"></detail>-->
</template>

<script lang="ts" setup>
  import { getCurrentInstance, reactive, ref, toRefs } from 'vue';
  import * as LoginLogApi from '@/api/system/log/login';
  // import detail from './components/detail.vue';

  const { proxy } = getCurrentInstance() as any;
  const detailsRef = ref();

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
  const { loading, filterOptions } = toRefs(state);

  const fetchTableData = reactive({
    api: ({ page }: any) => {
      const { currentPage, pageSize } = page;
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
      const { data } = await LoginLogApi.pageLoginLog(queryParams);
      const { records, total } = data;
      return {
        result: records,
        page: { total },
      };
    } finally {
      state.loading = false;
    }
  }

  const handleDetail = (data: LoginLogApi.LoginLogVO) => {
    detailsRef.value.open(data);
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

  const toolbarButtonClickEvent = ({ code }: any) => {
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

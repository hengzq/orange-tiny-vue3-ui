<template>
  <div class="container-list">
    <tiny-form
      :model="filterOptions"
      label-position="right"
      label-width="80px"
      class="filter-form"
    >
      <tiny-row>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.log.operation.resourceName')">
            <tiny-input
              v-model="filterOptions.resourceNameLike"
              clearable
              :placeholder="$t('system.log.operation.resourceName.placeholder')"
            />
          </tiny-form-item>
        </tiny-col>

        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.log.operation.operationTime')">
            <tiny-date-picker
              v-model="operationTime"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['00:00:00', '23:59:59']"
              type="datetimerange"
              clearable
              value-format="yyyy-MM-dd HH:mm:ss"
              @change="handleChange"
            ></tiny-date-picker>
          </tiny-form-item>
        </tiny-col>

        <tiny-col v-if="unfold" :span="4">
          <tiny-form-item :label="$t('system.log.operation.status')">
            <tiny-select v-model="filterOptions.status" :placeholder="$t('system.log.operation.status.placeholder')" clearable>
              <tiny-option
                v-for="item in proxy.$dict.getDictData('sys_operation_status')"
                :key="item.dictValue"
                :label="item.dictLabel"
                :value="item.dictValue"
              />
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col v-if="!unfold" :span="4" class="search-btn">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
          <tiny-button type="text" style="color: #4e5969" @click="() => {unfold = true;}">
            <svg-icon name="system-chevron-down" style="vertical-align: middle"/>
            展开
          </tiny-button>
        </tiny-col>
      </tiny-row>
      <tiny-row v-if="unfold">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.log.operation.requestId')">
            <tiny-input v-model="filterOptions.requestId" clearable :placeholder="$t('system.log.operation.requestId.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="8" class="search-btn">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
          <tiny-button
            v-if="unfold"
            type="text"
            style="color: #4e5969"
            @click="
              () => {
                unfold = false;
              }
            "
          >
            <svg-icon name="system-chevron-up" style="vertical-align: middle"/>
            收起
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
      @cell-click="cellClickEvent"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen refresh/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="requestId" :title="$t('system.log.operation.requestId')" align="center" width="200"/>
      <tiny-grid-column field="resourceName" :title="$t('system.log.operation.resourceName')" show-overflow/>
      <tiny-grid-column :title="$t('system.log.operation.requestMethod')" width="90">
        <template #default="data">
          <dict-tag :value="data.row.requestMethod" :options="proxy.$dict.getDictData('sys_request_method')"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column show-overflow :title="$t('system.log.operation.requestUrl')">
        <template #default="data">
          {{ data.row.requestUrl }}
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="userIp" :title="$t('system.log.operation.userIp')" width="120"/>
      <tiny-grid-column field="userLocation" :title="$t('system.log.operation.userLocation')" width="120"/>
      <tiny-grid-column field="userName" :title="$t('system.log.operation.userName')" align="center" width="110"/>
      <tiny-grid-column field="status" :title="$t('system.log.operation.status')" align="center" width="90">
        <template #default="data">
          <dict-tag :value="data.row.status" :options="proxy.$dict.getDictData('sys_operation_status')"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="startTime" :title="$t('system.log.operation.startTime')" align="center" width="170"/>
      <tiny-grid-column field="duration" :title="$t('system.log.operation.duration')" align="center" width="90">
        <template #default="data"> {{ data.row.duration }} ms</template>
      </tiny-grid-column>
      <tiny-grid-column :title="$t('table.operations')" align="center" width="100">
        <template #default="data">
          <tiny-button type="text" @click="handleDetail(data.row.id)">
            {{ $t('opt.detail') }}
          </tiny-button>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <detail ref="detailsRef"></detail>
</template>

<script lang="ts" setup>
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import * as OperationLogApi from '@/api/system/log/operation';
import detail from './components/detail.vue';

const {proxy} = getCurrentInstance() as any;
const detailsRef = ref();

const state = reactive<{
  loading: boolean;
  filterOptions: OperationLogApi.OperationLogPageParam;
}>({
  loading: false,
  filterOptions: {} as OperationLogApi.OperationLogPageParam,
});

const unfold = ref(false);

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
  params: OperationLogApi.OperationLogPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: OperationLogApi.OperationLogPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await OperationLogApi.pageOperationLog(queryParams);
    const {records, total} = data;
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}

const cellClickEvent = ({row}: { row: OperationLogApi.OperationLogVO }) => {
  if (row.id) {
    handleDetail(row.id);
  }
};

const handleDetail = (id: string) => {
  detailsRef.value.open(id);
};

const operationTime = ref();
const handleChange = (time: [string, string]) => {
  if (time) {
    let [startTime, endTime] = time;
    filterOptions.value.operationStartTime = startTime
    filterOptions.value.operationEndTime = endTime
  } else {
    filterOptions.value.operationStartTime = undefined
    filterOptions.value.operationEndTime = undefined
  }
};

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload');
};
const handleFormReset = () => {
  state.filterOptions = {} as OperationLogApi.OperationLogPageParam;
  operationTime.value = ''
  handleFormQuery();
};

const toolbarButtons = reactive([
  // {
  //   code: 'clear',
  //   name: '清空',
  // },
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
      message: `确定清空所有操作日志吗？`,
      maskClosable: true,
      title: '系统提示',
    })
    .then((res: string) => {
      if (res === 'confirm') {
        // SystemRequest.recordOperation.clear().then(() => {
        //   handleFormQuery()
        //   proxy.$modal.message({ message: '清空成功', status: 'success' });
        // })
      }
    });
};
</script>

<style scoped lang="less">
</style>

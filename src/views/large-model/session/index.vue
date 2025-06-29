<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.session.modelId')" prop="modelId">
            <tiny-cascader v-model="filterOptions.modelId" :options="modelList" :props="{ emitPath: false }" style="width: 100%"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.session.name')">
            <tiny-input v-model="filterOptions.name" clearable :placeholder="$t('large-model.session.name.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
        <!--        <tiny-col :span="4">-->
        <!--          <tiny-form-item :label="$t('large-model.session.sessionType')" prop="quantity">-->
        <!--            <tiny-select v-model="filterOptions.source" :placeholder="$t('large-model.session.sessionType.placeholder')" clearable>-->
        <!--              <tiny-option-->
        <!--                v-for="item in proxy.$dict.getDictData('ai_session_source')" :key="item.dictValue" :label="item.dictLabel"-->
        <!--                :value="item.dictValue"/>-->
        <!--            </tiny-select>-->
        <!--          </tiny-form-item>-->
        <!--        </tiny-col>-->
        <tiny-col :span="4" class="search-btn">
          <tiny-button type="primary" @click="handleFormQuery"> {{ $t('opt.search') }}</tiny-button>
          <tiny-button @click="handleFormReset"> {{ $t('opt.reset') }}</tiny-button>
        </tiny-col>
      </tiny-row>
    </tiny-form>
    <tiny-grid
      ref="gridTableRef"
      class="table-list"
      :fetch-data="fetchTableData"
      :pager="pagerConfig"
      :loading="loading"
      @cell-click="cellClickEvent"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="name" :title="$t('large-model.session.name')" show-overflow/>
      <tiny-grid-column field="modelId" :title="$t('large-model.agent.model')" align="center">
        <template #default="scope">
          <template v-for="(modelItem) in modelList">
            <template v-for="(item, index) in modelItem.children">
              <tiny-tag v-if="item.value === scope.row.modelId" :key="item.value" :index="index">
                {{ modelItem.label }} / {{ item.label }}
              </tiny-tag>
            </template>
          </template>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="source" :title="$t('large-model.session.sessionType')" width="150" align="center">
        <template #default="scope">
          <dict-tag :value="scope.row.sessionType" :options="proxy.$dict.getDictData('ai_session_source')"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="170"/>
      <tiny-grid-column field="updatedAt" :title="$t('attribute.updatedAt')" align="center" width="170"/>
      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        :width="proxy.$hasPermission(options).length * 70"
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
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">   {{ $t(data.label) }}   </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <detail ref="detailRef"/>
</template>

<script lang="ts" setup>
import * as PlatformApi from '@/api/large-model/platform';
import * as SessionApi from '@/api/large-model/session';
import * as ModelApi from "@/api/large-model/model";

import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
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
  filterOptions: SessionApi.SessionPageParam;
}>({
  loading: false,
  filterOptions: {} as SessionApi.SessionPageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as SessionApi.SessionPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive<any[]>([
  {
    permission: 'orange-ai:model:add',
    code: 'batchDelete',
    name: '批量删除',
  },
]);
const toolbarButtonClickEvent = ({code, $grid}: any) => {
  const data = $grid.getSelectRecords();
  switch (code) {
    case 'batchDelete': {
      handleBatchDelete(data);
      break;
    }
    default:
      console.log('code is error.');
  }
};

const cellClickEvent = ({row, column}) => {
  if (column.property === 'name') {
    detailRef.value.open(row.id);
  }
}

const handleBatchDelete = (data: SessionApi.SessionVO[]) => {
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
      message: `确定要批量删除回话吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (res === 'confirm') {
        SessionApi.deleteSessionByIds(ids).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '批量删除成功',
            status: 'success',
          });
        });
      }
    });
};
const options = ref<any[]>([
  {
    label: 'large-model.session.opt.messages',
  },
  {
    permission: 'orange-ai:model:delete',
    label: 'opt.delete',
  },
]);
const detailRef = ref();
const optionsClick = (label: string, data: SessionApi.SessionVO) => {
  switch (label) {
    case 'large-model.session.opt.messages': {
      detailRef.value.open(data.id);
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

const handleDelete = (data: SessionApi.SessionVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除会话【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        SessionApi.deleteSessionById(data.id).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '删除成功',
            status: 'success',
          });
        });
      }
    });
};

const modelList = ref([])
const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    modelList.value = res.data.map((item: ModelApi.ModelVO) => ({'value': item.code, 'label': item.name}))
    queryModelList()
  });
};

const queryModelList = () => {
  ModelApi.listModel({
    modelType: 'CHAT',
    enabled: true,
  }).then((res) => {
    const models = res.data.map((item: ModelApi.ModelVO) => ({'value': item.id, 'label': item.name, 'platform': item.platform}))
    modelList.value.forEach(item => {
      item.children = models.filter((model: ModelApi.ModelVO) => model.platform === item.value)
    })
  });
};
queryPlatformList()

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
  params: SessionApi.SessionPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: SessionApi.SessionPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await SessionApi.pageSession(queryParams);
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

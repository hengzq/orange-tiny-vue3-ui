<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.app.name')">
            <tiny-input v-model="filterOptions.name" clearable :placeholder="$t('llm.app.name.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="8" class="search-btn">
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
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="latestVersion.name" :title="$t('llm.app.name')"/>
      <tiny-grid-column field="appStatus" :title="$t('llm.app.appStatus')">
        <template #default="scope">
          <dict-tag :value="scope.row.appStatus" :options="proxy.$dict.getDictData('ai_app_status')"/>
        </template>
      </tiny-grid-column>
      <!--      <tiny-grid-column field="modelId" :title="$t('large-model.agent.model')" align="center">-->
      <!--        <template #default="scope">-->
      <!--          <template v-for="(modelItem) in modelList">-->
      <!--            <template v-for="(item, index) in modelItem.children">-->
      <!--              <tiny-tag v-if="item.value === scope.row.modelId" :key="item.value" :index="index">-->
      <!--                {{ modelItem.label }} / {{ item.label }}-->
      <!--              </tiny-tag>-->
      <!--            </template>-->
      <!--          </template>-->
      <!--        </template>-->
      <!--      </tiny-grid-column>-->
      <!--      <tiny-grid-column field="modelId" :title="$t('large-model.agent.knowledgeBase')" align="center">-->
      <!--        <template #default="scope">-->
      <!--          <tiny-tag v-for="(item, index) in scope.row.baseList" :key="item.value" :index="index" style="margin-right: 10px">-->
      <!--            {{ item.name }}-->
      <!--          </tiny-tag>-->
      <!--        </template>-->
      <!--      </tiny-grid-column>-->
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="170"/>
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
              <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">   {{ $t(data.label) }}   </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>

  <edit-form ref="editFormRef" @ok="handleFormQuery"/>
  <!--  <app-config ref="appConfigRef" />-->
</template>

<script lang="ts" setup>
import router from "@/router";
import * as PlatformApi from '@/api/large-model/platform';
import * as AppApi from '@/api/large-model/app';
import * as ModelApi from "@/api/large-model/model";

import {getCurrentInstance, reactive, Ref, ref, toRefs} from 'vue';
import EditForm from './edit-form/index.vue';
// import AppConfig from './config/index.vue';

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
  filterOptions: AppApi.AppPageParam;
}>({
  loading: false,
  filterOptions: {} as AppApi.AppPageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as AppApi.AppPageParam;
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
const appConfigRef = ref();
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
    label: 'large-model.agent.opt.demonstration',
  },
  {
    permission: 'orange-ai:agent:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:agent:update',
    label: 'llm.app.opt.config',
  },
  {
    permission: 'orange-ai:agent:delete',
    label: 'opt.delete',
  },
]);
const detailRef = ref();
const optionsClick = (label: string, data: AppApi.AppVO) => {
  switch (label) {
    case 'large-model.agent.opt.demonstration': {
      const route = router.resolve(`${import.meta.env.VITE_CONTEXT}app-ui/${data.id}`);
      window.open(route.href, '_blank');
      break;
    }
    case 'opt.edit': {
      editFormRef.value.open(data.id);
      break;
    }
    case 'llm.app.opt.config': {

      // const route = router.resolve(`${import.meta.env.VITE_CONTEXT}large-model/app-config/${data.id}`);
      // window.open(route.href, '_self');

      router.push(`${import.meta.env.VITE_CONTEXT}large-model/app-config/${data.id}`);
      // appConfigRef.value.open(data.id);
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

const handleDelete = (data: AppApi.AppVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除应用【${data.latestVersion?.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        AppApi.deleteAppById(data.id).then(() => {
          handleFormQuery();
          proxy.$modal.message({
            message: '删除成功',
            status: 'success',
          });
        });
      }
    });
};

const modelList: Ref<ModelApi.PlatformModelTree[]> = ref([])
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
    // 过滤掉没有模型的供应商
    modelList.value = modelList.value.filter(item => item.children && item.children.length > 0)
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

async function getPageData(params: AppApi.AppPageParam = {
  pageNo: 1,
  pageSize: 10,
}) {
  const queryParams: AppApi.AppPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await AppApi.pageApp(queryParams);
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

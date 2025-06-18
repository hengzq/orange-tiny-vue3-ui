<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.agent.modelId')" prop="modelId">
            <tiny-cascader v-model="filterOptions.modelId" :options="modelList" :props="{ emitPath: false }" style="width: 100%"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.agent.name')">
            <tiny-input v-model="filterOptions.name" clearable :placeholder="$t('large-model.agent.name.placeholder')"/>
          </tiny-form-item>
        </tiny-col>
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
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="name" :title="$t('large-model.agent.name')"/>
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
      <tiny-grid-column field="modelId" :title="$t('large-model.agent.knowledgeBase')" align="center">
        <template #default="scope">
          <tiny-tag v-for="(item, index) in scope.row.baseList" :key="item.value" :index="index" style="margin-right: 10px">
            {{ item.name }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center"/>

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
</template>

<script lang="ts" setup>
import router from "@/router";
import * as PlatformApi from '@/api/large-model/platform';
import * as AgentApi from '@/api/large-model/agent';
import * as ModelApi from "@/api/large-model/model";

import {getCurrentInstance, reactive, Ref, ref, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';


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
  filterOptions: AgentApi.AgentPageParam;
}>({
  loading: false,
  filterOptions: {} as AgentApi.AgentPageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as AgentApi.AgentPageParam;
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
    permission: 'orange-ai:agent:delete',
    label: 'opt.delete',
  },
]);
const detailRef = ref();
const optionsClick = (label: string, data: AgentApi.AgentVO) => {
  switch (label) {
    case 'large-model.agent.opt.demonstration': {
      const route = router.resolve(`${import.meta.env.VITE_CONTEXT}agent-ui/${data.id}`);
      window.open(route.href, '_blank');
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

const handleDelete = (data: AgentApi.AgentVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除智能体【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        AgentApi.deleteAgentById(data.id).then(() => {
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

const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);


const modelTypeList: Ref<AgentApi.AgentTypeVO[]> = ref([]);
const changePlatform = (item: any) => {
  modelTypeList.value =
    platformList.value.filter((p) => p.code === item)[0].modelTypes || [];
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

async function getPageData(params: AgentApi.AgentPageParam = {
  pageNo: 1,
  pageSize: 10,
}) {
  const queryParams: AgentApi.AgentPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await AgentApi.pageAgent(queryParams);
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

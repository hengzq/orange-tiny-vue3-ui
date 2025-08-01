<template>
  <div class="container-list">
    <tiny-form
      :model="filterOptions"
      label-position="right"
      label-width="110px"
      class="filter-form"
    >
      <tiny-row :flex="true">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.knowledge.base.embeddingModelId')" prop="embeddingModelId">
            <tiny-cascader
              v-model="filterOptions.embeddingModelId" :placeholder="$t('llm.knowledge.base.embeddingModelId.placeholder')"
              :options="modelList" :props="{ emitPath: false }" style="width: 100%"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('llm.knowledge.base.name')">
            <tiny-input
              v-model="filterOptions.name" clearable :placeholder="$t('llm.knowledge.base.name.placeholder')" @keyup.enter="handleFormQuery"/>
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
      <tiny-grid-column field="name" :title="$t('llm.knowledge.base.name')"/>
      <tiny-grid-column field="enabled" :title="$t('attribute.enabled.status')" align="center" width="90">
        <template #default="scope">
          <dict-tag :value="scope.row.enabled" :options="proxy.$dict.getDictData(proxy.$dict.SYS_DATA_ENABLE_STATUS)"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="embeddingModelId" :title="$t('llm.knowledge.base.embeddingModelId')" align="center">
        <template #default="scope">
          <template v-for="(modelItem) in modelList">
            <template v-for="(item, index) in modelItem.children">
              <tiny-tag v-if="item.value === scope.row.embeddingModelId" :key="item.value" :index="index">
                {{ modelItem.label }} / {{ item.label }}
              </tiny-tag>
            </template>
          </template>
        </template>
      </tiny-grid-column>

      <tiny-grid-column field="sort" :title="$t('attribute.sort')" align="center" width="100"/>
      <tiny-grid-column field="vectorCollectionName" :title="$t('llm.knowledge.base.vectorCollectionName')" align="center"/>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center"/>
      <tiny-grid-column field="description" show-overflow :title="$t('attribute.description')" width="150"/>
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
            :options="proxy.$hasPermission(optionsBtnFilter(scope.row))"
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

  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
</template>

<script lang="ts" setup>
import * as KnowledgeApi from '@/api/large-model/knowledge-base';
import {getCurrentInstance, reactive, Ref, ref, toRefs} from 'vue';
import EditForm from '@/views/large-model/knowledge/base/components/edit-form.vue';
import * as PlatformApi from "@/api/large-model/platform";
import * as ModelApi from "@/api/large-model/model";

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
  filterOptions: KnowledgeApi.KnowledgePageParam;
}>({
  loading: false,
  filterOptions: {} as KnowledgeApi.KnowledgePageParam,
});
const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const handleFormQuery = () => {
  gridTableRef?.value.handleFetch('reload', null);
};
const handleFormReset = () => {
  state.filterOptions = {} as KnowledgeApi.KnowledgePageParam;
  handleFormQuery();
};

const toolbarButtons = reactive<any[]>([
  {
    permission: 'orange-ai:knowledge:add',
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
    label: 'llm.knowledge.base.opt.management',
  },
  {
    label: 'opt.disabled',
  },
  {
    label: 'opt.enabled',
  },
  {
    permission: 'orange-ai:knowledge:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:knowledge:delete',
    label: 'opt.delete',
  },
]);


const optionsBtnFilter = (data: KnowledgeApi.KnowledgeVO) => {
  if (data.enabled) {
    return options.value.filter((item) => ['opt.disabled', 'llm.knowledge.base.opt.management', 'opt.edit', 'opt.delete'].includes(item.label))
  }
  return options.value.filter((item) => ['opt.enabled', 'llm.knowledge.base.opt.management', 'opt.edit', 'opt.delete'].includes(item.label))
}

const optionsClick = (label: string, data: KnowledgeApi.KnowledgeVO) => {
  switch (label) {
    case 'llm.knowledge.base.opt.management': {
      proxy.$router.push({
        path: `${import.meta.env.VITE_CONTEXT}large-model/knowledge-document/${data.id}`,
      });
      break;
    }
    case 'opt.disabled': {
      handleEnableDisable(data.id, false);
      break;
    }
    case 'opt.enabled': {
      handleEnableDisable(data.id, true);
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

const modelList: Ref<ModelApi.PlatformModelTree[]> = ref([])
const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    modelList.value = res.data.map((item: ModelApi.ModelVO) => ({'value': item.code, 'label': item.name}))
    queryModelList()
  });
};

const queryModelList = () => {
  ModelApi.listModel({
    modelType: 'EMBEDDING',
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


const handleEnableDisable = (id: string | undefined, enabled: boolean) => {
  if (!id) return;
  KnowledgeApi.updateKnowledgeEnabledById(id, enabled).then(() => {
    handleFormQuery();
    proxy.$modal.message({
      message: enabled ? '启用成功' : '禁用成功',
      status: 'success',
    });
  });
}

const handleDelete = (data: KnowledgeApi.KnowledgeVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除知识库【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        KnowledgeApi.deleteKnowledgeById(data.id).then(() => {
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
  api: ({page}: any) => {
    const {currentPage, pageSize} = page;
    return getPageData({
      pageNo: currentPage,
      pageSize,
    });
  },
});

async function getPageData(
  params: KnowledgeApi.KnowledgePageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: KnowledgeApi.KnowledgePageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await KnowledgeApi.pageKnowledge(queryParams);
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

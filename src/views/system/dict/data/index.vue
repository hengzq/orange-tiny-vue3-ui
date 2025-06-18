<template>
  <div class="container-list">
    <tiny-form :model="filterOptions" label-position="right" label-width="110px" class="filter-form">
      <tiny-row :flex="true" justify="center">
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.dict-data.dictType')">
            <tiny-select
              v-model="filterOptions.dictType"
              :placeholder="$t('system.dict-data.dictType.placeholder')"
              clearable
            >
              <tiny-option v-for="item in dictTypeOptions" :key="item.dictType" :label="item.name" :value="item.dictType"/>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('system.dict-data.dictLabel')">
            <tiny-input v-model="filterOptions.dictLabelLike" clearable :placeholder="$t('system.dict-data.dictLabel.placeholder')"/>
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
      :auto-resize="true"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" refresh full-screen/>
      </template>
      <tiny-grid-column type="selection" width="50"></tiny-grid-column>
      <tiny-grid-column field="dictLabel" :title="$t('system.dict-data.dictLabel')" align="center">
        <template #default="scope">
          <tiny-tag :color="scope.row.showStyle" style="color: #fff">
            {{ scope.row.dictLabel }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="dictValue" :title="$t('system.dict-data.dictValue')" align="center"/>
      <tiny-grid-column field="dictType" :title="$t('system.dict-data.dictType')" align="center">
        <template #default="scope">
          {{ scope.row.dictType }}
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="status" :title="$t('attribute.status')" align="center" width="80">
        <template #default="scope">
          <dict-tag
            :value="scope.row.enabled"
            :options="proxy.$dict.getDictData(proxy.$dict.SYS_DATA_ENABLE_STATUS)"
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="presetFlag"
        :title="$t('attribute.preset.status')"
        align="center"
        width="80"
      >
        <template #default="scope">
          <dict-tag :value="scope.row.preset" :options="proxy.$dict.getDictData(proxy.$dict.SYS_DATA_PRESET_STATUS)"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="description"
        show-overflow
        :title="$t('attribute.description')"
        width="260"
      />
      <tiny-grid-column
        field="createdAt"
        :title="$t('attribute.createdAt')"
        align="center"
        width="170"
      />

      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        width="100"
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
import * as DictTypeApi from '@/api/system/dict/type';
import * as DictDataApi from '@/api/system/dict/data';
import {getCurrentInstance, reactive, Ref, ref, toRaw, toRefs} from 'vue';
import EditForm from './components/edit-form.vue';

const {proxy} = getCurrentInstance() as any;

const dictTypeOptions: Ref<DictTypeApi.DictTypeVO[]> = ref([]);
const queryAll = (query: DictTypeApi.DictTypeListParam) => {
  DictTypeApi.listDictType(toRaw(query)).then((res) => {
    dictTypeOptions.value = res.data;
  });
};
queryAll({});

const state = reactive<{
  loading: boolean;
  filterOptions: DictDataApi.DictDataPageParam;
}>({
  loading: false,
  filterOptions: {
    dictType: proxy.$route.query.dictType || '',
  },
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
  params: DictDataApi.DictDataPageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: DictDataApi.DictDataPageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await DictDataApi.pageDictData(queryParams);
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
    permission: 'system:dict-data:update',
  },
  {
    label: 'opt.delete',
    permission: 'system:dict-data:delete',
  },
]);

const editFormRef = ref();

const optionsClick = (label: string, data: DictDataApi.DictDataVO) => {
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

const handleDelete = (data: DictDataApi.DictDataVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除字典【${data.dictLabel}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        DictDataApi.deleteDictDataById(data.id).then(() => {
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
  state.filterOptions = {} as DictDataApi.DictDataPageParam;
  handleFormQuery();
};

const toolbarButtons = reactive([
  {
    code: 'insert',
    name: '新增',
    permission: 'system:dict-data:add',
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
      editFormRef.value.open(null, proxy.$route.query.dictType);
      break;
    }
    case 'batchDelete': {
      editFormRef.value.open();
      break;
    }
    default:
      console.log('code is error.');
  }
};
</script>
s
<style scoped lang="less"></style>

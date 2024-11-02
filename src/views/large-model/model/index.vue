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
          <tiny-form-item
            :label="$t('large-model.model.platform')"
            prop="platform"
          >
            <tiny-select
              v-model="filterOptions.platform"
              @change="changePlatform"
            >
              <tiny-option
                v-for="item in platformList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </tiny-option>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.model.type')" prop="type">
            <tiny-select v-model="filterOptions.type">
              <tiny-option
                v-for="item in modelTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </tiny-option>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="4">
          <tiny-form-item :label="$t('large-model.model.name')">
            <tiny-input
              v-model="filterOptions.nameLike"
              clearable
              :placeholder="$t('large-model.model.name.placeholder')"
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
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar
          :buttons="proxy.$hasPermission(toolbarButtons)"
          full-screen

        />
      </template>
      <tiny-grid-column type="selection" width="60" />
      <tiny-grid-column
        field="platform"
        :title="$t('large-model.model.platform')"
      >
        <template #default="scope">
          <template v-for="(item, index) in platformList">
            <tiny-tag
              v-if="scope.row.platform == item.code"
              :key="item.code"
              :index="index"
              effect="dark"
            >
              {{ item.name }}
            </tiny-tag>
          </template>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="type" :title="$t('large-model.model.type')">
        <template #default="scope">
          <template v-for="(item, index) in allModelTypeList">
            <tiny-tag
              v-if="scope.row.type == item.code"
              :key="item.code"
              :index="index"
            >
              {{ item.name }}
            </tiny-tag>
          </template>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="name" :title="$t('large-model.model.name')" />
      <tiny-grid-column field="code" :title="$t('large-model.model.code')" />
      <tiny-grid-column
        field="enabled"
        :title="$t('attribute.enabled.status')"
        align="center"
        width="80"
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
        field="createdAt"
        :title="$t('attribute.createdAt')"
        align="center"
      />

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

  <detail ref="detailRef" />
  <edit-form ref="editFormRef" @ok="handleFormQuery"></edit-form>
</template>

<script lang="ts" setup>
  import * as PlatformApi from '@/api/large-model/platform';
  import * as ModelApi from '@/api/large-model/model';
  import { getCurrentInstance, reactive, Ref, ref, toRefs } from 'vue';
  import EditForm from './components/edit-form.vue';
  import Detail from './components/detail.vue';

  const { proxy } = getCurrentInstance() as any;

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
    filterOptions: ModelApi.ModelPageParam;
  }>({
    loading: false,
    filterOptions: {} as ModelApi.ModelPageParam,
  });
  const { loading, filterOptions } = toRefs(state);
  const gridTableRef = ref();

  const handleFormQuery = () => {
    gridTableRef?.value.handleFetch('reload', null);
  };
  const handleFormReset = () => {
    state.filterOptions = {} as ModelApi.ModelPageParam;
    handleFormQuery();
  };

  const toolbarButtons = reactive<any[]>([
    {
      permission: 'orange-ai:model:add',
      code: 'insert',
      name: '新增',
    },
  ]);
  const editFormRef = ref();
  const toolbarButtonClickEvent = ({ code }: any) => {
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
      label: 'opt.detail',
    },
    {
      permission: 'orange-ai:model:update',
      label: 'opt.edit',
    },
    {
      permission: 'orange-ai:model:delete',
      label: 'opt.delete',
    },
  ]);
  const detailRef = ref();
  const optionsClick = (label: string, data: ModelApi.ModelVO) => {
    switch (label) {
      case 'opt.detail': {
        detailRef.value.open(data.id);
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

  const handleDelete = (data: ModelApi.ModelVO) => {
    proxy.$modal
      .confirm({
        message: `确定要删除模型【${data.name}】吗?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          ModelApi.deleteModelById(data.id).then(() => {
            handleFormQuery();
            proxy.$modal.message({
              message: '删除成功',
              status: 'success',
            });
          });
        }
      });
  };
  const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);
  const allModelTypeList: Ref<ModelApi.ModelTypeVO[]> = ref([]);
  const queryPlatformList = () => {
    PlatformApi.listPlatform().then((res) => {
      platformList.value = res.data;
      platformList.value.forEach((item) => {
        if (item.modelTypes) {
          allModelTypeList.value = allModelTypeList.value.concat(
            item.modelTypes,
          );
        }
      });
      allModelTypeList.value = [
        ...new Set(allModelTypeList.value.map((item) => JSON.stringify(item))),
      ].map((str) => JSON.parse(str));
    });
  };
  queryPlatformList();

  const modelTypeList: Ref<ModelApi.ModelTypeVO[]> = ref([]);
  const changePlatform = (item: any) => {
    modelTypeList.value =
      platformList.value.filter((p) => p.code === item)[0].modelTypes || [];
  };

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
    params: ModelApi.ModelPageParam = {
      pageNo: 1,
      pageSize: 10,
    },
  ) {
    const queryParams: ModelApi.ModelPageParam = {
      ...filterOptions.value,
      ...params,
    };
    state.loading = true;
    try {
      const { data } = await ModelApi.pageModel(queryParams);
      const { records, total } = data;
      return {
        result: records,
        page: { total },
      };
    } finally {
      state.loading = false;
    }
  }
</script>

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
          <tiny-form-item :label="$t('system.menu.name')">
            <tiny-input v-model="filterOptions.nameLike" clearable :placeholder="$t('system.menu.name.placeholder')" @keyup.enter="handleFormQuery"/>
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
      :data="tableData"
      :loading="loading"
      :tree-config="{ children: 'children' }"
      :auto-resize="true"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar :buttons="proxy.$hasPermission(toolbarButtons)" full-screen/>
      </template>
      <tiny-grid-column field="index" width="50" tree-node></tiny-grid-column>
      <tiny-grid-column
        field="name"
        :title="$t('system.menu.name')"
      />
      <tiny-grid-column
        field="icon"
        :title="$t('system.menu.icon')"
        align="center"
        width="80"
      >
        <template #default="data">
          <svg-icon :name="data.row.icon"/>
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="permission"
        :title="$t('system.menu.permission')"
      />
      <tiny-grid-column
        field="path"
        :title="$t('system.menu.path')"
        show-overflow
      />
      <tiny-grid-column
        field="preset"
        :title="$t('attribute.preset.status')"
        align="center"
        width="80"
      >
        <template #default="scope">
          <dict-tag
            :value="scope.row.preset"
            :options="
              proxy.$dict.getDictData(proxy.$dict.SYS_DATA_PRESET_STATUS)
            "
          />
        </template>
      </tiny-grid-column>
      <tiny-grid-column
        field="hidden"
        :title="$t('system.menu.hidden')"
        align="center"
      >
        <template #default="scope">
          <dict-tag
            :value="scope.row.hidden"
            :options="
              proxy.$dict.getDictData(proxy.$dict.SYS_DATA_HIDDEN_STATUS)
            "
          />
        </template>
      </tiny-grid-column>

      <tiny-grid-column
        field="sort"
        :title="$t('attribute.sort')"
        align="center"
        width="90"
      />
      <tiny-grid-column
        field="updatedAt"
        :title="$t('attribute.updatedAt')"
        width="170"
      />
      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        width="165"
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
  <button-index ref="buttonIndexRef"></button-index>
</template>

<script lang="ts" setup>
import * as MenuApi from '@/api/system/menu';
import {getCurrentInstance, reactive, ref, toRefs} from 'vue';
import {listToTreeConverter} from '@/utils/tree';

import EditForm from './components/edit-form.vue';
import ButtonIndex from './components/button-index.vue';

const {proxy} = getCurrentInstance() as any;
const state = reactive<{
  loading: boolean;
  filterOptions: MenuApi.MenuListParam;
}>({
  loading: false,
  filterOptions: {} as MenuApi.MenuListParam,
});

const gridTableRef = ref();
const {loading, filterOptions} = toRefs(state);

const tableData = ref<MenuApi.MenuTreeVO[]>([]);

async function getAllData() {
  const queryParams: MenuApi.MenuListParam = {
    ...filterOptions.value,
  };
  state.loading = true;
  try {
    const {data} = await MenuApi.listMenu(queryParams);
    tableData.value = listToTreeConverter(data);
  } finally {
    state.loading = false;
  }
}

getAllData();

const options = ref([
  {
    label: 'system.button.opt.button-index',
  },
  {
    label: 'opt.edit',
    permission: 'system:menu:update',
  },
  {
    label: 'opt.delete',
    permission: 'system:menu:delete',
  },
]);

const editFormRef = ref();
const buttonIndexRef = ref();

const optionsClick = (label: string, data: MenuApi.MenuVO) => {
  switch (label) {
    case 'system.button.opt.button-index': {
      buttonIndexRef.value.open(data);
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

const handleDelete = (data: MenuApi.MenuVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除菜单【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        MenuApi.deleteMenuById(data.id).then(() => {
          getAllData();
          proxy.$modal.message({message: '删除成功', status: 'success'});
        });
      }
    });
};

const handleFormQuery = () => {
  getAllData();
};
const handleFormReset = () => {
  state.filterOptions = {} as MenuApi.MenuListParam;
  handleFormQuery();
};

const toolbarButtons = reactive([
  {
    code: 'insert',
    name: '新增',
    permission: 'system:menu:add',
  },
]);

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
</script>

<style scoped lang="less"></style>

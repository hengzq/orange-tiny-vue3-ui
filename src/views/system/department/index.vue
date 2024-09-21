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
          <tiny-form-item :label="$t('system.department.name')">
            <tiny-input
              v-model="filterOptions.nameLike"
              clearable
              :placeholder="$t('system.department.name.placeholder')"
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
      :data="tableData"
      class="table-list"
      :tree-config="{ children: 'children' }"
      :loading="loading"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar
          :buttons="proxy.$hasPermission(toolbarButtons)"
          full-screen
          :setting="{ simple: true }"
        />
      </template>
      <tiny-grid-column field="index" width="50" tree-node></tiny-grid-column>
      <tiny-grid-column
        field="name"
        :title="$t('system.department.name')"
        width="200"
      />
      <tiny-grid-column
        field="sort"
        :title="$t('attribute.sort')"
        align="center"
      />
      <tiny-grid-column
        field="createdAt"
        :title="$t('attribute.createdAt')"
        align="center"
        width="150"
      />
      <tiny-grid-column
        field="description"
        show-overflow
        :title="$t('attribute.description')"
        width="260"
      />

      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length !== 0"
        :title="$t('table.operations')"
        align="center"
        width="100"
      >
        <template #default="scope">
          <tiny-action-menu
            :max-show-num="2"
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
  import * as DepartmentApi from '@/api/system/department';
  import { getCurrentInstance, reactive, Ref, ref } from 'vue';
  import { listToTreeConverter } from '@/utils/tree';
  import EditForm from './components/edit-form.vue';

  const { proxy } = getCurrentInstance() as any;

  const loading: Ref<boolean> = ref(true);
  const filterOptions: Ref<DepartmentApi.DepartmentListParam> = ref({});

  const handleFormQuery = () => {
    queryDepartmentList();
  };
  const handleFormReset = () => {
    filterOptions.value = {};
    handleFormQuery();
  };

  const toolbarButtons = reactive<any[]>([
    {
      permission: ['system:permission:department:add'],
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
      permission: 'system:permission:department:edit',
      label: 'opt.edit',
    },
    {
      permission: 'system:permission:department:delete',
      label: 'opt.delete',
    },
  ]);
  const optionsClick = (
    label: string,
    data: DepartmentApi.DepartmentTreeVO,
  ) => {
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

  const handleDelete = (data: DepartmentApi.DepartmentTreeVO) => {
    proxy.$modal
      .confirm({
        message: `确定要删除部门【${data.name}】吗?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          DepartmentApi.deleteDepartmentById(data.id).then(() => {
            queryDepartmentList();
            proxy.$modal.message({
              message: '删除成功',
              status: 'success',
            });
          });
        }
      });
  };

  const tableData: Ref<DepartmentApi.DepartmentTreeVO[]> = ref([]);

  async function queryDepartmentList() {
    const queryParams: DepartmentApi.DepartmentListParam = {
      ...filterOptions.value,
    };
    loading.value = true;
    try {
      const { data } = await DepartmentApi.listDepartment(queryParams);
      tableData.value = listToTreeConverter(data);
    } finally {
      loading.value = false;
    }
  }

  queryDepartmentList();
</script>

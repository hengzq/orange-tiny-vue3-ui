<template>
  <tiny-drawer :title="title" :visible="visible" width="48%" @close="onClose()">
    <tiny-form
      ref="formDataRef"
      class="tiny-drawer-body-form"
      label-position="left"
      :model="formData"
      label-width="100px"
      validate-position="bottom"
      :display-only="true"
      validate-type="text"
    >
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('system.menu.name')" prop="name">
            <tiny-input v-model="formData.name"></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item
            :label="$t('system.menu.permission')"
            prop="permission"
          >
            <tiny-input v-model="formData.permission"></tiny-input>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
    </tiny-form>

    <tiny-grid
      ref="gridTableRef"
      max-height="730px"
      :data="tableData"
      :loading="loading"
      :auto-resize="true"
      :edit-config="{ trigger: 'manual', mode: 'row', autoClear: false }"
      @toolbar-button-click="toolbarButtonClickEvent"
    >
      <template #toolbar>
        <tiny-grid-toolbar
          :buttons="proxy.$hasPermission(toolbarButtons)"
          full-screen
        />
      </template>
      <tiny-grid-column type="selection" width="50"></tiny-grid-column>
      <tiny-grid-column
        field="name"
        :title="$t('system.button.name')"
        width="100"
        :editor="{ component: 'input' }"
      />
      <tiny-grid-column
        field="permission"
        :title="$t('system.button.permission')"
        width="260"
        :editor="{ component: 'input' }"
      />
      <tiny-grid-column
        field="sort"
        :title="$t('attribute.sort')"
        align="center"
        width="90"
        :editor="{ component: 'input' }"
      />
      <tiny-grid-column
        field="remark"
        show-overflow
        :title="$t('attribute.remark')"
        :editor="{ component: 'input' }"
      />

      <tiny-grid-column
        v-if="proxy.$hasPermission(options).length > 0"
        :title="$t('table.operations')"
        align="center"
        width="120"
      >
        <template #default="scope">
          <template v-if="gridTableRef && gridTableRef.hasActiveRow(scope.row)">
            <tiny-action-menu
              :max-show-num="3"
              :spacing="8"
              :options="saveOptions"
              @item-click="
                (data: any) => saveOptionsClick(data.itemData.label, scope.row)
              "
            >
              <template #item="{ data }">
                <span> {{ $t(data.label) }} </span>
              </template>
            </tiny-action-menu>
          </template>
          <template v-else>
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
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import * as MenuApi from '@/api/system/menu';
  import * as ButtonApi from '@/api/system/button';
  import { computed, getCurrentInstance, reactive, ref, toRaw } from 'vue';

  const { proxy } = getCurrentInstance() as any;
  const emit = defineEmits(['ok']);

  const visible = ref(false);
  const title = computed(() => {
    return '按钮列表';
  });

  const menuId = ref<string>();

  const gridTableRef = ref();
  const loading = ref(false);
  const tableData = ref<ButtonApi.ButtonVO[]>([]);

  async function getAllData(
    params: ButtonApi.ButtonListParam = {
      menuId: menuId.value,
    },
  ) {
    const queryParams: ButtonApi.ButtonListParam = {
      ...params,
    };
    loading.value = true;
    try {
      const { data } = await ButtonApi.listButton(queryParams);
      tableData.value = data;
    } finally {
      loading.value = false;
    }
  }

  const options = ref([
    {
      label: 'opt.edit',
      permission: 'system:button:update'
    },
    {
      label: 'opt.delete',
      permission: 'system:button:delete'
    },
  ]);

  const saveOptions = ref([
    {
      label: 'opt.save',
    },
    {
      label: 'opt.cancel',
    },
  ]);

  const optionsClick = (label: string, data: ButtonApi.ButtonVO) => {
    switch (label) {
      case 'opt.edit': {
        gridTableRef?.value.setActiveRow(data);
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

  const saveOptionsClick = (label: string, data: ButtonApi.ButtonVO) => {
    switch (label) {
      case 'opt.save': {
        onSubmit(data);
        break;
      }
      case 'opt.cancel': {
        gridTableRef?.value.clearActived();
        break;
      }
      default:
        console.log('code is error.');
    }
  };

  const onSubmit = (data: ButtonApi.ButtonVO) => {
    if (data.id) {
      ButtonApi.updateButtonById(data.id, toRaw(data)).then(() => {
        proxy.$modal.message({ message: '修改成功', status: 'success' });
        gridTableRef?.value.clearActived();
      });
    } else {
      data.menuId = menuId.value || '';
      ButtonApi.addButton(toRaw(data)).then(() => {
        proxy.$modal.message({ message: '创建成功', status: 'success' });
        getAllData();
      });
    }
  };

  const handleDelete = (data: ButtonApi.ButtonVO) => {
    proxy.$modal
      .confirm({
        message: `确定要删除按钮【${data.name}】吗?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          ButtonApi.deleteButtonById(data.id).then(() => {
            getAllData();
            proxy.$modal.message({ message: '删除成功', status: 'success' });
          });
        }
      });
  };

  const toolbarButtons = reactive([
    {
      code: 'insert',
      name: '新增',
      permission: 'system:button:update'
    },
  ]);

  const toolbarButtonClickEvent = ({ code, $grid }: any) => {
    switch (code) {
      case 'insert': {
        proxy.$refs.gridTableRef.insert({}).then((res: any) => {
          proxy.$refs.gridTableRef.setActiveRow(res.row);
        });
        break;
      }
      default:
        console.log('code is error.');
    }
  };

  const onClose = () => {
    visible.value = false;
  };

  const formData = ref<MenuApi.MenuVO>({});
  const open = (data: MenuApi.MenuVO) => {
    formData.value = data;
    visible.value = true;
    menuId.value = data.id;
    getAllData();
  };

  defineExpose({
    open,
  });
</script>

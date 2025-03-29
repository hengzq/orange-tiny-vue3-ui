<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      width="48%"
      class="allot-resource-drawer"
      @close="onClose"
  >
    <tiny-form
        ref="formDataRef"
        class="tiny-drawer-body-form"

        :model="formData"
        label-width="110px"
        validate-position="bottom"
        :display-only="true"
        validate-type="text"
    >
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('system.role.name')" prop="name">
            <tiny-input
                v-model="formData.name"
                :placeholder="$t('system.role.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item
              :label="$t('system.role.permission')"
              prop="permission"
          >
            <tiny-input
                v-model="formData.permission"
                :placeholder="$t('system.role.permission.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
    </tiny-form>

    <tiny-grid
        ref="gridTableRef"
        max-height="750px"
        :data="tableDataTree"
        :loading="loading"
        :tree-config="{ children: 'children' }"
        :auto-resize="true"
        :select-config="{ checkStrictly: true }"
    >
      <tiny-grid-column field="index" width="30" tree-node></tiny-grid-column>
      <tiny-grid-column type="selection" width="40"></tiny-grid-column>
      <tiny-grid-column
          field="name"
          :title="$t('system.menu.name')"
          width="120"
      />
      <tiny-grid-column
          field="permission"
          :title="$t('system.menu.permission')"
      >
        <template #default="scope">
          <tiny-checkbox-group>
            <tiny-checkbox
                v-for="item in scope.row.buttons"
                :key="item.id"
                v-model="checkedButtonIds"
                :label="item.id"
                @change="(it: any) => checkedButton(it, scope.row.id)"
            >
              {{ item.name }}
            </tiny-checkbox>
          </tiny-checkbox-group>
        </template>
      </tiny-grid-column>
    </tiny-grid>

    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, ref} from 'vue';
import * as PermissionApi from '@/api/system/permission';
import * as RoleApi from '@/api/system/role';
import * as MenuApi from '@/api/system/menu';
import * as ButtonApi from '@/api/system/button';

import {listToTreeConverter} from '@/utils/tree';

const {proxy} = getCurrentInstance() as any;
const visible = ref(false);

const checkedButtonIds = ref([]);

const title = computed(() => {
  return '分配菜单权限';
});

const tableDataTree = ref<MenuApi.MenuTreeVO[]>([]);
// 用于勾选
const tableDataList = ref<MenuApi.MenuTreeVO[]>([]);

const loading = ref(false);

async function getMenuData() {
  loading.value = true;
  try {
    const {data} = await MenuApi.listMenu({
      showButton: true,
    });
    tableDataTree.value = listToTreeConverter(data);
    tableDataList.value = data;
  } finally {
    loading.value = false;
  }
}

const checkedButton = (checked: boolean, menuId: string) => {
  if (checked) {
    let menus =
        proxy.$refs.gridTableRef.getSelectRecords() as MenuApi.MenuVO[];
    let menuIds = menus.map((item) => item.id) as string[];
    if (menuIds.length === 0 || !menuIds.includes(menuId)) {
      proxy.$refs.gridTableRef.setSelection(
          tableDataList.value.filter((item) => menuId === item.id),
          true,
      );
    }
  }
};

const formData = ref<RoleApi.RoleVO>({
  name: '',
});

const onSubmit = () => {
  let menus = proxy.$refs.gridTableRef.getSelectRecords() as MenuApi.MenuVO[];

  const form: PermissionApi.AssignResourcesToOneRole = {
    roleId: formData.value.id || '',
    menuIds: menus.map((item) => item.id) as string[],
    buttonIds: checkedButtonIds.value,
  };
  PermissionApi.assignResourcesToOneRole(form)
      .then((res) => {
        onClose();
        loading.value = false;
        proxy.$modal.message({message: '分配资源成功', status: 'success'});
      })
      .catch((err) => {
        loading.value = false;
      });
};

const onClose = () => {
  visible.value = false;
  checkedButtonIds.value = [];
  proxy.$refs.gridTableRef.clearSelection();
};

const open = (id: string) => {
  RoleApi.getRoleById(id, {
    showMenu: true,
    showButton: true,
  }).then((res) => {
    formData.value = res.data;
    const {menus, buttons} = res.data;
    const menuIds = menus.map((item: MenuApi.MenuVO) => item.id);
    if (menuIds) {
      proxy.$refs.gridTableRef.setSelection(
          tableDataList.value.filter((item) => menuIds.includes(item.id)),
          true,
      );
    }
    checkedButtonIds.value = buttons.map(
        (item: ButtonApi.ButtonVO) => item.id,
    );
  });
  getMenuData();
  visible.value = true;
};

defineExpose({
  open,
});
</script>

<style lang="less" scoped>
.allot-resource-drawer {
  // 隐藏drawer body的滚动条
  :deep(.tiny-drawer__main .tiny-drawer__box .tiny-drawer__body) {
    overflow: hidden;
  }
}
</style>

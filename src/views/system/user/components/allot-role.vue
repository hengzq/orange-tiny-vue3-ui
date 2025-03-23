<template>
  <div>
    <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      @close="onClose"
    >
      <tiny-form
        ref="formDataRef"
        class="tiny-drawer-body-form"
        label-position="left"
        :model="formData"
        label-width="110px"
        validate-position="bottom"
        validate-type="text"
      >
        <tiny-form-item label="用户名称">
          <tiny-input v-model="formData.name" disabled></tiny-input>
        </tiny-form-item>
        <tiny-form-item label="登陆账号">
          <tiny-input v-model="formData.loginAccount" disabled></tiny-input>
        </tiny-form-item>
        <tiny-form-item label="角色">
          <tiny-select
            v-model="roleIds"
            value-field="id"
            multiple
            text-field="name"
            render-type="grid"
            :grid-op="gridOp"
            placeholder="请选择角色"
          ></tiny-select>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
        <tiny-button @click="onClose">取消</tiny-button>
      </template>
    </tiny-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { getCurrentInstance, reactive, ref } from 'vue';
  import * as PermissionApi from '@/api/system/permission';
  import * as RoleApi from '@/api/system/role';
  import * as UserApi from '@/api/system/user';

  const { proxy } = getCurrentInstance() as any;
  const visible = ref(false);
  const title = '分配角色';

  const formData = ref<UserApi.UserVO>({});

  const roleIds = ref([]);

  const gridOp = reactive({
    data: [],
    columns: [
      { type: 'selection', title: '', width: 60 },
      { field: 'name', title: '角色名称' },
      { field: 'permission', title: '权限编码' },
    ],
  });
  const getAllRole = async () => {
    const { data } = await RoleApi.listRole({});
    gridOp.data = data;
  };
  const onSubmit = () => {
    let params: PermissionApi.AssignRolesToOneUserParam = {
      userId: formData.value.id || '',
      roleIds: roleIds.value,
    };
    PermissionApi.assignRolesToOneUser(params)
      .then((res) => {
        onClose();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onClose = () => {
    formData.value = {};
    visible.value = false;
  };

  const open = async (id: string) => {
    if (id) {
      await UserApi.getUserById(id, { showRole: true }).then((res) => {
        let data = res.data as UserApi.UserDetailVO;
        formData.value = data;
        roleIds.value = data.roles?.map((item) => item.id) as [];
      });
      getAllRole();
    }
    visible.value = true;
  };

  defineExpose({
    open,
  });
</script>

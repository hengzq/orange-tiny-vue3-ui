<template>
  <tiny-drawer
    :title="title"
    :visible="visible"
    :show-footer="true"
    @close="onClose(false)"
  >
    <tiny-form
      ref="formDataRef"
      class="tiny-drawer-body-form"
      label-position="left"
      :rules="formDataRules"
      :model="formData"
      label-width="110px"
      validate-position="bottom"
      validate-type="text"
    >
      <tiny-form-item :label="$t('system.role.name')" prop="name">
        <tiny-input
          v-model="formData.name"
          :placeholder="$t('system.role.name.placeholder')"
        ></tiny-input>
      </tiny-form-item>
      <tiny-form-item
        :label="$t('system.role.permission')"
        prop="permission"
      >
        <tiny-input
          v-model="formData.permission"
          :placeholder="$t('system.role.permission.placeholder')"
        ></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('attribute.enabled.status')" prop="enabled">
        <tiny-radio
          v-for="(item, index) in proxy.$dict.getDictData(
            proxy.$dict.SYS_DATA_ENABLE_STATUS,
          )"
          :key="index"
          v-model="formData.enabled"
          :label="item.dictValue == 'true'"
        >
          {{ item.dictLabel }}
        </tiny-radio>
      </tiny-form-item>
      <tiny-form-item :label="$t('attribute.sort')" prop="sort">
        <tiny-numeric v-model="formData.sort"></tiny-numeric>
      </tiny-form-item>
      <tiny-form-item :label="$t('attribute.remark')" prop="remark">
        <tiny-input
          v-model="formData.remark"
          :placeholder="$t('attribute.remark.placeholder')"
          type="textarea"
          :maxlength="500"
          :rows="5"
          show-word-limit
        >
        </tiny-input>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import * as RoleApi from '@/api/system/role';
  import { computed, getCurrentInstance, ref, toRaw } from 'vue';

  const { proxy } = getCurrentInstance() as any;

  const emit = defineEmits(['ok']);
  const visible = ref(false);
  const isModify = ref(false);
  const title = computed(() => {
    return isModify.value ? '修改角色' : '新增角色';
  });

  const formData = ref<RoleApi.RoleVO>({
    enabled: true,
    sort: 1,
  });

  const formDataRules = {
    name: [{ required: true, message: '角色名称不能为空', trigger: 'change' }],
    permission: [
      { required: true, message: '权限编码不能为空', trigger: 'change' },
    ],
  };

  const onSubmit = () => {
    proxy.$refs.formDataRef.validate((valid: boolean) => {
      if (valid) {
        if (formData.value.id) {
          RoleApi.updateRoleById(formData.value.id, toRaw(formData.value)).then(
            () => {
              proxy.$modal.message({ message: '修改成功', status: 'success' });
              onClose(true);
            },
          );
        } else {
          RoleApi.addRole(toRaw(formData.value)).then(() => {
            proxy.$modal.message({ message: '创建成功', status: 'success' });
            onClose(true);
          });
        }
      }
    });
  };

  const onClose = (refresh?: boolean) => {
    visible.value = false;
    if (refresh) {
      emit('ok');
    }
  };

  const open = (id: string) => {
    isModify.value = false;
    proxy.$refs.formDataRef.resetFields();
    if (id) {
      RoleApi.getRoleById(id).then((response) => {
        formData.value = response.data;
        isModify.value = true;
      });
    }
    visible.value = true;
  };
  defineExpose({
    open,
  });
</script>

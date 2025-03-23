<template>
  <tiny-drawer
    :title="title"
    :visible="visible"
    :show-footer="true"
    width="45%"
    @close="onClose"
  >
    <tiny-form
      class="tiny-drawer-body-form"
      label-position="left"
      :display-only="true"
      :model="formData"
      label-width="110px"
    >
      <tiny-form-item :label="$t('system.log.operation.requestId')">
        <tiny-input v-model="formData.requestId" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.status')">
        <dict-tag
          :value="formData.status"
          :options="proxy.$dict.getDictData('sys_operation_status')"
        />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.login.userName')">
        <tiny-input v-model="formData.userName" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.login.loginTime')">
        <tiny-input v-model="formData.loginTime" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.login.userIp')">
        <tiny-input v-model="formData.userIp" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.login.address')">
        <tiny-input v-model="formData.userLocation" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.userAgent')">
        <tiny-input v-model="formData.userAgent" type="textarea" />
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="onClose">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import { getCurrentInstance, ref } from 'vue';
  import * as LoginLogApi from '@/api/system/log/login';

  const { proxy } = getCurrentInstance() as any;
  const visible = ref(false);
  const title = '详情';

  const formData = ref<LoginLogApi.LoginLogVO>({});

  const onClose = () => {
    visible.value = false;
  };

  const open = (id: string) => {
    LoginLogApi.getLoginLogById(id).then((response) => {
      formData.value = response.data;
    });
    visible.value = true;
  };

  defineExpose({
    open,
  });
</script>

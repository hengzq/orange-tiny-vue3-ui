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
      label-width="100px"
    >
      <tiny-form-item :label="$t('system.log.operation.requestId')">
        <tiny-input v-model="formData.requestId" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.resourceId')">
        <tiny-input v-model="formData.resourceId" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.resourceName')">
        <tiny-input v-model="formData.resourceName" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.requestMethod')">
        <tiny-input v-model="formData.requestMethod" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.requestUrl')">
        <tiny-input v-model="formData.requestUrl" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.status')">
        <dict-tag
          :value="formData.status"
          :options="proxy.$dict.getDictData('sys_operation_status')"
        />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.userName')">
        <tiny-input v-model="formData.userName" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.startTime')">
        <tiny-input v-model="formData.startTime" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.duration')">
        <tiny-input v-model="formData.duration" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.userIp')">
        <tiny-input v-model="formData.userIp" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.address')">
        <tiny-input v-model="formData.userLocation" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.userAgent')">
        <tiny-input v-model="formData.userAgent" type="textarea" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.javaMethod')">
        <tiny-input v-model="formData.javaMethod" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.javaMethodArgs')">
        <div style="font-size: 12px">
          {{ formData.javaMethodArgs }}
        </div>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.log.operation.result')">
        <div v-if="formData.javaMethodResult" style="font-size: 12px">
          {{ formData.javaMethodResult }}
        </div>
        <div v-else>
          {{ formData.stackTrace }}
        </div>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="onClose">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import * as OperationLogApi from '@/api/system/log/operation';
  import { getCurrentInstance, ref } from 'vue';

  const { proxy } = getCurrentInstance() as any;
  const visible = ref(false);
  const title = '详情';
  const formData = ref<OperationLogApi.OperationLogVO>({});

  const onClose = () => {
    visible.value = false;
  };

  const open = (id: string) => {
    OperationLogApi.getOperationLogById(id).then((response) => {
      formData.value = response.data;
      formData.value.duration = `${response.data.duration} ms`;
      formData.value.javaMethodArgs = JSON.stringify(
        JSON.parse(formData.value.javaMethodArgs || ''),
        null,
        '  \t',
      );
      // console.log(formData.value.javaMethodArgs)
      if (formData.value.javaMethodResult) {
        formData.value.javaMethodResult = JSON.stringify(
          JSON.parse(formData.value.javaMethodResult || ''),
          null,
          '  \t',
        );
      }
    });
    visible.value = true;
  };

  defineExpose({
    open,
  });
</script>

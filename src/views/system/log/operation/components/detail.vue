<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="45%" @close="onClose">
    <tiny-form class="tiny-drawer-body-form" label-position="left" :display-only="true" :model="formData"
      label-width="100px">
      <tiny-form-item :label="$t('system.record.operation.form.traceId')">
        <tiny-input v-model="formData.traceId"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.resourceId')">
        <tiny-input v-model="formData.resourceId"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.requestURL')">
        {{ formData.requestMethod }} {{ formData.requestUrl }}
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.status')">
        <dict-tag :value="formData.status" :options="proxy.$dict.getDict('sys_common_operation_status')" />
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.userName')">
        <tiny-input v-model="formData.userName"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.startTime')">
        <tiny-input v-model="formData.startTime"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.executeTime')">
        {{ formData.executeTime }} ms
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.address')">
        {{ formData.userLocation }} [{{ formData.userIp }}]
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.userAgent')">
        <tiny-input v-model="formData.userAgent"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.javaMethod')">
        <tiny-input v-model="formData.javaMethod"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.javaMethodArgs')">
        <tiny-input v-model="formData.javaMethodArgs" type="textarea"
          :autosize="{ minRows: 5, maxRows: 10 }"></tiny-input>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.record.operation.form.result')">
        <tiny-input v-if="formData.javaMethodResult" v-model="formData.javaMethodResult" type="textarea"
          :autosize="{ minRows: 5, maxRows: 15 }"> </tiny-input>
        <tiny-input v-else v-model="formData.stackTrace" type="textarea"
          :autosize="{ minRows: 5, maxRows: 15 }"></tiny-input>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="onClose">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import SystemRequest from '@/api/system/index'

const { proxy } = getCurrentInstance() as any
const visible = ref(false)
const title = '详情'
const formData = ref<SystemRecordAPI.RecordOperationVO>({})

const onClose = () => {
  visible.value = false
}

const open = (id: string) => {
  SystemRequest.recordOperation.getRecordOperationById(id).then((response) => {
    formData.value = response.data
    formData.value.javaMethodArgs = JSON.stringify(
      JSON.parse(formData.value.javaMethodArgs || ''),
      null,
      '\t'
    )
    if (formData.value.javaMethodResult) {
      formData.value.javaMethodResult = JSON.stringify(
        JSON.parse(formData.value.javaMethodResult || ''),
        null,
        '\t'
      )
    }
  })
  visible.value = true
}

defineExpose({
  open
})
</script>
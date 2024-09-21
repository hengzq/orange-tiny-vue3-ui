<template>
  <div>
    <tiny-drawer :title="title" :visible="visible" :show-footer="true" @close="onClose">
      <tiny-form ref="formDataRef" class="tiny-drawer-body-form" label-position="left" :model="requestParams"
        :rules="formDataRules" label-width="100px" validate-position="bottom" validate-type="text">
        <tiny-form-item label="用户名称">
          <tiny-input v-model="formData.name" disabled></tiny-input>
        </tiny-form-item>
        <tiny-form-item label="密码" prop="newPassword">
          <tiny-input v-model="requestParams.newPassword" type="password" show-password></tiny-input>
        </tiny-form-item>
        <tiny-form-item label="确认密码" prop="confirmPassword">
          <tiny-input v-model="requestParams.confirmPassword" type="password" show-password></tiny-input>
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
import SystemRequest from '@/api/system/index'

const { proxy } = getCurrentInstance() as any
const visible = ref(false)
const title = '重置密码'

const formData = ref<SystemPermissionAPI.UserVO>({})

const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(value)) {
    callback(new Error('至少包含一个大写字母，一个小写字母和一个数字'))
  } else if (requestParams.value.newPassword != '' && requestParams.value.confirmPassword != ''
    && requestParams.value.newPassword != requestParams.value.confirmPassword) {
    callback(new Error('新密码和确认密码不一致'))
  } else {
    callback()
  }
}

const formDataRules = {
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'change' },
    { min: 6, trigger: 'blur', message: '必须至少为6个字符' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'change' },
    { min: 6, trigger: 'blur', message: '必须至少为6个字符' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}


const requestParams = ref<SystemPermissionAPI.ResetPasswordRequest>({
  userId: '',
  newPassword: '',
  confirmPassword: ''
})

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      requestParams.value.userId = formData.value.id || ''
      SystemRequest.user.resetUserPassword(toRaw(requestParams.value))
        .then((res) => {
          proxy.$modal.message({ message: '重置密码成功', status: 'success' });
          onClose()
        })
        .catch((err) => { console.log(err) })
    }
  })
}

const onClose = () => {
  formData.value = {}
  visible.value = false
}

const open = async (id: string) => {
  if (id) {
    await SystemRequest.user.getUserById(id).then((response) => {
      let user = response.data as SystemPermissionAPI.UserVO
      formData.value = user
    })
  }
  visible.value = true
}

defineExpose({
  open
})
</script>
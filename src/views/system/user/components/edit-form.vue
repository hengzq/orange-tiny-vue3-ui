<template>
  <div>
    <tiny-drawer
        :title="title"
        :visible="visible"
        :show-footer="true"
        @close="onClose(false)"
    >
      <tiny-form
          ref="formDataRef"
          class="tiny-drawer-body-form"
          :rules="formDataRules"
          :model="formData"
          label-width="110px"
          validate-position="bottom"
          validate-type="text"
      >
        <tiny-form-item
            :label="$t('system.user.department')"
            prop="departmentIds"
        >
          <tiny-select
              v-model="formData.departmentIds"
              value-field="id"
              text-field="name"
              render-type="tree"
              multiple
              :tree-op="treeOp"
              :placeholder="$t('system.department.parentId.placeholder')"
          ></tiny-select>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.user.name')" prop="name">
          <tiny-input v-model="formData.name"></tiny-input>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.user.email')" prop="email">
          <tiny-input v-model="formData.email"></tiny-input>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.user.gender')" prop="gender">
          <tiny-radio
              v-for="(item, index) in proxy.$dict.getDictData('sys_user_gender')"
              :key="index"
              v-model="formData.gender"
              :label="item.dictValue"
          >{{ item.dictLabel }}
          </tiny-radio>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.user.phone')" prop="phone">
          <tiny-input v-model="formData.phone"></tiny-input>
        </tiny-form-item>
        <tiny-form-item
            :label="$t('system.user.loginAccount')"
            prop="loginAccount"
        >
          <tiny-input v-model="formData.loginAccount"></tiny-input>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
        <tiny-button @click="onClose(false)">取消</tiny-button>
      </template>
    </tiny-drawer>
  </div>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user';
import * as DepartmentApi from '@/api/system/department';
import {computed, getCurrentInstance, reactive, ref, toRaw} from 'vue';
import {listToTreeConverter} from '@/utils/tree';

const emit = defineEmits(['ok']);

const {proxy} = getCurrentInstance() as any;

const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改用户' : '新增用户';
});

const formData = ref<UserApi.AddUserParam>({
  gender: 'MALE',
});

const formDataRules = {
  departmentIds: [
    {required: true, message: '请选择部门', trigger: 'change'},
  ],
  name: [{required: true, message: '用户昵称不能为空', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        UserApi.updateUserById(formData.value.id, toRaw(formData.value)).then(
            (res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              onClose(true);
            },
        );
      } else {
        UserApi.addUser(toRaw(formData.value)).then((res) => {
          proxy.$modal.message({message: '创建成功', status: 'success'});
          onClose(true);
        });
      }
    }
  });
};

const onClose = (refresh: boolean) => {
  visible.value = false;
  formData.value = {};
  if (refresh) {
    emit('ok');
  }
};

const treeOp = reactive<{
  checkStrictly: boolean;
  data: DepartmentApi.DepartmentTreeVO[];
}>({
  checkStrictly: true,
  data: [],
});

const queryAll = (query: DepartmentApi.DepartmentListParam) => {
  DepartmentApi.listDepartment(toRaw(query)).then((res) => {
    treeOp.data = listToTreeConverter(res.data);
  });
};

const open = (id: string) => {
  isModify.value = false;
  proxy.$refs.formDataRef.resetFields();
  if (id) {
    UserApi.getUserById(id).then((response) => {
      formData.value = response.data;
      isModify.value = true;
    });
  }
  queryAll({});
  visible.value = true;
};

defineExpose({
  open,
});
</script>

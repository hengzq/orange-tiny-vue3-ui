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
            :label="$t('system.department.parentId')"
            prop="parentId"
        >
          <tiny-select
              v-model="formData.parentId"
              value-field="id"
              text-field="name"
              render-type="tree"
              :tree-op="treeOp"
              :placeholder="$t('system.department.parentId.placeholder')"
          ></tiny-select>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.department.name')" prop="name">
          <tiny-input
              v-model="formData.name"
              :placeholder="$t('system.department.name.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item :label="$t('attribute.sort')" prop="sort">
          <tiny-numeric v-model="formData.sort"></tiny-numeric>
        </tiny-form-item>
        <tiny-form-item
            :label="$t('system.department.description')"
            prop="description"
        >
          <tiny-input
              v-model="formData.description"
              :placeholder="$t('system.department.description.placeholder')"
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
  </div>
</template>

<script lang="ts" setup>
import * as DepartmentApi from '@/api/system/department';
import {computed, getCurrentInstance, reactive, ref, toRaw} from 'vue';
import {listToTreeConverter} from '@/utils/tree';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改部门' : '新增部门';
});

const formData = ref<DepartmentApi.DepartmentVO>({
  parentId: '-1',
  sort: 1,
});

const formDataRules = {
  parentId: [
    {required: true, message: '上级部门不能为空', trigger: 'change'},
  ],
  name: [{required: true, message: '部门名称不能为空', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        DepartmentApi.updateDepartmentById(
            formData.value.id,
            toRaw(formData.value),
        )
            .then((res) => {
              proxy.$modal.message({message: '修改成功', status: 'success'});
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
      } else {
        DepartmentApi.addDepartment(toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({message: '创建成功', status: 'success'});
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
      }
    }
  });
};

const onClose = (refresh: boolean) => {
  visible.value = false;
  if (refresh) {
    emit('ok');
  }
};

const treeOp = reactive<{
  data: [
    {
      id: string;
      name: string;
      children: DepartmentApi.DepartmentTreeVO[];
    },
  ];
}>({
  data: [
    {
      id: '-1',
      name: '根节点',
      children: [],
    },
  ],
});

const queryAll = (query: DepartmentApi.DepartmentListParam) => {
  DepartmentApi.listDepartment(toRaw(query)).then((res) => {
    treeOp.data[0].children = listToTreeConverter(res.data);
  });
};

const open = (id: string) => {
  isModify.value = false;
  proxy.$refs.formDataRef.resetFields();
  if (id) {
    DepartmentApi.getDepartmentById(id).then((res) => {
      formData.value = res.data;
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

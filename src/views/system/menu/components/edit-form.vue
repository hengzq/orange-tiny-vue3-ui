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
        <tiny-form-item :label="$t('system.menu.name')" prop="name">
          <tiny-input
            v-model="formData.name"
            :placeholder="$t('system.menu.name.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item
          :label="$t('system.menu.permission')"
          prop="permission"
        >
          <tiny-input
            v-model="formData.permission"
            :placeholder="$t('system.menu.permission.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item label="可见状态" prop="hidden">
          <tiny-radio
            v-for="(item, index) in proxy.$dict.getDictData(
              proxy.$dict.SYS_DATA_HIDDEN_STATUS,
            )"
            :key="index"
            v-model="formData.hidden"
            :label="item.dictValue == 'true'"
          >
            {{ item.dictLabel }}
          </tiny-radio>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.menu.icon')" prop="icon">
          <tiny-input
            v-model="formData.icon"
            :placeholder="$t('system.menu.icon.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item :label="$t('system.menu.path')" prop="path">
          <tiny-input
            v-model="formData.path"
            :placeholder="$t('system.menu.path.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item :label="$t('attribute.sort')" prop="sort">
          <tiny-numeric v-model="formData.sort"></tiny-numeric>
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
  import * as MenuApi from '@/api/system/menu';
  import { computed, getCurrentInstance, reactive, ref, toRaw } from 'vue';
  import { listToTreeConverter } from '@/utils/tree';

  const { proxy } = getCurrentInstance() as any;
  const emit = defineEmits(['ok']);

  const visible = ref(false);
  const isModify = ref(false);
  const title = computed(() => {
    return isModify.value ? '修改菜单' : '新增菜单';
  });

  const formData = ref<MenuApi.MenuVO>({
    hidden: false,
    sort: 1,
  });

  const formDataRules = {
    parentId: [
      { required: true, message: '上级菜单不能为空', trigger: 'change' },
    ],
    name: [{ required: true, message: '菜单名称不能为空', trigger: 'change' }],
    permission: [
      { required: true, message: '权限编码不能为空', trigger: 'change' },
    ],
  };

  const onSubmit = () => {
    proxy.$refs.formDataRef.validate((valid: boolean) => {
      if (valid) {
        if (formData.value.id) {
          MenuApi.updateMenuById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({ message: '修改成功', status: 'success' });
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          MenuApi.addMenu(toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({ message: '创建成功', status: 'success' });
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
    formData.value = {};
    if (refresh) {
      emit('ok');
    }
  };

  const treeOp = reactive<{
    data: [
      {
        id: string;
        name: string;
        children: MenuApi.MenuTreeVO[];
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

  const queryAll = (query: MenuApi.MenuListParam) => {
    MenuApi.listMenu(toRaw(query)).then((res) => {
      treeOp.data[0].children = listToTreeConverter(res.data);
    });
  };

  const open = (id: string) => {
    isModify.value = false;
    proxy.$refs.formDataRef.resetFields();
    if (id) {
      MenuApi.getMenuById(id).then((response) => {
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

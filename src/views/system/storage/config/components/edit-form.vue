<template>
  <tiny-drawer
      :title="title"
      :visible="visible"
      :show-footer="true"
      @close="onClose(false)"
  >
    <tiny-form
        ref="formDataRef" class="tiny-drawer-body-form"  :rules="formDataRules" :model="formData"
        label-width="110px" validate-position="bottom" validate-type="text">
      <tiny-form-item :label="$t('system.storage-config.name')" prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('system.storage-config.name.placeholder')"/>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.storage-config.mode')" prop="mode">
        <tiny-select v-model="formData.mode">
          <tiny-option v-for="item in storageModeList" :key="item.code" :label="item.name" :value="item.code"/>
        </tiny-select>
      </tiny-form-item>
      <tiny-form-item :label="$t('system.storage-config.master')" prop="master">
        <tiny-radio v-model="formData.master" :label="true">是</tiny-radio>
        <tiny-radio v-model="formData.master" :label="false">否</tiny-radio>
      </tiny-form-item>
      <tiny-form-item :label="$t('attribute.description')" prop="description">
        <tiny-input
            v-model="formData.description" :placeholder="$t('attribute.description.placeholder')" type="textarea" :maxlength="500" :rows="5"
            show-word-limit/>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import * as StorageConfigApi from '@/api/system/storage/config';
import * as StorageModeApi from '@/api/system/storage/mode';
import {computed, getCurrentInstance, Ref, ref, toRaw} from 'vue';

const {proxy} = getCurrentInstance() as any;

const emit = defineEmits(['ok']);
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改配置' : '新增配置';
});

const formData = ref<StorageConfigApi.StorageConfigVO>({
  master: false,
});

const formDataRules = {
  name: [
    {required: true, message: '配置名称不能为空', trigger: 'change'}
  ],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        StorageConfigApi.updateStorageConfigById(
            formData.value.id,
            toRaw(formData.value),
        ).then(() => {
          proxy.$modal.message({message: '修改成功', status: 'success'});
          onClose(true);
        });
      } else {
        StorageConfigApi.addStorageConfig(toRaw(formData.value)).then(() => {
          proxy.$modal.message({message: '创建成功', status: 'success'});
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
const storageModeList: Ref<StorageModeApi.StorageModeVO[]> = ref([]);
const queryStorageModeList = () => {
  StorageModeApi.listStorageMode().then((res) => {
    storageModeList.value = res.data;
  });
};

const open = (id: string) => {
  isModify.value = false;
  proxy.$refs.formDataRef.resetFields();
  if (id) {
    StorageConfigApi.getStorageConfigById(id).then((response) => {
      formData.value = response.data;
      isModify.value = true;
    });
  }
  queryStorageModeList();
  visible.value = true;
};
defineExpose({
  open,
});
</script>

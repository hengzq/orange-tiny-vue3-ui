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
        label-position="left"
        :rules="formDataRules"
        :model="formData"
        label-width="110px"
        validate-position="bottom"
        validate-type="text"
      >
        <tiny-form-item
          :label="$t('system.dict-data.dictType')"
          prop="dictType"
        >
          <tiny-select
            v-model="formData.dictType"
            :placeholder="$t('system.dict-data.dictType.placeholder')"
          >
            <tiny-option
              v-for="item in dictTypeOptions"
              :key="item.dictType"
              :label="item.name"
              :value="item.dictType"
            >
            </tiny-option>
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item
          :label="$t('system.dict-data.dictLabel')"
          prop="dictLabel"
        >
          <tiny-input
            v-model="formData.dictLabel"
            :placeholder="$t('system.dict-data.dictLabel.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item
          :label="$t('system.dict-data.dictValue')"
          prop="dictValue"
        >
          <tiny-input
            v-model="formData.dictValue"
            :placeholder="$t('system.dict-data.dictValue.placeholder')"
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
        <tiny-form-item
          :label="$t('system.dict-data.showStyle')"
          prop="showStyle"
        >
          <tiny-input
            v-model="formData.showStyle"
            type="color"
            :placeholder="$t('system.dict-data.showStyle.placeholder')"
          ></tiny-input>
        </tiny-form-item>
        <tiny-form-item
          :label="$t('attribute.description')"
          prop="description"
        >
          <tiny-input
            v-model="formData.description"
            :placeholder="$t('attribute.description.placeholder')"
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
  import { computed, getCurrentInstance, Ref, ref, toRaw } from 'vue';
  import * as DictTypeApi from '@/api/system/dict/type';
  import * as DictDataApi from '@/api/system/dict/data';

  const emit = defineEmits(['ok']);

  const { proxy } = getCurrentInstance() as any;

  const visible = ref(false);
  const isModify = ref(false);
  const title = computed(() => {
    return isModify.value ? '修改字典类型' : '新增字典类型';
  });

  const formData = ref<DictDataApi.DictDataVO>({
    enabled: true,
    showStyle: '#67c23a',
  });

  const formDataRules = {
    dictType: [
      { required: true, message: '字典类型不能为空', trigger: 'change' },
    ],
    dictLabel: [
      { required: true, message: '字典名称不能为空', trigger: 'change' },
    ],
    dictValue: [
      { required: true, message: '字典值不能为空', trigger: 'change' },
    ],
  };

  const onSubmit = () => {
    proxy.$refs.formDataRef.validate((valid: boolean) => {
      if (valid) {
        if (formData.value.id) {
          DictDataApi.updateDictDataById(
            formData.value.id,
            toRaw(formData.value),
          )
            .then((res) => {
              proxy.$modal.message({ message: '修改成功', status: 'success' });
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          DictDataApi.addDictData(toRaw(formData.value))
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

  const dictTypeOptions: Ref<DictTypeApi.DictTypeVO[]> = ref([]);
  const queryAllDictType = (query: DictTypeApi.DictTypeListParam) => {
    DictTypeApi.listDictType(toRaw(query)).then((res) => {
      dictTypeOptions.value = res.data;
    });
  };

  const onClose = (refresh: boolean) => {
    visible.value = false;
    formData.value = {};
    if (refresh) {
      emit('ok');
    }
  };

  const open = (id: string, dictType: string) => {
    isModify.value = false;
    proxy.$refs.formDataRef.resetFields();
    if (id) {
      DictDataApi.getDictDataById(id).then((res) => {
        formData.value = res.data;
        isModify.value = true;
      });
    }
    formData.value.dictType = dictType;
    visible.value = true;
    queryAllDictType({});
  };

  defineExpose({
    open,
  });
</script>

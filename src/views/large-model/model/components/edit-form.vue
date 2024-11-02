<template>
  <tiny-drawer
    :title="title"
    :visible="visible"
    :show-footer="true"
    width="65%"
    @close="onClose(false)"
  >
    <tiny-form
      ref="formDataRef"
      label-position="left"
      :rules="formDataRules"
      :model="formData"
      label-width="100px"
      validate-position="bottom"
      validate-type="text"
    >
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item
            :label="$t('large-model.model.platform')"
            prop="platform"
          >
            <tiny-select
              v-model="formData.platform"
              :disabled="isModify"
              @change="changePlatform"
            >
              <tiny-option
                v-for="item in platformList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </tiny-option>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('large-model.model.type')" prop="type">
            <tiny-select v-model="formData.type" :disabled="isModify">
              <tiny-option
                v-for="item in modelTypeList"
                :key="item.code"
                :label="item.name"
                :value="item.code"
              >
              </tiny-option>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('large-model.model.name')" prop="name">
            <tiny-input
              v-model="formData.name"
              :placeholder="$t('large-model.model.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('large-model.model.code')" prop="code">
            <tiny-input
              v-model="formData.code"
              :placeholder="$t('large-model.model.code.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item
            :label="$t('attribute.enabled.status')"
            prop="enabled"
          >
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
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('attribute.sort')" prop="sort">
            <tiny-numeric v-model="formData.sort"></tiny-numeric>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
      <tiny-form-item
        :label="$t('large-model.model.description')"
        prop="description"
      >
        <md-editor v-model="formData.description" :preview="false" />
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import { MdEditor } from 'md-editor-v3';
  import 'md-editor-v3/lib/style.css';
  import * as PlatformApi from '@/api/large-model/platform';
  import * as ModelApi from '@/api/large-model/model';
  import { computed, getCurrentInstance, Ref, ref, toRaw } from 'vue';

  const emit = defineEmits(['ok']);
  const { proxy } = getCurrentInstance() as any;
  const visible = ref(false);
  const isModify = ref(false);
  const title = computed(() => {
    return isModify.value ? '修改模型' : '新增模型';
  });

  const formData = ref<ModelApi.ModelVO>({});

  const formDataRules = {
    platform: [
      { required: true, message: '所属平台不能为空', trigger: 'change' },
    ],
    type: [{ required: true, message: '模型类型不能为空', trigger: 'change' }],
    name: [{ required: true, message: '模型名称不能为空', trigger: 'change' }],
    code: [{ required: true, message: '模型编码不能为空', trigger: 'change' }],
  };

  const onSubmit = () => {
    proxy.$refs.formDataRef.validate((valid: boolean) => {
      if (valid) {
        if (formData.value.id) {
          ModelApi.updateModelById(formData.value.id, toRaw(formData.value))
            .then((res) => {
              proxy.$modal.message({ message: '修改成功', status: 'success' });
              onClose(true);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          ModelApi.addModel(toRaw(formData.value))
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
    if (refresh) {
      emit('ok');
    }
  };

  const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);
  const modelTypeList: Ref<ModelApi.ModelTypeVO[]> = ref([]);

  const queryPlatformList = () => {
    PlatformApi.listPlatform().then((res) => {
      platformList.value = res.data;
    });
  };

  const changePlatform = (item: any) => {
    modelTypeList.value =
      platformList.value.filter((p) => p.code === item)[0].modelTypes || [];
    if (formData.value.type && !isModify.value) {
      formData.value.type = '';
    }
  };

  const resetForm = () => {
    formData.value = {
      enabled: true,
      sort: 1,
    };
    proxy.$refs.formDataRef.resetFields();
  };

  const open = (id: string) => {
    isModify.value = false;
    resetForm();
    if (id) {
      ModelApi.getModelById(id).then((res) => {
        formData.value = res.data;
        isModify.value = true;
        changePlatform(res.data.platform);
      });
    }
    queryPlatformList();
    visible.value = true;
  };

  defineExpose({
    open,
  });
</script>

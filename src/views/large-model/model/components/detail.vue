<template>
  <tiny-drawer
    :title="title"
    :visible="visible"
    :show-footer="true"
    width="60%"
    @close="onClose(false)"
  >
    <tiny-form
      ref="formDataRef"
      label-position="left"
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
              disabled="true"
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
            <tiny-select v-model="formData.type" disabled="true">
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
              disabled="true"
              :placeholder="$t('large-model.model.name.placeholder')"
            ></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('large-model.model.code')" prop="code">
            <tiny-input
              v-model="formData.code"
              disabled="true"
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
              disabled="true"
              :label="item.dictValue == 'true'"
            >
              {{ item.dictLabel }}
            </tiny-radio>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('attribute.sort')" prop="sort">
            <tiny-numeric
              disabled="true"
              v-model="formData.sort"
            ></tiny-numeric>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
      <tiny-form-item
        :label="$t('large-model.model.description')"
        prop="description"
      >
        <md-preview
          v-model="formData.description"
          style="border: 1px solid #dfe1e6; height: 500px; overflow-y: hidden"
        />
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
  import { MdPreview } from 'md-editor-v3';
  import 'md-editor-v3/lib/style.css';
  import * as PlatformApi from '@/api/large-model/platform';
  import * as ModelApi from '@/api/large-model/model';
  import { computed, getCurrentInstance, Ref, ref, shallowRef } from 'vue';

  const emit = defineEmits(['ok']);
  const { proxy } = getCurrentInstance() as any;
  const visible = ref(false);
  const title = computed(() => {
    return '查看详情';
  });

  const formData = ref<ModelApi.ModelVO>({});

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
  };

  const resetForm = () => {
    formData.value = {
      enabled: true,
      sort: 1,
    };
    proxy.$refs.formDataRef.resetFields();
  };

  const open = (id: string) => {
    resetForm();
    if (id) {
      ModelApi.getModelById(id).then((res) => {
        formData.value = res.data;
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

<template>
  <div class="container-list">
    <tiny-layout>
      <tiny-row>
        <tiny-col :span="3">
          <tiny-form
            ref="formDataRef"
            class="tiny-drawer-body-form"
            label-position="top"
            :rules="formDataRules"
            :model="formData"
            validate-position="bottom"
            label-width="100px"
            validate-type="text"
          >
            <tiny-form-item
              :label="$t('large-model.model.platform')"
              prop="platform"
            >
              <tiny-select v-model="formData.platform" @change="changePlatform">
                <tiny-option
                  v-for="item in platformList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </tiny-option>
              </tiny-select>
            </tiny-form-item>
            <tiny-form-item
              :label="$t('large-model.model.type')"
              prop="modelCode"
            >
              <tiny-select v-model="formData.modelCode">
                <tiny-option
                  v-for="item in filterModelList"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                >
                </tiny-option>
              </tiny-select>
            </tiny-form-item>
            <tiny-form-item
              :label="$t('large-model.image.prompt')"
              prop="prompt"
            >
              <tiny-input
                v-model="formData.prompt"
                :placeholder="$t('large-model.image.prompt.placeholder')"
                type="textarea"
                :maxlength="500"
                :rows="5"
                show-word-limit
              >
              </tiny-input>
            </tiny-form-item>
          </tiny-form>
          <tiny-button type="primary" @click="onSubmit">生成图片</tiny-button>
        </tiny-col>
        <tiny-col :span="9">
          <div v-for="(item, index) in imageList" :key="index">
            <tiny-divider content-position="left" border-style="dashed">
              {{ item.createdAt }}
            </tiny-divider>
            <div>
              {{ item.prompt }}
            </div>
            <tiny-image
              v-for="(url, ind) in item.urls"
              :key="ind"
              class="text-to-image"
              :src="url"
              :preview-src-list="item.urls"
              :z-index="3000"
            ></tiny-image>
          </div>
        </tiny-col>
      </tiny-row>
    </tiny-layout>
  </div>
</template>

<script lang="ts" setup>
  import * as TextToImageApi from '@/api/large-model/text-to-image';
  import { getCurrentInstance, Ref, ref, toRaw } from 'vue';
  import * as PlatformApi from '@/api/large-model/platform';
  import * as ModelApi from '@/api/large-model/model';

  const { proxy } = getCurrentInstance() as any;

  const formData = ref<TextToImageApi.TextToImageVO>({});

  const formDataRules = {
    platform: [
      { required: true, message: '所属平台不能为空', trigger: 'change' },
    ],
    modelCode: [{ required: true, message: '模型不能为空', trigger: 'change' }],
    prompt: [{ required: true, message: '提示词不能为空', trsigger: 'change' }],
  };

  const onSubmit = () => {
    proxy.$refs.formDataRef.validate((valid: boolean) => {
      if (valid) {
        TextToImageApi.generateImage(toRaw(formData.value))
          .then((res) => {
            getPageData();
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);
  const queryPlatformList = () => {
    PlatformApi.listPlatform().then((res) => {
      platformList.value = res.data;
      const defaultCode = platformList.value[0]?.code;
      if (defaultCode) {
        formData.value.platform = defaultCode;
      }
    });
  };
  queryPlatformList();

  const filterModelList: Ref<ModelApi.ModelVO[]> = ref([]);
  const changePlatform = (item: any) => {
    filterModelList.value = modelList.value.filter((p) => p.platform === item);
    if (formData.value.modelCode) {
      formData.value.modelCode = '';
    }
  };

  const modelList: Ref<ModelApi.ModelVO[]> = ref([]);
  const queryModelList = () => {
    ModelApi.listModel({
      type: 'TEXT_TO_IMAGE',
      enabled: true,
    }).then((res) => {
      modelList.value = res.data;
      if (formData.value.platform) {
        changePlatform(formData.value.platform);
        formData.value.modelCode = filterModelList.value[0].code;
      }
    });
  };
  queryModelList();

  const imageList: Ref<TextToImageApi.TextToImageVO[]> = ref([]);
  const getPageData = () => {
    const queryParams: TextToImageApi.TextToImagePageParam = {
      pageNo: 1,
      pageSize: 10,
    };
    try {
      TextToImageApi.pageTextToImage(queryParams).then((res) => {
        imageList.value = res.data.records;
      });
    } finally {
      console.log('...');
    }
  };
  getPageData();
</script>

<style lang="less" scoped>
  .text-to-image {
    width: 350px;
    height: 350px;
    margin-right: 10px;
    border-radius: 10px;
  }
</style>

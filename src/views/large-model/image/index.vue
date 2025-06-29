<template>
  <div class="container-list">
    <tiny-row>
      <tiny-col :span="3">
        <div class="left-form">
          <tiny-form
            ref="formDataRef" class="tiny-drawer-body-form" label-position="top" :rules="formDataRules" :model="formData"
            validate-position="bottom" label-width="110px" validate-type="text"
          >
            <tiny-form-item :label="$t('large-model.model.platform')" prop="platform">
              <tiny-select v-model="formData.platform" @change="changePlatform">
                <tiny-option v-for="item in platformList" :key="item.code" :label="item.name" :value="item.code"/>
              </tiny-select>
            </tiny-form-item>
            <tiny-form-item :label="$t('large-model.model.llm')" prop="modelId">
              <tiny-select v-model="formData.modelId">
                <tiny-option v-for="item in filterModelList" :key="item.id" :label="item.name" :value="item.id"/>
              </tiny-select>
            </tiny-form-item>
            <tiny-form-item :label="$t('large-model.image.prompt')" prop="prompt">
              <tiny-input
                v-model="formData.prompt" :placeholder="$t('large-model.image.prompt.placeholder')"
                type="textarea" :maxlength="500" :rows="5" show-word-limit/>
            </tiny-form-item>
            <tiny-form-item :label="$t('large-model.image.quantity')" prop="quantity">
              <tiny-numeric v-model="formData.quantity" :min="1" :max="4" circulate></tiny-numeric>
            </tiny-form-item>
            <tiny-form-item :label="$t('large-model.image.resolution')" prop="quantity">
              <tiny-select v-model="formData.resolution" :placeholder="$t('large-model.image.resolution.placeholder')" clearable>
                <tiny-option
                  v-for="item in proxy.$dict.getDictData('ai_image_resolution')" :key="item.dictValue" :label="item.dictLabel"
                  :value="item.dictValue"/>
              </tiny-select>
            </tiny-form-item>
          </tiny-form>

          <tiny-button type="primary" style="height: 38px;width: 100%" @click="onSubmit">生成图片</tiny-button>
        </div>
      </tiny-col>
      <tiny-col :span="9">
        <div class="image-list">
          <div v-for="(item, index) in imageList" :key="index">
            <tiny-divider content-position="left" border-style="dashed">
              {{ item.createdAt }}
            </tiny-divider>
            <div>
              {{ item.prompt }}
            </div>
            <tiny-image
              v-for="(url, ind) in item.urls" :key="ind" class="image-item" :src="url" :preview-src-list="item.urls"
              :z-index="3000"/>
          </div>
        </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
import * as TextToImageApi from '@/api/large-model/text-to-image';
import {getCurrentInstance, Ref, ref} from 'vue';
import * as PlatformApi from '@/api/large-model/platform';
import * as ModelApi from '@/api/large-model/model';
import {getToken} from "@/utils/auth";

const {proxy} = getCurrentInstance() as any;

const formData = ref<TextToImageApi.TextToImageVO>({
  quantity: 1,
  resolution: '1024*1024'
});

const formDataRules = {
  platform: [
    {required: true, message: '所属平台不能为空', trigger: 'change'},
  ],
  modelCode: [{required: true, message: '模型不能为空', trigger: 'change'}],
  prompt: [{required: true, message: '提示词不能为空', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      const {resolution} = formData.value;
      const params: TextToImageApi.TextToImageVO = {
        ...formData.value,
        width: Number(resolution?.split("*")[0]),
        height: Number(resolution?.split("*")[1])
      }
      TextToImageApi.generateImage(params)
        .then((res) => {
          getPageData();
        })
    }
  });
};

const platformList: Ref<PlatformApi.PlatformVO[]> = ref([]);
const queryPlatformList = () => {
  PlatformApi.listPlatform({modelType: 'TEXT_TO_IMAGE'}).then((res) => {
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
    modelType: 'TEXT_TO_IMAGE',
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
  imageList.value = []
  TextToImageApi.pageTextToImage(queryParams).then((res) => {
    res.data.records.forEach((item: TextToImageApi.TextToImageVO) => {
      item.urls = item.urls?.map(url => {
        return `${url}?orange-token=${getToken()}`;
      })
      imageList.value.push(item)
    })
  });
};
getPageData();
</script>

<style lang="less" scoped>
.image-list {
  height: calc(100vh - 150px);
  overflow-y: auto;

  .image-item {
    width: 350px;
    height: 350px;
    margin-right: 10px;
    border-radius: 10px;
  }
}

:deep(.tiny-col) {
  padding: 0;
}

.left-form {
  background-color: #fff;
  padding: 15px;
  height: calc(100vh - 150px)
}


</style>

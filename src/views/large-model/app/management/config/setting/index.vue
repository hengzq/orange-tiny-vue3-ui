<template>
  <div class="setting">
    <tiny-row>
      <tiny-col :span="5" class="left-col">
        <tiny-form
          ref="formDataRef" :rules="formDataRules" :model="formData" label-position="top" label-width="110px"
          validate-position="bottom" validate-type="text">
          <tiny-form-item prop="modelId">
            <template #label>
              <div class="ai-model-label">
                {{ $t('large-model.agent.modelId') }}
                <tiny-button type="text" @click="setModelConfig(formData)" :disabled="!formData.modelId">参数设置</tiny-button>
              </div>
            </template>
            <tiny-cascader
              v-model="formData.modelId" :options="modelList" :props="{ emitPath: false }" @change="handleUpdateApp"
              style="width: 100%"/>
          </tiny-form-item>

          <tiny-form-item :label="$t('large-model.agent.systemPrompt')" prop="systemPrompt">
            <tiny-input
              v-model="formData.systemPrompt" type="textarea" :autosize="{ minRows: 5 }" :maxlength="5000" show-word-limit
              :placeholder="$t('large-model.agent.systemPrompt.placeholder')" @change="handleUpdateApp"/>
          </tiny-form-item>

          <tiny-form-item prop="baseIds">
            <template #label>
              <div class="ai-model-label">
                {{ $t('large-model.agent.baseIds') }}
                <tiny-button @click="setKnowledgeBase" :disabled="!formData.modelId" type="text">
                  <svg-icon name="system-add"/>
                  添加
                </tiny-button>
              </div>
            </template>

            <div class="list">
              <div v-for="(item,index) in formData.baseList" :key="index" class="list-item">
                <span> {{ item.name }}</span>
                <div class="right-btn">
                  <tiny-button type="text" @click="handleDeleteKnowledgeBase(item.id)">
                    <svg-icon name="system-trash"/>
                  </tiny-button>
                </div>
              </div>
            </div>
          </tiny-form-item>

          <tiny-form-item prop="mcpServerId">
            <template #label>
              <div class="ai-model-label">
                {{ $t('large-model.agent.mcp-server') }}
                <tiny-button type="text" @click="setMcpServer(formData)" :disabled="!formData.modelId">
                  <svg-icon name="system-add"/>
                  添加
                </tiny-button>
              </div>
            </template>
            <div class="list">
              <div v-for="(item,index) in formData.mcpServerList" :key="index" class="list-item">
                <span> {{ item.name }}</span>
                <div class="right-btn">
                  <tiny-button type="text" @click="handleDeleteMcpServer(item.id)">
                    <svg-icon name="system-trash"/>
                  </tiny-button>
                </div>
              </div>
            </div>
          </tiny-form-item>

        </tiny-form>
      </tiny-col>
      <tiny-col :span="7" class="right-col">
        <conversation-index ref="conversationIndexRef" :app="app"/>
      </tiny-col>
    </tiny-row>

    <model-config-index ref="modelConfigRef"/>
    <knowledge-base-index ref="knowledgeBaseRef" @select="selectKnowledgeBase"/>
    <mcp-server-index ref="mcpServerRef" @select="selectMcpServer"/>
  </div>
</template>

<script lang="ts" setup>
import * as PlatformApi from '@/api/large-model/platform';
import {computed, defineProps, getCurrentInstance, onMounted, PropType, Ref, ref, toRaw, watch} from 'vue';
import * as ModelApi from "@/api/large-model/model";
import * as KnowledgeBaseApi from "@/api/large-model/knowledge-base";
import * as McpServerApi from "@/api/large-model/mcp-server";
import * as AppApi from "@/api/large-model/app";

import ConversationIndex from './components/conversation/index.vue';
import ModelConfigIndex from './components/model-config/index.vue';
import McpServerIndex from './components/mcp-server/index.vue'
import KnowledgeBaseIndex from './components/knowledge-base/index.vue'

const emit = defineEmits(['save']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const title = computed(() => {
  return isModify.value ? '修改智能体' : '新增智能体';
});


const props = defineProps({
  app: {
    type: Object as PropType<AppApi.AppVO>,
    required: true
  }
});

// 监听 app 的变化,处理 app 响应慢问题
watch(
  () => props.app,
  (newApp, oldApp) => {
    updateForm()
  },
  {deep: true, immediate: false}
);

onMounted(() => {
  // 模型供应商
  queryPlatformList();
  updateForm()
});

const updateForm = () => {
  if (props.app.latestVersion) {
    if (props.app.latestVersion.modelId) {
      formData.value.modelId = props.app.latestVersion.modelId;
    }
    if (props.app.latestVersion.systemPrompt) {
      formData.value.systemPrompt = props.app.latestVersion.systemPrompt;
    }
    if (props.app.latestVersion.baseIds) {
      formData.value.baseIds = props.app.latestVersion.baseIds;
      queryKnowledgeBaseList(formData.value.baseIds)
    }
    if (props.app.latestVersion.mcpIds) {
      formData.value.mcpIds = props.app.latestVersion.mcpIds;
      queryMcpServerList(formData.value.mcpIds)
    }
  }
}

const formData = ref<AppApi.EditAppVO>({});

const formDataRules = {
  name: [{required: true, message: '模型名称不能为空', trigger: 'change'}],
  modelId: [{required: true, message: '请选择模型', trigger: 'change'}],
};

const modelConfigRef = ref()
const setModelConfig = (item: AppApi.AppVO) => {
  modelConfigRef.value.open(item.latestVersion?.modelConfig)
}


const handleUpdateApp = () => {
  if (!props.app?.id) {
    return
  }
  AppApi.updateAppById(props.app.id, toRaw(formData.value))
    .then((res) => {
      emit('save');
    })
}


const onClose = (refresh: boolean) => {
  visible.value = false;
  if (refresh) {
    emit('refresh');
  }
};

const modelList: Ref<ModelApi.PlatformModelTree[]> = ref([])
const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    modelList.value = res.data.map((item: ModelApi.ModelVO) => ({'value': item.code, 'label': item.name}))
    queryModelList()
  });
};

const queryModelList = () => {
  ModelApi.listModel({
    modelType: 'CHAT',
    enabled: true,
  }).then((res) => {
    const models = res.data.map((item: ModelApi.ModelVO) => ({'value': item.id, 'label': item.name, 'platform': item.platform}))
    modelList.value.forEach(item => {
      item.children = models.filter((model: ModelApi.ModelVO) => model.platform === item.value)
    })
    // 过滤掉没有模型的供应商
    modelList.value = modelList.value.filter(item => item.children && item.children.length > 0)
  });
};


const knowledgeBaseRef = ref()
const setKnowledgeBase = () => {
  knowledgeBaseRef.value.open(formData.value.baseIds);
}

const selectKnowledgeBase = (baseList: KnowledgeBaseApi.KnowledgeVO[]) => {
  if (!baseList) {
    return
  }
  formData.value.baseList = baseList;
  formData.value.baseIds = baseList.map(item => item.id);
  handleUpdateApp()
}

//  查询知识库
const queryKnowledgeBaseList = (baseIds: string[]) => {
  if (!baseIds?.length) {
    return;
  }

  KnowledgeBaseApi.listKnowledge({
    ids: baseIds
  }).then((res) => {
    formData.value.baseList = res.data
  })
}
const handleDeleteKnowledgeBase = (id: string) => {
  formData.value.baseIds = formData.value.baseIds.filter(item => item !== id);
  handleUpdateApp()
}

const mcpServerRef = ref();
const setMcpServer = () => {
  mcpServerRef.value.open(formData.value.mcpIds)
}

const selectMcpServer = (mcpServerList: McpServerApi.McpServerVO[]) => {
  if (!mcpServerList) {
    return
  }
  formData.value.mcpServerList = mcpServerList
  formData.value.mcpIds = mcpServerList.map(item => item.id) as string[]
  handleUpdateApp()
}

const queryMcpServerList = (mcpIds: string[]) => {
  if (!mcpIds?.length) {
    return;
  }
  McpServerApi.listMcpServer({
    ids: mcpIds
  }).then((res) => {
    formData.value.mcpServerList = res.data
  })
}
const handleDeleteMcpServer = (id: string) => {
  formData.value.mcpIds = formData.value.mcpIds?.filter(item => item !== id);
  handleUpdateApp()
}

</script>

<style scoped lang="less">
@import '../config.less';

.ai-model-label {
  display: inline-flex;
  justify-content: space-between;
  width: 98%;
}

.list-item {
  display: flex;
  justify-content: space-between;
  background-color: #fafafa;
  color: #26244c;
  height: 35px;
  line-height: 35px;
  margin: 6px 12px;
  padding: 0 5px 0 20px;
  border-radius: 6px;
  font-size: 13px;

  .right-btn {
    padding-right: 10px;
  }
}

.list-item :deep(.tiny-button.tiny-button--text:not(.is-only-icon):not(.is-icon)) {
  color: #26244ca6;
}

</style>
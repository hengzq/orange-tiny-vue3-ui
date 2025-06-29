<template>
  <div class="container-list">
    <tiny-row>
      <tiny-col :span="3">
        <div class="left-form">
          <tiny-form
            ref="formDataRef"
            class="tiny-drawer-body-form"
            label-position="top"
            :rules="formDataRules"
            :model="formData"
            validate-position="bottom"
            label-width="110px"
            validate-type="text"
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
            <tiny-form-item :label="$t('large-model.model.systemPrompt')" prop="systemPrompt">
              <tiny-input
                v-model="formData.systemPrompt" type="textarea" :autosize="{ minRows: 5 }" :maxlength="5000" show-word-limit
                :placeholder="$t('large-model.agent.systemPrompt.placeholder')"/>
            </tiny-form-item>
            <tiny-form-item :label="$t('large-model.model.config.temperature')">
              <tiny-slider v-model="formData.temperature" :show-input="true" :min="0" :max="1" :step="0.01" unit=""></tiny-slider>
            </tiny-form-item>
          </tiny-form>


          <!--          <tiny-divider content-position="center">对话记录</tiny-divider>-->
          <!--          <div class="chat-session">-->
          <!--            <tiny-button class="chat-session-add" type="primary" @click="addChatSession">新加对话</tiny-button>-->
          <!--            <tiny-grid-->
          <!--              ref="gridTableRef"-->
          <!--              :data="tableData"-->
          <!--              :show-header="false"-->
          <!--              highlight-current-row-->
          <!--              max-height="100%"-->
          <!--              @current-change="handleCurrentChange"-->
          <!--            >-->
          <!--              <tiny-grid-column field="name" show-overflow/>-->
          <!--              <tiny-grid-column v-if="proxy.$hasPermission(options).length !== 0" :title="$t('table.operations')" align="center" width="60">-->
          <!--                <template #default="scope">-->
          <!--                  <tiny-action-menu :max-show-num="0" :options="options" @item-click="(data: any) => optionsClick(data.itemData.label, scope.row)">-->
          <!--                    <template #item="{ data }">-->
          <!--                      <span> {{ $t(data.label) }} </span>-->
          <!--                    </template>-->
          <!--                  </tiny-action-menu>-->
          <!--                </template>-->
          <!--              </tiny-grid-column>-->
          <!--            </tiny-grid>-->
          <!--          </div>-->
        </div>
      </tiny-col>
      <tiny-col :span="9">
        <chat-index ref="chatIndexRef" :conversation-param="formData" @refresh="queryChatSession" @validate="submitValidate"/>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script lang="ts" setup>
import {getCurrentInstance, Ref, ref} from 'vue';
import * as PlatformApi from '@/api/large-model/platform';
import * as ModelApi from '@/api/large-model/model';
import * as ChatApi from '@/api/large-model/chat';
import * as SessionApi from '@/api/large-model/session';

import ChatIndex from './components/chat-index.vue';

const {proxy} = getCurrentInstance() as any;

const formDataRules = {
  platform: [
    {required: true, message: '请选择大模型供应商', trigger: 'change'},
  ],
  modelId: [
    {required: true, message: '请选择大模型', trigger: 'change'},
  ],
};

const formData = ref<ChatApi.ConversationParam>({
  temperature: 0.85,
});
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
    modelType: 'CHAT',
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

const chatIndexRef = ref('chatIndexRef');

const addChatSession = () => {
  formData.value.sessionId = '';
  chatIndexRef.value.addChatSession();
};
const gridTableRef = ref('gridTableRef');
const tableData: Ref<SessionApi.SessionVO[]> = ref([]);
const queryChatSession = (
  params: SessionApi.SessionListParam = {},
  selectedFirst = false,
) => {
  const queryParams = {
    'sessionType': 'CHAT_EXPERIENCE',
    ...params,
  };
  SessionApi.listSession(queryParams).then((res) => {
    tableData.value = res.data;
    if (selectedFirst) {
      const selectedSession = tableData.value[0];
      gridTableRef.value.setCurrentRow(selectedSession);
      formData.value.sessionId = selectedSession.id;
    }
  });
};
queryChatSession();
const options = ref<any[]>([
  {
    permission: 'system:permission:department:edit',
    label: 'opt.edit',
  },
  {
    permission: 'system:permission:department:delete',
    label: 'opt.delete',
  },
]);
const optionsClick = (label: string, data: SessionApi.SessionVO) => {
  switch (label) {
    case 'opt.edit': {
      // editFormRef.value.open(data.id);
      break;
    }
    case 'opt.delete': {
      handleDelete(data);
      break;
    }
    default:
      // eslint-disable-next-line no-console
      console.log('code is error.');
  }
};

const handleDelete = (data: SessionApi.SessionVO) => {
  proxy.$modal
    .confirm({
      message: `确定要删除回话【${data.name}】吗?`,
      maskClosable: true,
      title: '删除提示',
    })
    .then((res: string) => {
      if (data.id && res === 'confirm') {
        SessionApi.deleteSessionById(data.id).then(() => {
          queryChatSession();
          proxy.$modal.message({
            message: '删除成功',
            status: 'success',
          });
        });
      }
    });
};
const handleCurrentChange = ({row}) => {
  formData.value.sessionId = row.id;
  chatIndexRef.value.queryHistoryChatList();
};

const submitValidate = (callback: (arg?: boolean) => void,) => {
  let result = false;
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    callback(valid);
  });
  return result;
}
</script>

<style lang="less" scoped>
:deep(.tiny-col) {
  padding: 0;
}

.left-form {
  background-color: #fff;
  padding: 15px;
  height: calc(100vh - 150px)
}

.chat-session {
  display: flex;
  flex-direction: column;
}

.chat-session-add {
  margin: 10px 0;
}
</style>

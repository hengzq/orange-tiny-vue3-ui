<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="!displayOnly" width="39%" @close="onClose(false)">
    <tiny-form ref="formDataRef" :rules="formDataRules" :display-only="displayOnly" :model="formData" label-width="90px"
      validate-position="bottom" validate-type="text">
      <tiny-form-item :label="$t('llm.mcp-server.name')" prop="name">
        <tiny-input v-model="formData.name" :placeholder="$t('llm.mcp-server.name.placeholder')" />
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.mcp-server.transportProtocol')" prop="transportProtocol">
        <tiny-radio v-for="(item, index) in proxy.$dict.getDictData('ai_mcp_server_transport_protocol')" :key="index"
          v-model="formData.transportProtocol" :label="item.dictValue">
          {{ item.dictLabel }}
        </tiny-radio>
      </tiny-form-item>

      <tiny-form-item :label="$t('attribute.enabled.status')" prop="enabled">
        <tiny-radio v-for="(item, index) in proxy.$dict.getDictData(proxy.$dict.SYS_DATA_ENABLE_STATUS)" :key="index"
          v-model="formData.enabled" :label="item.dictValue == 'true'">
          {{ item.dictLabel }}
        </tiny-radio>
      </tiny-form-item>

      <tiny-form-item :label="$t('llm.mcp-server.connectionUrl')" prop="connectionUrl">
        <tiny-input v-model="formData.connectionUrl" :placeholder="$t('llm.mcp-server.connectionUrl.placeholder')" />
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.mcp-server.sseEndpoint')" prop="sseEndpoint">
        <tiny-input v-model="formData.sseEndpoint" :placeholder="$t('llm.mcp-server.sseEndpoint.placeholder')" />
      </tiny-form-item>
      <tiny-form-item :label="$t('llm.mcp-server.description')" prop="description">
        <md-preview v-if="displayOnly" v-model="formData.description" />
        <md-editor v-else v-model="formData.description" :preview="false" :toolbars="toolbars" />
      </tiny-form-item>
      <tiny-form-item v-if="displayOnly" :label="$t('llm.mcp-server.tool')">
        <tiny-collapse class="collapse-i81ee">
          <tiny-collapse-item v-for="(item, index) in mcpToolList" :key="index" :title="item.name" :name="item.name">
            <div class="description">{{ item.description }}</div>
            <tiny-grid :data="item.properties">
              <tiny-grid-column field="name" title="属性名称" width="100"></tiny-grid-column>
              <tiny-grid-column field="description" title="描述"></tiny-grid-column>
            </tiny-grid>
          </tiny-collapse-item>
        </tiny-collapse>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="onClose(false)">取消</tiny-button>
      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import { MdEditor, MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';

import * as PlatformApi from '@/api/large-model/platform';
import * as McpServerApi from '@/api/large-model/mcp-server';
import { computed, getCurrentInstance, Ref, ref, toRaw } from 'vue';

const toolbars = ['italic', 'underline', 'italic', 'strikeThrough', '-', 'bold', 'codeRow', 'unorderedList', 'orderedList', 'previewOnly'];

const emit = defineEmits(['ok']);
const { proxy } = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
const displayOnly = ref(false);

const title = computed(() => {
  if (displayOnly.value) {
    return "详情";
  }
  return isModify.value ? '修改 MCP 服务' : '新增 MCP 服务';
});

const formData = ref<McpServerApi.McpServerVO>({});

const formDataRules = {
  name: [{ required: true, message: '服务名称不能为空', trigger: 'change' }],
  connectionUrl: [{ required: true, message: '基础URL不能为空.', trigger: 'change' }],
  // sseEndpoint: [{required: true, message: '断点不能为空.', trigger: 'change'}],
};

const onSubmit = () => {
  proxy.$refs.formDataRef.validate((valid: boolean) => {
    if (valid) {
      if (formData.value.id) {
        McpServerApi.updateMcpServerById(formData.value.id, toRaw(formData.value))
          .then((res) => {
            proxy.$modal.message({ message: '修改成功', status: 'success' });
            onClose(true);
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        McpServerApi.addMcpServer(toRaw(formData.value))
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
const modelList: Ref<string[]> = ref([]);

const queryPlatformList = () => {
  PlatformApi.listPlatform().then((res) => {
    platformList.value = res.data;
  });
};

const resetForm = () => {
  if (!displayOnly.value) {
    formData.value = {
      transportProtocol: 'SSE',
      enabled: true,
    };
  }
  proxy.$refs.formDataRef.resetFields();
};

const mcpToolList = ref<McpServerApi.McpTool[]>([]);

const open = (id: string, display?: boolean) => {
  isModify.value = false;
  displayOnly.value = display || false;
  resetForm();
  if (id) {
    McpServerApi.getMcpServerById(id).then((res) => {
      formData.value = res.data;
      formData.value.description = res.data.description || "";
      isModify.value = true;
    });
    if (displayOnly.value) {
      McpServerApi.listMcpServerTool(id).then((res) => {
        mcpToolList.value = res.data;
      });
    }
  }
  queryPlatformList();
  visible.value = true;
};

defineExpose({
  open,
});
</script>
<style lang="less" scoped>
.collapse-i81ee ::v-deep .tiny-collapse-item__content > * {
  line-height: 1.8;
}

.collapse-i81ee .description {
  margin-bottom: 10px;
}
</style>
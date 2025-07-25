<template>
  <tiny-drawer :title="title" :visible="visible" :show-footer="true" width="32%" @close="onClose()">
    <tiny-grid ref="gridTableRef" class="table-list" :fetch-data="fetchTableData" :pager="pagerConfig" :loading="loading">
      <tiny-grid-column type="selection" width="60"/>
      <tiny-grid-column field="name" :title="$t('llm.mcp-server.name')"/>
      <tiny-grid-column field="createdAt" :title="$t('attribute.createdAt')" align="center" width="170"/>
    </tiny-grid>

    <template #footer>
      <tiny-button @click="onClose()">取消</tiny-button>
      <tiny-button type="primary" @click="onSubmit()">确定</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {computed, getCurrentInstance, reactive, ref, toRefs} from 'vue';
import * as ModelApi from "@/api/large-model/model";
import * as KnowledgeBaseApi from '@/api/large-model/knowledge-base';

const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const title = computed(() => {
  return '选择知识库';
});

const pagerConfig = reactive({
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 30, 50, 100],
    total: 0,
    align: 'right',
    layout: 'total, prev, pager, next, jumper, sizes',
  },
});

const state = reactive<{
  loading: boolean;
  filterOptions: KnowledgeBaseApi.KnowledgePageParam;
}>({
  loading: false,
  filterOptions: {} as KnowledgeBaseApi.KnowledgePageParam,
});

const {loading, filterOptions} = toRefs(state);
const gridTableRef = ref();

const fetchTableData = reactive({
  api: ({page}: any) => {
    const {currentPage, pageSize} = page;
    return getPageData({
      pageNo: currentPage,
      pageSize,
    });
  },
});

async function getPageData(
  params: KnowledgeBaseApi.KnowledgePageParam = {
    pageNo: 1,
    pageSize: 10,
  },
) {
  const queryParams: KnowledgeBaseApi.KnowledgePageParam = {
    ...filterOptions.value,
    ...params,
  };
  state.loading = true;
  try {
    const {data} = await KnowledgeBaseApi.pageKnowledge(queryParams);
    const {records, total} = data;
    return {
      result: records,
      page: {total},
    };
  } finally {
    state.loading = false;
  }
}

const formData = ref<ModelApi.ModelConfig>({});
const formDataRules = {};

const onSubmit = () => {
  const knowledgeBaseList = proxy.$refs.gridTableRef.getSelectRecords();
  emit('select', knowledgeBaseList);
  onClose()
};

const onClose = () => {
  visible.value = false;
};

const resetForm = () => {
  formData.value = {};
  proxy.$refs.formDataRef.resetFields();
};

const open = (baseIds:string[]) => {
  proxy.$refs.gridTableRef.setSelection(proxy.$refs.gridTableRef.getData().filter((item) => baseIds.includes(item.id)), true)
  visible.value = true;
};

defineExpose({
  open,
});
</script>

<style scoped>


</style>
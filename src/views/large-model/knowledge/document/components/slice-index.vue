<template>
  <tiny-drawer
      :title="formData.fileName" :visible="visible" width="70%" :show-footer="true" @close="onClose(false)">
    <!--    <div v-for="(item,index) in formData.documentSliceList" :key="index" style=" margin-bottom: 10px; padding: 10px">-->
    <!--      &lt;!&ndash;      <div style="display: flex;justify-content:flex-end; margin-bottom: 10px;">&ndash;&gt;-->
    <!--      &lt;!&ndash;        <tiny-button type="primary" size="small" :icon="IconEditor"></tiny-button>&ndash;&gt;-->
    <!--      &lt;!&ndash;        <tiny-button type="danger" size="small" :icon="IconDeleteL"></tiny-button>&ndash;&gt;-->
    <!--      &lt;!&ndash;      </div>&ndash;&gt;-->
    <div style="display: flex;flex-wrap: wrap">

      <div v-for="(item,index) in sliceList" :key="index" class="slice-item">
        <div class="content">
          {{ item.content }}
        </div>
        <div class="tool">
          <div>
            {{ formatFileSize(item.content?.length || 0) }}
          </div>
          <!--          <tiny-button type="text" size="small" @click="handleEdit(item)">查看详情</tiny-button>-->
          <tiny-action-menu
              :options="proxy.$hasPermission(options)" mode="card" :max-show-num="0"
              @item-click=" (data: any) => optionsClick(data.itemData.label, item) ">
            <template #item="{ data }">
              <span
                  v-if="data.label == 'opt.delete'"
                  style="color: var(--button-delete-color)"
              >
                {{ $t(data.label) }}
              </span>
              <span v-else> {{ $t(data.label) }} </span>
            </template>
          </tiny-action-menu>
        </div>
      </div>
    </div>

    <tiny-pager
        :current-page="pagerConfig.currentPage"
        :page-size="pagerConfig.pageSize"
        :page-sizes="pagerConfig.pageSizes"
        :total="pagerConfig.total"
        :layout="pagerConfig.layout"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
    />


    <edit-form ref="editFormRef"></edit-form>

    <template #footer>
      <!--      <tiny-button type="primary" @click="onSubmit">保存</tiny-button>-->
      <tiny-button @click="onClose(false)">取消</tiny-button>
    </template>
  </tiny-drawer>
</template>

<script lang="ts" setup>
import {formatFileSize} from '@/utils/format';
import 'md-editor-v3/lib/style.css';
import * as KnowledgeDocumentApi from "@/api/large-model/knowledge-document";
import * as KnowledgeDocSliceApi from "@/api/large-model/knowledge-doc-slice";
import {getCurrentInstance, ref} from 'vue';
import {iconDeleteL, iconEditor} from '@opentiny/vue-icon'
import EditForm from "./edit-slice-form.vue";


const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
// const title = computed(() => {
//   return isModify.value ? formData.fileName;
// });

const IconDeleteL = iconDeleteL()
const IconEditor = iconEditor()

const toolbars: any[] = [];
const footers: any[] = [];

const pagerConfig = ref({
  currentPage: 1,
  pageSize: 10,
  pageSizes: [10, 20, 30, 50, 100],
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
});

const formData = ref<KnowledgeDocumentApi.KnowledgeDocumentVO>({});

const options = ref([
  {
    permission: 'orange-ai:knowledge-doc-slice:update',
    label: 'opt.edit',
  },
  {
    permission: 'orange-ai:knowledge-doc-slice:delete',
    label: 'opt.delete',
  },
])

const optionsClick = (
    label: string,
    data: KnowledgeDocumentApi.KnowledgeDocumentVO,
) => {
  switch (label) {
    case 'opt.edit': {
      editFormRef.value.open(data.id);
      break;
    }
    case 'opt.delete': {
      handleDelete(data);
      break;
    }
    default:
      console.log('code is error.');
  }
};

const handleDelete = (data: KnowledgeDocumentApi.KnowledgeDocumentVO) => {
  proxy.$modal
      .confirm({
        message: `确定要删除切片?`,
        maskClosable: true,
        title: '删除提示',
      })
      .then((res: string) => {
        if (data.id && res === 'confirm') {
          KnowledgeDocSliceApi.deleteKnowledgeDocSliceById(data.id).then(() => {
            // handleFormQuery();
            proxy.$modal.message({
              message: '删除成功',
              status: 'success',
            });
          });
        }
      });
};

const editFormRef = ref()
const handleEdit = (item: KnowledgeDocSliceApi.KnowledgeDocSliceVO) => {
  editFormRef.value.open(item.id);
}

const onClose = (refresh: boolean) => {
  visible.value = false;
  if (refresh) {
    emit('ok');
  }
};

const resetForm = () => {
  formData.value = {};
  // proxy.$refs.formDataRef.resetFields();
};


function handleCurrentChange(current: number) {
  pagerConfig.value.currentPage = current
  fetchData()
}

function handleSizeChange(size: number) {
  pagerConfig.value.pageSize = size
  fetchData()
}

const sliceList = ref<KnowledgeDocSliceApi.KnowledgeDocSliceVO[]>([])
const fetchData = () => {
  KnowledgeDocSliceApi.pageKnowledgeDocSlice({
    pageNo: pagerConfig.value.currentPage,
    pageSize: pagerConfig.value.pageSize,
    'docId': formData.value.id
  }).then((res) => {
    const {records, total} = res.data;
    sliceList.value = records;
    pagerConfig.value.total = total;
    isModify.value = true;
  })
}

const open = (docId: string) => {
  isModify.value = false;
  resetForm();
  if (docId) {
    KnowledgeDocumentApi.getKnowledgeDocumentById(docId).then((res) => {
      formData.value = res.data;
      fetchData()
    });
  }
  visible.value = true;
};

defineExpose({
  open,
});
</script>
<style scoped>
.slice-item {
  flex: 1 1 48%;
  border: 1px solid rgba(135, 138, 171, .15);
  margin: 0 5px 10px;
  padding: 15px;
  height: 130px;
  display: flex;
  flex-direction: column;
  color: rgba(38, 36, 76, .8);
  font-size: 13px;
  line-height: 23px;

  .content {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tool {
    display: flex;
    justify-content: space-between;
    height: 30px;
    line-height: 30px;
    margin-top: auto;
    padding: 10px 0px 0px;
    margin-top: auto;
  }
}

.slice-item:hover {
  //border-color: #2f5bea;
  background-color: #f5f6f7;
}

</style>
<template>
  <tiny-drawer
    :title="formData.fileName" :visible="visible" width="70%" :show-footer="false" @close="onClose(false)">
    <div class="chunk-list">
      <div v-for="(item,index) in sliceList" :key="index" class="item">
        <div class="content"> {{ item.text }}</div>
        <div class="tool">
          <div>
<!--            <dict-tag-->
<!--              :value="item.embStatus"-->
<!--              :options="proxy.$dict.getDictData('ai_kb_doc_chunk_emb_status')"-->
<!--            />-->
            {{ formatFileSize(item.text?.length || 0) }}
          </div>

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
import EditForm from "./edit-slice-form.vue";


const emit = defineEmits(['ok']);
const {proxy} = getCurrentInstance() as any;
const visible = ref(false);
const isModify = ref(false);
// const title = computed(() => {
//   return isModify.value ? formData.fileName;
// });

const pagerConfig = ref({
  currentPage: 1,
  pageSize: 12,
  pageSizes: [12, 20, 30, 50, 100],
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
.chunk-list {
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  display: flex;

  .item {
    border: 1px solid #878aab26;
    border-radius: 16px;
    width: calc(33.3333% - 8px);
    padding: 12px 20px;
    color: #26244ccc;
    font-size: 12px;

    .content {
      min-height: 44px;
      margin-bottom: 13px;
      line-height: 22px;
      display: -webkit-box; /* 将对象作为弹性伸缩盒子模型显示 */
      -webkit-line-clamp: 5; /* 限制在一个块元素显示的文本的行数 */
      -webkit-box-orient: vertical; /* 设置或检索伸缩盒对象的子元素的排列方式 */
      overflow: hidden;
      text-overflow: ellipsis; /* 溢出部分用 ... 表示 */
      word-wrap: break-word; /* 允许长单词或 URL 在需要时断行 */
    }

    .tool {
      display: flex;
      justify-content: space-between;
      height: 30px;
      line-height: 30px;
      //padding: 10px 0 0;
    }
  }

  .item:hover {
    border: 1px solid #624aff;
  }
}


</style>
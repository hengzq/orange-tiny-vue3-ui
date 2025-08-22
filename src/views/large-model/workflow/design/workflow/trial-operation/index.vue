<template>
  <tiny-drawer class="config-dialog" :title="title" :visible="visible" :mask="false" :show-footer="true" width="30%"
    @close="onClose">
    <div id="runing-loading">

      <tiny-divider />
      <tiny-collapse v-model="activeNames">
        <tiny-collapse-item title="试运行输入" name="inputParams">
          <tiny-form ref="formDataRef" label-position="top" label-width="120px" validate-position="bottom"
            validate-type="text">
            <tiny-form-item v-for="(item, index) in inputParams" :key="index" :label="item.name" prop="name">
              <tiny-input v-model="item.value" :placeholder="$t('llm.wf.name.placeholder')" />
            </tiny-form-item>
          </tiny-form>
        </tiny-collapse-item>
      </tiny-collapse>

      <tiny-collapse v-model="activeNames" v-if="outputData && Object.keys(outputData).length > 0">
        <tiny-collapse-item title="运行结果" name="outputData">
          <div class="output-data">
            <div v-for="(item, index) in outputData" :key="index">
              <span>{{ index }}: </span> {{ item }}
            </div>
          </div>
        </tiny-collapse-item>
      </tiny-collapse>
    </div>

    <template #footer>
      <tiny-button @click="onClose">取消</tiny-button>
      <tiny-button type="primary" @click="trialOperation">试运行</tiny-button>
    </template>

  </tiny-drawer>

</template>

<script lang="ts" setup>
import * as WfNodeApi from "@/api/large-model/wf-node";
import { useWfStore } from "@/store/modules/wf";
import { TinyButton, TinyLoading } from '@opentiny/vue';
import { computed, getCurrentInstance, onMounted, Ref, ref, watch } from 'vue';

const wfStore = useWfStore();
const { proxy } = getCurrentInstance() as any;

const runingLoading = ref(null)
const openRuningLoading = () => {
  runingLoading.value = TinyLoading.service({
    text: '运行中',
    target: document.getElementById('runing-loading')
  })
}

// 监听运行完成
watch(
  () => wfStore.getRunCompleted(),
  (newVal) => {
    if (newVal) {
      if (runingLoading.value) {
        runingLoading.value.close()
      }
    }
  }
)

const visibleKey = 'trial-operation';
const visible = computed(() => {
  return wfStore.getConfigVisible === visibleKey;
});

const title = computed(() => {
  return '试运行';
});

const inputParams = computed(() => {
  const node = wfStore.getStartNode();
  return [...(node?.inputConfig?.inputParams ?? [])];
}) as Ref<WfNodeApi.Param[]>;

const outputData = computed(() => {
  const runNode = wfStore.getEndNodeRunResult();
  return { ...(runNode?.outputData ?? {}) };
});

const activeNames = ref(['inputParams', 'outputData']);


const trialOperation = () => {
  wfStore.runWfAsync(inputParams.value)
    .then(() => {
      proxy.$modal.message({ message: '试运行成功', status: 'success' });
      openRuningLoading()
      // onClose();
    })
    .catch(err => {
      proxy.$modal.error(`试运行失败: ${err.message}`);
    });
}

const onClose = () => {
  if (visible.value) {
    wfStore.setConfigVisible('');
  }
};

const open = () => {
  wfStore.setConfigVisible(visibleKey);
};

defineExpose({
  open,
});
</script>

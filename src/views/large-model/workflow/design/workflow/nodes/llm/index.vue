<template>
  <div class="node-container">
    <div class="node-title">
      <div class="flex items-center">
        <svg-icon name="wf-llm" /> {{ node.name ?? '大模型' }}
      </div>

      <div class="right-btn" @click.stop>
        <tiny-button :icon="IconDeltaRight" type="text" @click="runNode">
        </tiny-button>
        <tiny-action-menu :options="options" mode="card" :max-show-num="0" @item-click="
          (data: any) => optionsClick(data.itemData.label)
        ">
          <template #item="{ data }">
            <span v-if="data.label == 'opt.delete'" style="color: var(--button-delete-color)">
              {{ $t(data.label) }}
            </span>
            <span v-else> {{ $t(data.label) }} </span>
          </template>
        </tiny-action-menu>
      </div>
    </div>

    <NodeToolbar :is-visible="runResult ? true : false" :position="Position.Bottom">
      <RunResultIndex :run-result="runResult"></RunResultIndex>
    </NodeToolbar>
    <!--    <div class="llm-body">-->
    <!--      we-->
    <!--    </div>-->


    <Handle id="llm-target-left" type="target" :position="Position.Left" />
    <Handle id="llm-source-right" type="source" :position="Position.Right" />
  </div>
</template>

<script setup lang="ts">
import * as WfNodeApi from "@/api/large-model/wf-node";
import * as WfRunApi from "@/api/large-model/wf-run";
import { useWfStore } from "@/store/modules/wf";
import { iconDeltaRight } from '@opentiny/vue-icon';
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { computed, defineProps, getCurrentInstance, PropType, ref, Ref } from "vue";
import { updateWfGraphDebounced } from '../utils';

import RunResultIndex from '../components/run-result/index.vue';

const IconDeltaRight = iconDeltaRight()

const { proxy } = getCurrentInstance() as any;
const wfStore = useWfStore();


const emit = defineEmits(['delete']);
const props = defineProps({
  node: {
    type: Object as PropType<WfNodeApi.WfNode>,
    required: true
  },
});

const runResult = computed(() => {
  return wfStore.getRunNodeResultById(props.node.id);
}) as Ref<WfRunApi.WFRunNodeVO>


const options = ref([
  {
    label: 'opt.delete',
  }
])

const optionsClick = (label: string) => {
  switch (label) {
    case 'opt.delete': {
      wfStore.removeNodeByNodeCode(props.node.nodeCode);
      updateWfGraphDebounced()
      break;
    }
    default:
      console.log('code is error.');
  }
};


const runNode = () => {
  proxy.$modal.message({ message: '开发中...', status: 'info' });
  // WfExecutionApi.invokeLlmNode({
  //   id: ""
  // }).then((res) => {
  //   proxy.$modal.message({message: '调用成功', status: 'success'});
  //
  // })
}

</script>
<style lang="less" scoped></style>
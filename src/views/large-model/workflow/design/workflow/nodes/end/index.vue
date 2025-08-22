<template>
  <div class="node-container">
    <div class="node-title">
      <div class="flex items-center">
        <svg-icon name="wf-end" /> {{ node.name ?? '结束' }}
      </div>
    </div>

    <NodeToolbar :is-visible="runResult ? true : false" :position="Position.Bottom">
      <RunResultIndex :run-result="runResult"></RunResultIndex>
    </NodeToolbar>

    <!--    <div class="llm-body">-->
    <!--      we-->
    <!--    </div>-->
    <Handle id="end-target-left" type="target" :position="Position.Left" />
  </div>

</template>

<script setup lang="ts">
import * as WfNodeApi from "@/api/large-model/wf-node";
import * as WfRunApi from "@/api/large-model/wf-run";
import { useWfStore } from "@/store/modules/wf";
import { Handle, Position } from '@vue-flow/core';
import { NodeToolbar } from '@vue-flow/node-toolbar';
import { computed, PropType, Ref } from 'vue';

import RunResultIndex from '../components/run-result/index.vue';


const wfStore = useWfStore();

const props = defineProps({
  node: {
    type: Object as PropType<WfNodeApi.WfNode>,
    required: true
  },
});

const runResult = computed(() => {
  return wfStore.getRunNodeResultById(props.node.id);
}) as Ref<WfRunApi.WFRunNodeVO>


</script>

<style scoped></style>
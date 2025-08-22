<template>
  <div class="workflow-container">
    <vue-flow :nodes="nodes" :edges="edges" :connection-mode="ConnectionMode.Strict" :delete-key-code="['Delete']"
      :zoom-on-scroll="false" :zoom-on-pinch="false" :zoom-on-double-click="false" @node-click="onNodeClick">
      <background />
      <!-- 开始节点 -->
      <template #node-start="props">
        <start-node :node="props.data" />
      </template>

      <!-- 大模型节点 -->
      <template #node-llm="props">
        <llm-node :node="props.data" />
      </template>

      <!-- 结束节点 -->
      <template #node-end="props">
        <end-node :node="props.data" />
      </template>

      <!-- 小地图 -->
      <mini-map pannable zoomable />

      <panel position="bottom-center">
        <div class="bottom-panel-btns flex align-center">
          <div>
            <tiny-button type="primary" @click="addNode">添加大模型节点</tiny-button>
          </div>
          <div class="left">
            <tiny-button type="info" @click="pilotRun">试运行</tiny-button>
          </div>
        </div>
      </panel>

    </vue-flow>

    <start-node-config-form ref="startNodeConfigFormRef" />
    <end-node-config-form ref="endNodeConfigFormRef" @update="updateNodeData" />
    <llm-config-form ref="configFormRef" @update="updateNodeData" />

    <trial-operation ref="trialOperationRef" />
  </div>
</template>

<script lang="ts" setup>
import { useWfStore } from "@/store/modules/wf";
import { v4 as uuidv4 } from 'uuid';
import { computed, getCurrentInstance, ref } from "vue";

import * as WfEdgeApi from "@/api/large-model/wf-edge";
import * as WfNodeApi from '@/api/large-model/wf-node';

import { Background } from '@vue-flow/background';
import { Connection, ConnectionMode, Edge, MouseTouchEvent, Node, Panel, useVueFlow, VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';
import EndNodeConfigForm from './nodes/end/config-form.vue';
import EndNode from './nodes/end/index.vue';
import LlmConfigForm from './nodes/llm/config-form.vue';
import LlmNode from './nodes/llm/index.vue';
import StartNodeConfigForm from './nodes/start/config-form.vue';
import StartNode from './nodes/start/index.vue';
import TrialOperation from './trial-operation/index.vue';

import { updateWfGraphDebounced } from './nodes/utils';

const { onConnect, addNodes, removeSelectedNodes, addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges } = useVueFlow()

const { proxy } = getCurrentInstance() as any;

const configFormRef = ref();
const startNodeConfigFormRef = ref();
const endNodeConfigFormRef = ref();
const trialOperationRef = ref();

const wfStore = useWfStore();


const nodes = computed<Node[]>(() => {
  return wfStore.nodes?.map((item: WfNodeApi.WfNode) => ({
    id: item.nodeCode,
    type: item.nodeType?.toLowerCase(),
    position: item.position,
    data: item,
  } as Node)) || [];
})

const edges = computed<Edge[]>(() => {
  return wfStore.edges?.map((item: WfEdgeApi.WfEdge) => ({
    id: item.id,
    source: item.sourceNodeId,
    target: item.targetNodeId,
    markerEnd: { type: 'arrow' },
    data: item,
  } as Edge)) || [];
})

const addNode = () => {
  const position = { x: Math.random() * 500, y: Math.random() * 500 };
  const type = 'llm'
  const id = type.concat(`-${uuidv4().substring(0, 6)}`)

  wfStore.addNode({
    ...WfNodeApi.LlmNodeTemplate,
    nodeCode: id,
    nodeType: type.toUpperCase(),
    position
  } as WfNodeApi.WfNode)
  updateWfGraphDebounced()
}

const deleteNode = (node: WfNodeApi.WfNode) => {
  wfStore.removeNodeByNodeCode(node.nodeCode);
  updateWfGraphDebounced()
}

const updateNodeData = (node: WfNodeApi.WfNode) => {
  const index = nodes.value.findIndex(n => n.id === node.nodeCode);
  if (index !== -1) {
    nodes.value[index].data = node;
  }
  updateWfGraphDebounced()
}

const onNodeClick = ({ event, node }: { event: MouseTouchEvent, node: Node }) => {
  if (node.type === 'start') {
    startNodeConfigFormRef.value.open(node.data.id);
  } else if (node.type === 'llm') {
    configFormRef.value.open(node.data);
  } else if (node.type === 'end') {
    endNodeConfigFormRef.value.open(node.data.id)
  }
}

const pilotRun = () => {
  trialOperationRef.value?.open()
}


onConnect((connection: Connection) => {
  const { source, sourceHandle, target, targetHandle } = connection;
  // 基本校验
  if (!source || !target) return;
  //  防止自环连接
  if (source === target) return;
  //  防止重复连接（根据 handle 判断）
  const exists = edges.value.some(
    edge =>
      edge.source === source &&
      edge.target === target
  );
  if (exists) return;

  wfStore.addEdge({
    id: uuidv4(),
    sourceNodeId: source,
    targetNodeId: target,
  } as WfEdgeApi.WfEdge)

  updateWfGraphDebounced()
})

onNodesChange((changes) => {
  console.log("node change:{}", changes)
  if (!Array.isArray(changes) || changes.length === 0) return;

  changes.forEach((change) => {
    // 处理节点移除操作，确保开始和结束节点不会被删除
    if (change.type === 'remove') {
      const node = nodes.value.find(item => item.id === change.id);
      if (node && node.type && !['start', 'end'].includes(node.type)) {
        deleteNode(node.data);
      }

    }
    // 更新节点位置信息
    else if (change.type === 'position' && change.dragging) {
      nodes.value.forEach(item => {
        if (item.id === change.id) {
          item.position = change.position
        }
      });
      wfStore.updateNodeByNodeCode({
        nodeCode: change.id,
        position: change.position
      } as WfNodeApi.WfNode)

      updateWfGraphDebounced()
    }
  });
})

onEdgesChange((changes) => {
  console.log("changes:{}", changes)
  if (!changes?.length) return;
  changes.forEach((change) => {
    if (change.type === 'remove') {
      wfStore.removEdge(change.id);
      updateWfGraphDebounced()
    }
  });
})



</script>
<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import "index.less";
</style>
<style lang="less" scoped>
.bottom-panel-btns {
  .left {
    margin-left: 15px;
  }
}
</style>
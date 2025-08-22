import * as WfApi from '@/api/large-model/wf';
import * as WfEdgeApi from '@/api/large-model/wf-edge';
import * as WfNodeApi from '@/api/large-model/wf-node';
import * as WfRunApi from '@/api/large-model/wf-run';
import { defineStore } from 'pinia';


export const useWfStore = defineStore('wf-graph', {
    state: () => ({
        id: '',
        versionId: '',
        name: '',
        description: '',
        nodes: [] as WfNodeApi.WfNode[],
        edges: [] as WfEdgeApi.WfEdge[],
        runId: '',
        wfRun: {} as WfRunApi.WfRunVO,
        configVisible: ''
    }),

    getters: {
        getConfigVisible: (state) => state.configVisible,
        setConfigVisible: (state) => (visible: string) => {
            state.configVisible = visible;
        },
        getStartNode: (state) => (): WfNodeApi.WfNode | undefined => {
            return state.nodes.find(node => node.nodeType === 'START');
        },
        getEndNode: (state) => (): WfNodeApi.WfNode | undefined => {
            return state.nodes.find(node => node.nodeType === 'END');
        },
        getNodeById: (state) => (id: string): WfNodeApi.WfNode | undefined => {
            return state.nodes.find(node => node.id === id);
        },
        getNodeByNodeCode: (state) => (nodeCode: string): WfNodeApi.WfNode | undefined => {
            return state.nodes.find(node => node.nodeCode === nodeCode);
        },
        getRunNodeResultById: (state) => (id: string): WfRunApi.WFRunNodeVO | undefined => {
            return state.wfRun.nodes?.find(node => node.nodeId === id)
        },
        getEdgeById: (state) => (id: string): WfEdgeApi.WfEdge | undefined => {
            return state.edges.find(edge => edge.id === id);
        },
        getIncomingEdges: (state) => (nodeCode: string): string[] => {
            return state.edges
                .filter(edge => edge.targetNodeId === nodeCode)
                .map(edge => edge.sourceNodeId);
        },
        getRunResult: (state) => (): WfRunApi.WfRunVO => {
            return state.wfRun;
        },
        getRunCompleted: (state) => (): boolean => {
            const runStatus = state.wfRun.runStatus ?? '';
            return ['SUCCEEDED', 'FAILED', 'CANCELLED', 'COMPLETED'].includes(runStatus);
        }

    },
    actions: {
        getWfById(id: string) {
            WfApi.getDetailWfById(id, false).then((res) => {
                const wf = res.data;
                this.init(wf);
            })
        },
        clearWf() {
            this.id = '';
            this.versionId = '';
            this.name = '';
            this.description = '';
            this.nodes = [];
            this.edges = [];
            this.runId = '';
            this.wfRun = {} as WfRunApi.WfRunVO;
            this.configVisible = '';
        },
        init(wf: WfApi.WfDetailVO) {
            const { id, version, nodes = [], edges = [] } = wf;
            this.id = id;
            if (version) {
                const { id: versionId = '', name = '', description = '' } = version;
                this.versionId = versionId;
                this.name = name;
                this.description = description;
            }
            this.nodes = nodes;
            this.edges = edges;
            this.runId = '';
            this.wfRun = {} as WfRunApi.WfRunVO

        },
        addNode(node: WfNodeApi.WfNode) {
            if (!node) return;
            this.nodes.push(node)
        },
        removeNodeByNodeCode(nodeCode: string) {
            this.nodes = this.nodes.filter(node => node.nodeCode !== nodeCode);
            this.edges = this.edges.filter(edge => edge.sourceNodeId !== nodeCode && edge.targetNodeId !== nodeCode);
        },
        updateNode(node: WfNodeApi.WfNode) {
            const index = this.nodes.findIndex(n => n.id === node.id);
            if (index !== -1) {
                this.nodes[index] = { ...this.nodes[index], ...node };
            }
        },
        updateNodeByNodeCode(node: WfNodeApi.WfNode) {
            const index = this.nodes.findIndex(n => n.nodeCode === node.nodeCode);
            if (index !== -1) {
                this.nodes[index] = { ...this.nodes[index], ...node };
            }
        },
        addEdge(edge: WfEdgeApi.WfEdge) {
            if (!edge) return;
            this.edges.push(edge)
        },
        removEdge(edgeId: string) {
            this.edges = this.edges.filter((edge) => edge.id !== edgeId)
        },

        updateWfGraph() {
            WfApi.updateWfGraphById(this.id, {
                nodes: this.nodes,
                edges: this.edges
            }).then((res) => {
                this.getWfById(this.id);
            })
        },
        getAllUpstreamNodeByNodeId(nodeCode: string): WfNodeApi.WfNode[] {
            const upstreamNode: WfNodeApi.WfNode[] = [];
            const visitedNodes: Set<string> = new Set();
            if (!nodeCode) {
                return upstreamNode;
            }

            const dfs = (currentNodeCode: string) => {
                if (visitedNodes.has(currentNodeCode)) return;
                visitedNodes.add(currentNodeCode);

                const currentNode = this.getNodeByNodeCode(currentNodeCode);
                if (currentNode && currentNodeCode !== nodeCode) {
                    upstreamNode.push(currentNode);
                }
                const incomingEdges = this.getIncomingEdges(currentNodeCode);
                incomingEdges.forEach(sourceNodeId => {
                    if (sourceNodeId) {
                        dfs(sourceNodeId);
                    }
                });
            };

            dfs(nodeCode);
            return upstreamNode;
        },

        async runWfAsync(inputParams: WfNodeApi.Param[] = []): Promise<string> {
            if (!this.id) {
                throw new Error('Workflow ID is required to run the workflow');
            }
            const res = await WfRunApi.runWfAsync(this.id,
                {
                    workflowVersionId: this.versionId,
                    input: inputParams.reduce((acc, param) => {
                        if (param.name) {
                            (acc as Record<string, any>)[param.name] = param.value;
                        }
                        return acc;
                    }, {})
                }
            );
            const { id } = res.data;
            this.runId = id;
            return this.runId;
        },
        updateWfRun(wfRun: WfRunApi.WfRunVO) {
            this.wfRun = wfRun;
        },
        getEndNodeRunResult(): WfRunApi.WFRunNodeVO | undefined {
            const endNode = this.getEndNode();
            return this.getRunNodeResultById(endNode?.id ?? '');
        }
    }
});
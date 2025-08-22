import { useWfStore } from '@/store/modules/wf';
import { NodeOptions } from '@/types/global';
import { useDebounceFn } from '@vueuse/core';

export function getUpstreamNodeDataOptions(nodeCode: string): NodeOptions[] {
    const wfStore = useWfStore();
    return wfStore.getAllUpstreamNodeByNodeId(nodeCode)
        .map(node => ({
            value: node.nodeCode,
            label: node.name ?? '',
            type: 'NODE',
            children: (node.outputConfig?.outParams || []).map(param => ({
                value: `{{${node.nodeCode}.${param.name}}}`,
                label: param.name ?? '',
                type: 'PARAM'
            }))
        }));
}


let debouncedUpdate: (() => void) | null = null;
export function updateWfGraphDebounced() {
    const wfStore = useWfStore();
    if (!debouncedUpdate) {
        debouncedUpdate = useDebounceFn(() => {
            wfStore.updateWfGraph();
        }, 1000);
    }
    // 触发防抖函数（不会立刻执行，而是延迟 1s）
    debouncedUpdate();
}

// 定义状态枚举对象
const RunStatus = {
    PENDING: { name: "PENDING", description: "待执行" },
    RUNNING: { name: "RUNNING", description: "正在执行" },
    SUCCEEDED: { name: "SUCCEEDED", description: "运行成功" },
    FAILED: { name: "FAILED", description: "执行失败" },
    CANCELLED: { name: "CANCELLED", description: "被用户或系统取消" }
};

// 方法：根据 name 获取描述
export function getDescriptionByName(name: string) {
    const status = Object.values(RunStatus).find(s => s.name === name);
    return status ? status.description : null;
}

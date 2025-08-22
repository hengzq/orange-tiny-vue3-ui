<template>
    <div class="wf-node-param-container flex items-center">
        <div class="flex items-center value">
            <tiny-select v-model="formData.type">
                <tiny-option v-for="item in WfNodeApi.typeOptions" :key="item.value" :label="item.label"
                    :value="item.value">
                </tiny-option>
            </tiny-select>
            <tiny-input v-if="inputVisible" v-model="formData.value" placeholder="请输入内容" @change="updateFormData"></tiny-input>
            <tiny-action-menu v-if="inputVisible" :max-show-num="0" :options="getUpstreamNodeDataOptions(props.node.nodeCode)" mode="card"
                @item-click="actionMenuClick">
            </tiny-action-menu>
        </div>
        <div>
            <tiny-button type="text" @click="removeInputAttr" size="mini">
                <svg-icon name="system-trash" size="16px" />
            </tiny-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import * as WfNodeApi from '@/api/large-model/wf-node';
import { getCurrentInstance, PropType, ref } from 'vue';
import { getUpstreamNodeDataOptions, updateWfGraphDebounced } from '../../utils';

const emit = defineEmits(['update:value', 'deleteValue']);
const { proxy } = getCurrentInstance() as any;

const props = defineProps({
    node: {
        type: Object as PropType<WfNodeApi.WfNode>,
        required: true
    },
    param: {
        type: Object as PropType<WfNodeApi.Param>,
        required: true
    },
    inputVisible: {
        type: Boolean,
        default: true
    }
});
// 直接引用外层变量 直接修改
const formData = ref<WfNodeApi.Param>(props.param);

const actionMenuClick = ({ itemData }: { itemData: any }) => {
    if (itemData.type === 'NODE') {
        return
    }
    formData.value.value = itemData.value
    formData.value.valueFrom = 'REF'
    updateFormData()
};

const updateFormData = () => {
    updateWfGraphDebounced();
}

const removeInputAttr = () => {
    emit('deleteValue', formData.value.id);
};

</script>

<style lang="less" scoped>
.wf-node-param-container {
    justify-content: space-between;

    .value {
        border: 1px solid var(--tv-Grid-border-color-divider);
        border-radius: var(--tv-Grid-input-border-radius);
        margin-right: 10px;
        width: 100%;
    }

    :deep(.tiny-input__inner) {
        border: none;
    }

    :deep(.tiny-input-suffix .tiny-input__inner) {
        padding: 0 20px 0 0;
    }

    :deep(.tiny-select) {
        width: 110px;
        border-right: 1px solid var(--tv-Grid-border-color-divider);
    }

    :deep(.tiny-dropdown__trigger:not(.tiny-button) .tiny-svg) {
        fill: var(--tv-Grid-text-color);
    }

}
</style>
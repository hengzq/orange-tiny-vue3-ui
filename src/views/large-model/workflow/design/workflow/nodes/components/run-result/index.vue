<template>
    <tiny-collapse class="run-result">
        <tiny-collapse-item :title="getDescriptionByName(runResult?.runStatus ?? '')" name="1">
            <tiny-form ref="ruleFormRef" label-position="top">
                <tiny-form-item label="输入" v-if="runResult.inputData && Object.keys(runResult.inputData).length > 0">
                    <div class="output-data">
                        <div v-for="(item, index) in runResult.inputData" :key="index">
                            <span>{{ index }}: </span> {{ item }}
                        </div>
                    </div>
                </tiny-form-item>
                <tiny-form-item label="输出" v-if="runResult.outputData">
                    <div class="output-data">
                        <div v-for="(item, index) in runResult.outputData" :key="index">
                            <span>{{ index }}: </span> {{ item }}
                        </div>
                    </div>
                </tiny-form-item>
            </tiny-form>
        </tiny-collapse-item>
    </tiny-collapse>
</template>



<script setup lang="ts">
import { Position } from '@vue-flow/core'
import { computed, getCurrentInstance, PropType, ref, Ref, toRaw } from 'vue';
import { useWfStore } from "@/store/modules/wf";
import * as WfRunApi from "@/api/large-model/wf-run";
import { updateWfGraphDebounced, getDescriptionByName } from '../../utils';

const wfStore = useWfStore();

const props = defineProps({
    runResult: {
        type: Object as PropType<WfRunApi.WFRunNodeVO>,
        required: true
    },
});
</script>


<style lang="less" scoped>
 
</style>
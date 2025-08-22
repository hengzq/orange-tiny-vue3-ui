import axios from 'axios';

export interface WfNode {
  tenantId?: string;
  id: string;
  workflowId?: string;
  nodeCode: string;
  name?: string;
  nodeType?: string;
  description?: string;
  position?: Position;
  inputConfig?: InputConfig
  outputConfig?: OutputConfig
}

export interface InputConfig {
  inputParams?: Param[]
  llmParam?: LlmParam
}

export interface OutputConfig {
  outParams?: Param[]
}

export interface Param {
  id?: string;
  name?: string;
  valueFrom?: string;
  value?: string;
  type?: string;
  description?: string;
  required?: boolean;
}

export interface LlmParam {
  modelId?: string;
  systemPrompt?: string;
  prompt?: string;
}

export interface Position {
  x: number;
  y: number;
}


export const typeOptions = [
  { label: 'String', value: 'STRING' },
]


export const LlmNodeTemplate = {
  name: '大模型',
  nodeType: 'LLM',
  inputConfig: {
    inputParams: [
      {
        name: 'input',
        type: 'STRING',
      }
    ],
  },
  outputConfig: {
    outParams: [
      {
        name: 'result',
        type: 'STRING',
      }
    ]
  }

}
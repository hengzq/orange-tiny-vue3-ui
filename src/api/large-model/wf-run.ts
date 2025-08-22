import axios from 'axios';
import { PageParam } from '@/api/global';
import { McpServerVO } from "@/api/large-model/mcp-server";
import { Param, WfNode } from "@/api/large-model/wf-node";

import { KnowledgeVO } from './knowledge-base';
import { WfEdge } from './wf-edge';

const BASE_URL = '/orange-ai/v1.0/workflow-runs';

export function runWfAsync(wfId: string, param: WorkflowRunParam) {
  return axios.post(BASE_URL.concat(`/${wfId}/run`), param);
}

export function getWfRunDetailById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}/detail`));
}

export interface WorkflowRunParam {
  workflowVersionId?: string;
  input: any;
}


export interface WfRunVO {
  id: string;
  workflowId: string;
  workflowVersionId: string;
  runStatus?: string;

  nodes?: WFRunNodeVO[]
}

export interface WFRunNodeVO {
  id: string;
  runId: string;
  nodeId: string;
  runStatus?: string;
  inputData?: {
    [key: string]: string | number | boolean | object | null | undefined;
  }
  outputData?: {
    [key: string]: string | number | boolean | object | null | undefined;
  }
}


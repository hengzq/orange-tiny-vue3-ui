import axios from 'axios';
import { PageParam } from '@/api/global';
import { McpServerVO } from "@/api/large-model/mcp-server";
import { WfNode } from "@/api/large-model/wf-node";

import { KnowledgeVO } from './knowledge-base';
import { WfEdge } from './wf-edge';

const BASE_URL = '/orange-ai/v1.0/workflows';

export function addWf(params: EditWfVO) {
  return axios.post(BASE_URL, params);
}

export function deleteWfById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateWfById(id: string, params: EditWfVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function updateWfGraphById(id: string, params: WfGraph) {
  return axios.put(BASE_URL.concat(`/${id}/graph`), params);
}

export function publishWfById(id: string) {
  return axios.put(BASE_URL.concat(`/${id}/publish`));
}

export function getWfById(id: string, latestReleased: boolean) {
  return axios.get(BASE_URL.concat(`/${id}?latestReleased=${latestReleased}`));
}

export function getDetailWfById(id: string, latestReleased: boolean) {
  return axios.get(BASE_URL.concat(`/${id}/detail?latestReleased=${latestReleased}`));
}

export function pageWf(params: WfPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listWf(params: WfListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}


export interface WfVO {
  tenantId?: string;
  id: string;
  WfType?: string;
  version?: WfVersionVO;
}

export interface WfDetailVO extends WfVO {
  nodes: WfNode[],
  edges: WfEdge[]
}

export interface WfVersionVO {
  tenantId?: string;
  id?: string;
  WfId?: string;
  name?: string;
  description?: string;
}

export interface WfGraph {
  nodes: WfNode[],
  edges: WfEdge[]
}

export type EditWfVO = WfVO & WfVersionVO & {
  baseList?: KnowledgeVO[];
  mcpServerList?: McpServerVO[];
}

export type WfListParam = {
  name?: string;
}

export type WfPageParam = WfListParam & PageParam;


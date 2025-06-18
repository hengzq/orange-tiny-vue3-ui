import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/mcp-server';

export function addMcpServer(params: McpServerVO) {
  return axios.post(BASE_URL, params);
}

export function deleteMcpServerById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateMcpServerById(id: string, params: McpServerVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getMcpServerById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageMcpServer(params: McpServerPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listMcpServer(params: McpServerListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}


export interface McpServerVO {
  tenantId?: string;
  id?: string;
  name?: string;
  McpServerName?: string;
  transportProtocol?: string;
  connectionUrl?: string;
  description?: string;
}


export interface McpServerListParam extends McpServerVO {
  name?: string;
}

export type McpServerPageParam = McpServerListParam & PageParam;


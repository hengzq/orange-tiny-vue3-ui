import axios from 'axios';
import { PageParam } from '@/api/global';
import { ModelConfig } from "@/api/large-model/model";
import { McpServerVO } from "@/api/large-model/mcp-server";
import { KnowledgeVO } from './knowledge-base';

const BASE_URL = '/orange-ai/v1.0/apps';
export const DEBUG_CONVERSATION_STREAM_URL =
  '/orange-ai/v1.0/App/debug-conversation-stream';

export const CONVERSATION_STREAM = BASE_URL.concat('/conversation-stream');

export function addApp(params: EditAppVO) {
  return axios.post(BASE_URL, params);
}

export function deleteAppById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateAppById(id: string, params: EditAppVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function publishAppById(id: string) {
  return axios.put(BASE_URL.concat(`/${id}/publish`));
}

export function getAppById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function getLatestAppById(id: string, latestReleased: boolean) {
  return axios.get(BASE_URL.concat(`/${id}/latest?latestReleased=${latestReleased}`));
}

export function pageApp(params: AppPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listApp(params: AppListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface AppVO {
  tenantId?: string;
  id?: string;
  appType?: string;
  latestVersion?: AppVersionVO;
}

export interface AppVersionVO {
  tenantId?: string;
  id?: string;
  appId?: string;
  name?: string;
  systemPrompt?: string;
  description?: string;
  modelId?: string;
  modelConfig?: ModelConfig;
  baseIds?: string[];
  mcpIds?: string[];
  workflowIds?: string[];
}

export type EditAppVO = AppVO & AppVersionVO & {
  baseList?: KnowledgeVO[];
  mcpServerList?: McpServerVO[];
  workflowList?: McpServerVO[];
}

export type AppListParam = AppVO

export type AppPageParam = AppListParam & PageParam;


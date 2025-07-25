import axios from 'axios';
import {PageParam} from '@/api/global';
import {ModelConfig} from "@/api/large-model/model";

const BASE_URL = '/orange-ai/v1.0/apps-version';

// export function addApp(params: AppVO) {
//   return axios.post(BASE_URL, params);
// }
//
// export function deleteAppById(id: string) {
//   return axios.delete(BASE_URL.concat(`/${id}`));
// }
//
// export function updateAppById(id: string, params: EditAppVO) {
//   return axios.put(BASE_URL.concat(`/${id}`), params);
// }
//
// export function publishAppById(id: string) {
//   return axios.put(BASE_URL.concat(`/${id}/publish`));
// }
//
export function getAppVersionById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

// export function getLatestAppById(id: string, latestReleased: boolean) {
//   return axios.get(BASE_URL.concat(`/${id}/latest?latestReleased=${latestReleased}`));
// }

export function pageAppVersion(params: AppPageVersionParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listAppVersionByAppId(appId: string) {
  return axios.get(BASE_URL.concat(`/${appId}/list`));
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
}

export type AppVersionListParam = AppVersionVO

export type AppPageVersionParam = AppVersionListParam & PageParam;


import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/model';

export function addModel(params: ModelVO) {
  return axios.post(BASE_URL, params);
}

export function deleteModelById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateModelById(id: string, params: ModelVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getModelById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageModel(params: ModelPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listModel(params: ModelListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface ModelVO {
  tenantId?: string;
  id?: string;
  platform?: string;
  type?: string;
  name?: string;
  code?: string;
  enabled?: boolean;
  sort?: number;
  description?: string;
}

export interface ModelListParam extends ModelVO {
  nameLike?: string;
}

export type ModelPageParam = ModelListParam & PageParam;

export interface ModelTypeVO {
  name?: string;
  code?: string;
}
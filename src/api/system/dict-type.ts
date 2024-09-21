import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/dict/type';

export function pageDictType(params: DictTypePageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listDictType(params: DictTypeListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteDictTypeById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addDictType(params: DictTypeVO) {
  return axios.post(BASE_URL, params);
}

export function getDictTypeById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function updateDictTypeById(id: string, params: DictTypeVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export interface DictTypeVO {
  /** 租户id */
  tenantId?: string;
  /** 主键 */
  id?: string;
  /** 字典名称 */
  name?: string;
  /** 字典类型 */
  dictType?: string;
  /** 模型启用状态 true:启用 false：不启用 */
  enabled?: boolean | string;
  /** 模型启用状态 true:是 false：否 */
  preset?: boolean;
  /** 备注 */
  description?: string;
}

export interface DictTypeListParam {
  /** 字典名称 */
  name?: string;
  nameLike?: string;
  /** 字典类型 */
  dictType?: string;
}

export type DictTypePageParam = DictTypeListParam & PageParam;

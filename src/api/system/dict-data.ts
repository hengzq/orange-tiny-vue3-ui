import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/dict/data';

export function pageDictData(params: DictDataPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listDictData(params: DictDataListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteDictDataById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addDictData(params: DictDataVO) {
  return axios.post(BASE_URL, params);
}

export function getDictDataById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function updateDictDataById(id: string, params: DictDataVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export interface DictDataVO {
  /** 租户id */
  tenantId?: number;
  /** 主键 */
  id?: string;
  /** 字典类型 */
  dictType?: string;
  /** 字典数据标签 */
  dictLabel?: string;
  /** 字典数据键值 */
  dictValue?: string;
  /** 回显样式 */
  showStyle?: string;
  /** 模型启用状态 true:启用 false：不启用 */
  enabled?: boolean;
  /** 模型启用状态 true:是 false：否 */
  preset?: boolean;
  /** 排序 */
  sort?: number;
  /** 描述 */
  description?: string;
}

export type DictDataPageParam = DictDataListParam & PageParam;

export interface DictDataListParam {
  dictType?: string;
  dictLabel?: string;
  dictLabelLike?: string;
}

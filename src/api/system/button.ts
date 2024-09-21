import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/permission/button';

export function pageButton(params: ButtonPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listButton(params: ButtonListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteButtonById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addButton(params: ButtonVO) {
  return axios.post(BASE_URL, params);
}

export function getButtonById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function updateButtonById(id: string, params: ButtonVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export type ButtonVO = {
  /** 租户id */
  tenantId?: number;
  /** 按钮ID */
  id: string;
  /** 菜单ID */
  menuId: string;
  /** 菜单名称 */
  name: string;
  /** 权限编码 */
  permission?: string;
  /** 模型启用状态 true:是 false：否 */
  preset?: boolean;
  /** 排序 */
  sort?: number;
  /** 备注 */
  remark?: string;
};

export interface ButtonListParam {
  /** 菜单ID */
  menuId?: string;
  nameLike?: string;
}

export type ButtonPageParam = ButtonListParam & PageParam;

import axios from 'axios';
import { PageParam } from '@/api/global';
import { jsonToUrlParam } from '@/utils/formatter';

const BASE_URL = '/orange-system/v1.0/role';

export function pageRole(params: RolePageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listRole(params: RoleListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteRoleById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addRole(params: RoleVO) {
  return axios.post(BASE_URL, params);
}

export function getRoleById(id: string, params?: RoleDetailQueryParam) {
  let url = BASE_URL.concat(`/${id}`);
  if (params) {
    url = url.concat(`?${jsonToUrlParam(params)}`);
  }
  return axios.get(url);
}

export function updateRoleById(id: string, params: RoleVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export interface RoleVO {
  tenantId?: string;
  id?: string;
  name?: string;
  permission?: string;
  sort?: number;
  /** 模型启用状态 true:启用 false：不启用 */
  enabled?: boolean;
  /** 模型启用状态 true:是 false：否 */
  preset?: boolean;
  remark?: string;
}

export interface RoleListParam {
  name?: string;
  nameLike?: string;
  permission?: string;
  permissionLike?: string;
  /** 模型启用状态 true:启用 false：不启用 */
  enabled?: boolean;
}

export type RolePageParam = RoleListParam & PageParam;

export type RoleDetailQueryParam = {
  showMenu?: boolean;
  showButton?: boolean;
};

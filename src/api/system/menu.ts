import axios from 'axios';

const BASE_URL = '/orange-system/v1.0/menu';

export function listMenu(params: MenuListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteMenuById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addMenu(params: MenuVO) {
  return axios.post(BASE_URL, params);
}

export function getMenuById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function updateMenuById(id: string, params: MenuVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export interface MenuVO {
  tenantId?: string;
  id?: string;
  parentId?: string;
  name?: string;
  permission?: string;
  hidden?: boolean;
  /** 模型启用状态 true:是 false：否 */
  preset?: boolean;
  path?: string;
  icon?: string;
  component?: string;
  sort?: number;
}

export interface MenuTreeVO extends MenuVO {
  children?: MenuTreeVO[];
}

export interface MenuListParam {
  parentId?: number;
  name?: string;
  nameLike?: string;
  permission?: string;
  permissionLike?: string;
  component?: string;
  showButton?:boolean;
}

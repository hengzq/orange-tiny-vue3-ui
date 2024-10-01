import axios from 'axios';

const BASE_URL = '/orange-system/v1.0/department';

export function addDepartment(params: DepartmentVO) {
  return axios.post(BASE_URL, params);
}

export function deleteDepartmentById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateDepartmentById(id: string, params: DepartmentVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getDepartmentById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function listDepartment(params: DepartmentListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface DepartmentVO {
  tenantId?: string;
  id?: string;
  parentId?: string;
  name?: string;
  sort?: number;
  description?: string;
}

export interface DepartmentTreeVO {
  tenantId?: string;
  id?: string;
  parentId?: string;
  name?: string;
  sort?: number;
  /** 子集 */
  children?: DepartmentTreeVO[];
}

export interface DepartmentListParam extends DepartmentVO {
  nameLike?: string;
}

import axios from 'axios';
import { PageParam } from '@/api/global';
import { RoleDetailQueryParam, RoleVO } from '@/api/system/role';
import { jsonToUrlParam } from '@/utils/formatter';

const BASE_URL = '/orange-system/v1.0/user';

export function pageUser(params: UserPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listUser(params: UserListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteUserById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function deleteUserByIds(params: string[]) {
  return axios.post(BASE_URL.concat(`/batch-delete`), { ids: params });
}

export function addUser(params: UserVO) {
  return axios.post(BASE_URL, params);
}

export function getUserById(id: string,params?: UserDetailQueryParam) {
  let url = BASE_URL.concat(`/${id}`);
  if (params) {
    url = url.concat(`?${jsonToUrlParam(params)}`);
  }
  return axios.get(url);
}

export function updateUserById(id: string, params: UserVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function resetUserPassword(params: ResetPasswordParam) {
  return axios.put(BASE_URL.concat(`/reset-password`), params);
}

export interface UserVO {
  tenantId?: number;
  id?: string;
  name?: string;
  gender?: string;
  email?: string;
  phone?: string;
  loginAccount?: string;
  loginPassword?: string;
}

export interface UserListParam {
  name?: string;
  nameLike?: string;
  email?: string;
  loginAccount?: string;
  loginAccountLike?: string;
}

export interface AddUserParam extends UserVO {
  departmentIds?: string[];
}

export type UserPageParam = UserListParam & PageParam;

export interface ResetPasswordParam {
  userId: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserDetailVO extends UserVO {
  roles?: RoleVO[];
}

export interface UserDetailQueryParam {
  showRole?: boolean;
}

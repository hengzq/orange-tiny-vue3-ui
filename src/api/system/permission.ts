import axios from 'axios';

const BASE_URL = '/orange-system/v1.0/permission/permission';

export function getUserInfo() {
  return axios.get(BASE_URL.concat('/user-info'));
}

export function assignRolesToOneUser(params: AssignRolesToOneUserParam) {
  return axios.post(BASE_URL.concat('/assign-roles-to-one-user'), params);
}

export function assignResourcesToOneRole(params: AssignResourcesToOneRole) {
  return axios.post(BASE_URL.concat('/assign-resources-to-one-role'), params);
}

export type AssignRolesToOneUserParam = {
  userId?: string;
  roleIds?: string[];
};

export type AssignResourcesToOneRole = {
  /* 角色ID */
  roleId: string;
  /* 菜单ID */
  menuIds: string[];
  /* 按钮ID */
  buttonIds?: string[];
};

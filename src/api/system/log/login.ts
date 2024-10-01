import axios from 'axios';
import { PageParam } from '@/api/global';
import { RoleVO } from '@/api/system/role';
import { UserListParam } from '@/api/system/user';

const BASE_URL = '/orange-system/v1.0/login-log';

export function pageLoginLog(params: LoginLogPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function getLoginLogById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export interface LoginLogVO {
  id?: number;
  requestId?: string;
  account?: string;
  type?: 'LOGIN' | 'LOGOUT';
  userId?: number;
  userName?: string;
  userIp?: string;
  userAgent?: string;
  loginTime?: string;
  userLocation?: string;
  status?: 'SUCCESS' | 'FAIL';
}

export type LoginLogPageParam = LoginLogVO & PageParam;

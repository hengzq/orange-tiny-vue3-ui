import axios from 'axios';
import { PageParam } from '@/api/global';
import { RoleVO } from '@/api/system/role';
import { UserListParam } from '@/api/system/user';

const BASE_URL = '/orange-system/v1.0/log/login';

export function pageLoginLog(params: LoginLogPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export interface LoginLogVO {
  id?: number;
  traceId?: string;
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

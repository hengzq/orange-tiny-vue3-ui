import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/auth';

export function login(params: LoginParam) {
  return axios.post(BASE_URL.concat('/login'), params);
}
export function logout() {
  return axios.get(BASE_URL.concat('/logout'));
}

export type LoginParam = {
  /** 登陆账号 */
  loginAccount: string;
  /** 登陆密码 */
  loginPassword: string;
  /** 租户账号 */
  tenantId?: string;
};

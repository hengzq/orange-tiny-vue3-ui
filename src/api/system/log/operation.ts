import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/operation-log';

export function pageOperationLog(params: OperationLogPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function getOperationLogById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export type OperationLogPageParam = OperationLogVO &
  PageParam & {
    resourceNameLike?: string;
    operationStartTime?: string;
    operationEndTime?: string;
  };

export interface OperationLogVO {
  /** 租户id */
  tenantId?: number;
  /** 主键 */
  id?: number;
  /** 请求ID */
  requestId?: string;
  /** 资源id */
  resourceId?: string;
  resourceName?: string;
  /** User-Agent */
  userAgent?: string;
  /** 请求URL */
  requestUrl?: string;
  /** 请求方式 */
  requestMethod?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** 操作用户 */
  userId?: string;
  userName?: string;
  /** 操作用户IP */
  userIp?: string;
  /** 用户操作地点 */
  userLocation?: string;
  /** 用户浏览器 */
  userBrowser?: string;
  /** 用户操作系统 */
  userOs?: string;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 请求耗时,单位毫秒 */
  duration?: number | string;
  /** 请求状态 */
  status?: 'SUCCESS' | 'FAIL';
  /** Java 方法名 */
  javaMethod?: string;
  /** Java 方法名参数 */
  javaMethodArgs?: string;
  /** Java 方法返回结果 */
  javaMethodResult?: string;
  stackTrace?: string;
}

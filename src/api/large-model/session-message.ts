import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/session-message';

export function addSessionMessage(params: SessionMessageVO) {
  return axios.post(BASE_URL, params);
}

export function deleteSessionMessageById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function rateSessionMessageById(
  id: string,
  params: SessionMessageVO,
) {
  return axios.put(BASE_URL.concat(`/rate/${id}`), params);
}

export function listSessionMessage(params: SessionMessageListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface SessionMessageVO {
  tenantId?: string;
  id?: string;
  userId?: string;
  sessionId?: string;
  role?: string;
  content?: string;
  rating?: string;
  generating?: boolean; // 用于流式回复 生成中
}

export type SessionMessageListParam = SessionMessageVO;
export type SessionMessagePageParam = SessionMessageListParam & PageParam;

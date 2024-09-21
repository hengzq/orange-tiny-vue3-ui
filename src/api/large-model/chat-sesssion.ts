import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/chat-session';

export function addChatSession(params: ChatSessionVO) {
  return axios.post(BASE_URL, params);
}

export function deleteChatSessionById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateChatSessionById(id: string, params: ChatSessionVO) {
  return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getChatSessionById(id: string) {
  return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageChatSession(params: ChatSessionPageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listChatSession(params: ChatSessionListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface ChatSessionVO {
  tenantId?: string;
  id?: string;
  userId?: string;
  platform?: string;
  modelCode?: string;
  name?: string;
}

export interface ChatSessionListParam extends ChatSessionVO {
  nameLike?: string;
}

export type ChatSessionPageParam = ChatSessionListParam & PageParam;

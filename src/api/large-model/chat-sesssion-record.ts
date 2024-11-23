import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/chat-session-record';

export function addChatSessionRecord(params: ChatSessionRecordVO) {
  return axios.post(BASE_URL, params);
}

export function deleteChatSessionRecordById(id: string) {
  return axios.delete(BASE_URL.concat(`/${id}`));
}

export function rateChatSessionRecordById(
  id: string,
  params: ChatSessionRecordVO,
) {
  return axios.put(BASE_URL.concat(`/rate/${id}`), params);
}

export function listChatSessionRecord(params: ChatSessionRecordListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface ChatSessionRecordVO {
  tenantId?: string;
  id?: string;
  userId?: string;
  sessionId?: string;
  messageType?: string;
  content?: string;
  rating?: string;
  generating?: boolean; // 用于流式回复 生成中
}

export type ChatSessionRecordListParam = ChatSessionRecordVO;
export type ChatSessionRecordPageParam = ChatSessionRecordListParam & PageParam;

import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/session';

export function addSession(params: SessionVO) {
    return axios.post(BASE_URL, params);
}

export function deleteSessionById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function deleteSessionByIds(params: string[]) {
    return axios.post(BASE_URL.concat(`/batch-delete`), { ids: params });
}

export function updateSessionById(id: string, params: SessionVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getSessionById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageSession(params: SessionPageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listSession(params: SessionListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}

export interface SessionVO {
    tenantId?: string;
    id?: string;
    userId?: string;
    associationId?: string;
    modelId?: string;
    name?: string;
    sessionType?: string;
}

export interface SessionListParam extends SessionVO {
    nameLike?: string;
}

export type SessionPageParam = SessionListParam & PageParam;

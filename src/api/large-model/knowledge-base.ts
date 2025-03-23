import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/knowledge-base';

export function addKnowledge(params: KnowledgeVO) {
    return axios.post(BASE_URL, params);
}

export function deleteKnowledgeById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateKnowledgeById(id: string, params: KnowledgeVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getKnowledgeById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageKnowledge(params: KnowledgePageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listKnowledge(params: KnowledgeListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}

export interface KnowledgeVO {
    tenantId?: string;
    id?: string;
    /* 知识库名称 */
    name?: string;
    embeddingModelId?: string;
    /* 模型启用状态 true:启用 false：不启用 */
    enabled?: boolean;
    /* 排序 */
    sort?: number;
    /* 备注 */
    description?: string;
    vectorCollectionName?: string;
}

export interface KnowledgeListParam extends KnowledgeVO {
    nameLike?: string;
}

export type KnowledgePageParam = KnowledgeListParam & PageParam;

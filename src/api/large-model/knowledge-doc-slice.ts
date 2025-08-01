import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/knowledge-base-doc-chunks';

export function addKnowledgeDocSlice(params: KnowledgeDocSliceVO) {
    return axios.post(BASE_URL, params);
}

// export function batchAddDocumentAndSlice(params: KnowledgeDocSliceSlice) {
//     return axios.post(BASE_URL.concat(`/batch-add-document-and-slice`), params);
// }

export function deleteKnowledgeDocSliceById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateKnowledgeDocSliceById(id: string, params: KnowledgeDocSliceVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getKnowledgeDocSliceById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageKnowledgeDocSlice(params: KnowledgeDocSlicePageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listKnowledge(params: KnowledgeDocSliceListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}


export interface KnowledgeDocSliceVO {
    tenantId?: string;
    id?: string;
    /* 知识库ID */
    baseId?: string;
    /* 文档ID */
    docId?: string;
    /* 知识内容 */
    content?: string;
}

export type KnowledgeDocSliceListParam = KnowledgeDocSliceVO

export type KnowledgeDocSlicePageParam = KnowledgeDocSliceListParam & PageParam;

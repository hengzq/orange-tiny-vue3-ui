import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/knowledge-document';

export function addKnowledge(params: KnowledgeDocumentVO) {
    return axios.post(BASE_URL, params);
}

export function addTextToKnowledge(params: AddTextToKnowledgeParam) {
    return axios.post(BASE_URL.concat(`/add-text-to-knowledge`), params);
}

export function deleteKnowledgeDocumentById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateKnowledgeDocumentById(id: string, params: KnowledgeDocumentVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getKnowledgeDocumentById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function getMarkdownFromUrl(params: UrlParam) {
    return axios.post(BASE_URL.concat(`/markdown-from-url`), params);
}

export function pageKnowledgeDocument(params: KnowledgeDocumentPageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listKnowledge(params: KnowledgeDocumentListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}

export interface UrlParam {
    url?: string
}

export interface WebContent {
    title?: string;
    content?: string;
}

export type AddTextToKnowledgeParam = KnowledgeDocumentVO;

export interface KnowledgeDocumentVO {
    tenantId?: string;
    id?: string;
    /* 知识库ID */
    baseId?: string;
    /* 知识内容 */
    content?: string;
    /* 文件名称 */
    fileName?: string;
    /* 文件路径 */
    filePath?: string;
}

export type KnowledgeDocumentListParam = KnowledgeDocumentVO

export type KnowledgeDocumentPageParam = KnowledgeDocumentListParam & PageParam;

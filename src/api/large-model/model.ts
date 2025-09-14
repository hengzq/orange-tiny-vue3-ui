import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/models';

export function addModel(params: ModelVO) {
    return axios.post(BASE_URL, params);
}

export function deleteModelById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateModelById(id: string, params: ModelVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function updateModelEnabledById(id: string, enabled: boolean) {
    return axios.put(BASE_URL.concat(`/${id}/${enabled}`));
}

export function getModelById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageModel(params: ModelPageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listModel(params: ModelListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}


export interface ModelVO {
    tenantId?: string;
    id?: string;
    platform?: string;
    modelType?: string;
    name?: string;
    modelName?: string;
    enabled?: boolean;
    sort?: number;
    baseUrl?: string;
    apiKey?: string;
    description?: string;
}

export interface ModelConfig {
    temperature?: number;
    sessionRound?: number;
}


export interface ModelListParam extends ModelVO {
    nameLike?: string;
}

export type ModelPageParam = ModelListParam & PageParam;

export interface ModelTypeVO {
    name?: string;
    code?: string;
}


export interface PlatformModelTree {
    value?: string;
    label?: string;
    platform?: string;
    children?: PlatformModelTree[];
}
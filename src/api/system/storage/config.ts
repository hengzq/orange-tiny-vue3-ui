import axios from 'axios';
import {PageParam} from '@/api/global';

const BASE_URL = '/orange-system/v1.0/storage-config';

export function pageStorageConfig(params: StorageConfigPageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listStorageConfig(params: StorageConfigListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}

export function deleteStorageConfigById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function addStorageConfig(params: StorageConfigVO) {
    return axios.post(BASE_URL, params);
}

export function getStorageConfigById(id: string) {
    let url = BASE_URL.concat(`/${id}`);
    return axios.get(url);
}

export function updateStorageConfigById(id: string, params: StorageConfigVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export interface StorageConfigVO {
    tenantId?: string;
    id?: string;
    mode?: string;
    name?: string;
    config?: string;
    master?: boolean;
    description?: string;
}

export interface StorageConfigListParam {
    name?: string;
    nameLike?: string;
}

export type StorageConfigPageParam = StorageConfigListParam & PageParam;

import axios from 'axios';
import {PageParam} from "@/api/global";

const BASE_URL = "/orange-ai/v1.0/platform-config"

export function addPlatformConfig(params: PlatformConfigVO) {
    return axios.post(BASE_URL, params);
}

export function deletePlatformConfigById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updatePlatformConfigById(id: string, params: PlatformConfigVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getPlatformConfigById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pagePlatformConfig(params: PlatformConfigPageParam) {
    return axios.post(BASE_URL.concat("/page"), params);
}

export function listPlatformConfig(params: PlatformConfigListParam) {
    return axios.post(BASE_URL.concat("/list"), params);
}


export interface PlatformConfigVO {
    tenantId?: string;
    id?: string;
    name?: string;
    code?: string;
    enabled?: boolean;
    sort?: number;
    remark?: string;
};

export interface PlatformConfigListParam extends PlatformConfigVO {
    nameLike?: string
};

export type PlatformConfigPageParam = PlatformConfigListParam & PageParam;
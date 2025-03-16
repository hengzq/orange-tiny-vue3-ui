import axios from 'axios';

import {ModelTypeVO} from './model';

const BASE_URL = '/orange-ai/v1.0/platform';

export function listPlatform(params?: PlatformListParam) {
    return axios.post(BASE_URL.concat('/list'), params || {});
}

export function listModel(platform: string, modelType: string) {
    return axios.get(BASE_URL.concat(`/list-model/${platform}/${modelType}`));
}

export interface PlatformVO {
    name?: string;
    code?: string;
    modelTypes?: ModelTypeVO[];
}

export interface PlatformListParam {
    modelType?: string;
}

import axios from 'axios';

import { ModelListParam, ModelTypeVO } from './model';

const BASE_URL = '/orange-ai/v1.0/platform';

export function listPlatform(params?: PlatformListParam) {
  return axios.post(BASE_URL.concat('/list'), params || {});
}

export interface PlatformVO {
  name?: string;
  code?: string;
  modelTypes?: ModelTypeVO[];
}

export interface PlatformListParam {
  modelType?: string;
}

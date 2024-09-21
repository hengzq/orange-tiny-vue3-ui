import axios from 'axios';

import { ModelTypeVO } from './model';

const BASE_URL = '/orange-ai/v1.0/platform';

export function listPlatform() {
  return axios.post(BASE_URL.concat('/list'), {});
}

export interface PlatformVO {
  name?: string;
  code?: string;
  modelTypes?: ModelTypeVO[];
}

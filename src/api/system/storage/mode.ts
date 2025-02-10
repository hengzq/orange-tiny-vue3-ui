import axios from 'axios';
import { PageParam } from '@/api/global';

const BASE_URL = '/orange-system/v1.0/storage-mode';

export function listStorageMode() {
  return axios.post(BASE_URL.concat('/list'), {});
}

export interface StorageModeVO {
  name: string;
  code: string;
}

import axios from 'axios';
import { BaseTenantVO, PageParam } from '@/api/global';

const BASE_URL = '/orange-ai/v1.0/text-to-image';

export function generateImage(params: TextToImageVO) {
  return axios.post(BASE_URL.concat('/generate'), params);
}

export function pageTextToImage(params: TextToImagePageParam) {
  return axios.post(BASE_URL.concat('/page'), params);
}

export function listTextToImage(params: TextToImageListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}

export interface GenerateImageVO {
  urls?: string[];
}

export interface TextToImageVO extends BaseTenantVO {
  platform?: string;
  modelCode?: string;
  prompt?: string;
  num?: number;
  width?: number;
  height?: number;
  urls?: string[];
}

export type TextToImageListParam = TextToImageVO;

export type TextToImagePageParam = TextToImageListParam & PageParam;

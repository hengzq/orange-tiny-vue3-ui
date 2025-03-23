import axios from 'axios';

const BASE_URL = '/orange-system/v1.0/storage-object';

export const UPLOAD_URL =
    '/orange-system/v1.0/storage-object/upload';

export function upload(formData: FormData) {
    return axios.post(BASE_URL.concat('/upload'), formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//
// export function pageTextToImage(params: TextToImagePageParam) {
//   return axios.post(BASE_URL.concat('/page'), params);
// }
//
// export function listTextToImage(params: TextToImageListParam) {
//   return axios.post(BASE_URL.concat('/list'), params);
// }

export type StorageObjectVO = {
    id: string;
    originalName: string;
    fileName: string;
    type?: string;
    size?: number;
};


export interface FileInfo {
    name: string;
    fileName: string;
    filePath?: string;
    size?: number;
    fileSize?: number;
}
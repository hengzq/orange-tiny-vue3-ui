const BASE_URL = '/orange-ai/v1.0/text-to-image';

export const CONVERSATION_STREAM_URL =
  '/orange-ai/v1.0/chat/conversation-stream';
//
// export function generateImage(params: TextToImageVO) {
//   return axios.post(BASE_URL.concat('/generate'), params);
// }
//
// export function pageTextToImage(params: TextToImagePageParam) {
//   return axios.post(BASE_URL.concat('/page'), params);
// }
//
// export function listTextToImage(params: TextToImageListParam) {
//   return axios.post(BASE_URL.concat('/list'), params);
// }

export interface ConversationParam  {
  platform?: string;
  modelCode?: string;
  prompt?: string;
  sessionId?: string;
};

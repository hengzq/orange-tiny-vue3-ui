import axios from 'axios';

const BASE_URL = '/orange-ai/v1.0/workflow-versions';


export function listWfVersion(params: WfVersionListParam) {
  return axios.post(BASE_URL.concat('/list'), params);
}


export interface WfVersionVO {
  tenantId?: string;
  id?: string;
  workflowId?: string;
  name?: string;
  versionStatus?: string;
  description?: string;
}

export type WfVersionListParam = WfVersionVO



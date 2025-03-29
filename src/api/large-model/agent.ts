import axios from 'axios';
import {PageParam} from '@/api/global';
import {ModelConfig} from "@/api/large-model/model";

const BASE_URL = '/orange-ai/v1.0/agent';
export const DEBUG_CONVERSATION_STREAM_URL =
    '/orange-ai/v1.0/agent/debug-conversation-stream';

export function addAgent(params: AgentVO) {
    return axios.post(BASE_URL, params);
}

export function deleteAgentById(id: string) {
    return axios.delete(BASE_URL.concat(`/${id}`));
}

export function updateAgentById(id: string, params: AgentVO) {
    return axios.put(BASE_URL.concat(`/${id}`), params);
}

export function getAgentById(id: string) {
    return axios.get(BASE_URL.concat(`/${id}`));
}

export function pageAgent(params: AgentPageParam) {
    return axios.post(BASE_URL.concat('/page'), params);
}

export function listAgent(params: AgentListParam) {
    return axios.post(BASE_URL.concat('/list'), params);
}


export interface ConversationParam {
    agentId?: string;
    prompt?: string;
    sessionId?: string;
};

export interface AgentVO {
    tenantId?: string;
    id?: string;
    modelId?: string;
    modelConfig?: ModelConfig;
    baseIds?: string[];
    name?: string;
    systemPrompt?: string;
    description?: string;
}

export type AgentListParam = AgentVO

export type AgentPageParam = AgentListParam & PageParam;


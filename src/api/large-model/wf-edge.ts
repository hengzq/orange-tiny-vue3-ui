import axios from 'axios';
import {PageParam} from '@/api/global';
 

export interface WfEdge {
  tenantId?: string;
  id?: string;
  workflowId: string;
  sourceNodeId: string;
  targetNodeId?: string;
}


export type WfListParam = WfEdge

export type WfPageParam = WfListParam & PageParam;


export interface PageParam {
  /** 查询页码，从1开始 默认值:1 */
  pageNo?: number;
  /** 每页数量,取值范围[5,100] 默认值:10 */
  pageSize?: number;
}

export interface BaseTenantVO {
  createdBy?: string;
  createdAt?: string;
}

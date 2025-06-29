<template>
  <div>
    <tiny-container :aside-width="asideWidth" :header-height="headerHeight">
      <template #header>
        <tiny-layout>
          <div class="layout-navbar">
            <navbar-index :agent="agent"/>
          </div>
        </tiny-layout>
      </template>
      <template #aside>
        <tiny-layout class="layout-aside">
          <tiny-button type="primary" class="session-btn" @click="addSession"> 新建对话</tiny-button>
          <tiny-grid
            ref="gridTableRef" :data="sessionList" :show-header="false" max-height="100%" highlight-current-row @current-change="handleCurrentChange">
            <tiny-grid-column field="name" show-overflow/>
<!--            <tiny-grid-column :title="$t('table.operations')" align="center" width="60">-->
<!--              <template #default="scope">-->
<!--                <tiny-action-menu-->
<!--                  :max-show-num="0" :options="options" more-text="" :suffix-icon="tinyIconConfig"-->
<!--                  @item-click="(data: any) => optionsClick(data.itemData.label, scope.row)">-->
<!--                  <template #item="{ data }">-->
<!--                    <span> {{ $t(data.label) }} </span>-->
<!--                  </template>-->
<!--                </tiny-action-menu>-->
<!--              </template>-->
<!--            </tiny-grid-column>-->
          </tiny-grid>
        </tiny-layout>
      </template>
      <tiny-layout class="layout-main">
        <conversation-index ref="conversationIndexRef" :agent="agent" @refresh="querySession" style="width: 80%;margin: auto;"/>
      </tiny-layout>
    </tiny-container>
  </div>
</template>

<script lang="ts" setup>
import {getCurrentInstance, ref, Ref} from "vue";
import * as AgentApi from '@/api/large-model/agent';
import * as SessionApi from "@/api/large-model/session";
import {iconConfig} from '@opentiny/vue-icon'


import ConversationIndex from './components/conversation/index.vue';
import NavbarIndex from './components/navbar/index.vue';

const tinyIconConfig = iconConfig()
const {proxy} = getCurrentInstance() as any;

const asideWidth = ref(300)
const footerHeight = ref(0)
const headerHeight = ref(60)

const options = ref<any[]>([
  {
    permission: 'system:permission:department:edit',
    label: 'opt.edit',
  },
  {
    permission: 'system:permission:department:delete',
    label: 'opt.delete',
  },
]);

const agent: Ref<AgentApi.AgentVO> = ref({})
const getAgentById = () => {
  AgentApi.getAgentById(proxy.$route.params.agentId).then((res) => {
    agent.value = res.data;
  });
}
getAgentById()

const gridTableRef = ref('gridTableRef');
const sessionList: Ref<SessionApi.SessionVO[]> = ref([]);
const querySession = () => {
  const queryParams = {
    'associationId': proxy.$route.params.agentId
  };
  SessionApi.listSession(queryParams).then((res) => {
    sessionList.value = res.data;
  });
};
querySession();

const conversationIndexRef = ref()

const handleCurrentChange = ({row}: { row: SessionApi.SessionVO }) => {
  conversationIndexRef.value.queryHistoryChatList(row.id)
};

const addSession = () => {
  conversationIndexRef.value.addSession();
};


</script>

<style scoped lang="less">
:deep(.tiny-container__aside) {
  background-color: #fff;
  //border-left: 1px solid var(--o-border-line-1, #e8e8e8);
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2);
}

.layout-aside {
  margin: 20px;
  height: calc(100% - 100px);

  .session-btn {
    width: 100%;
    margin-bottom: 20px;
  }
}

.layout-main {
  //background-color: var(--tv-color-bg);
  height: 100%;
}

:deep(.tiny-grid .tiny-grid-body__column, .tiny-grid .tiny-grid-footer__column, .tiny-grid .tiny-grid-header__column) {
  border-bottom: none;
}

:deep(.tiny-dropdown__trigger .tiny-dropdown__suffix-inner .tiny-svg) {
  fill: var(--tv-color-text, #191919);
  font-size: 20px !important;
}
</style>
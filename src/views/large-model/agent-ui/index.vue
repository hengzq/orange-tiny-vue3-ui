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
          <tiny-grid ref="gridTableRef" :data="sessionList"
                     :show-header="false" max-height="100%" highlight-current-row @current-change="handleCurrentChange">
            <tiny-grid-column field="name"/>
          </tiny-grid>
        </tiny-layout>
      </template>
      <tiny-layout>
        <conversation-index ref="conversationIndexRef" :agent="agent" @refresh="querySession" style="width: 80%;margin: auto;"/>
      </tiny-layout>
    </tiny-container>
  </div>
</template>

<script lang="ts" setup>
import {getCurrentInstance, ref, Ref} from "vue";
import * as AgentApi from '@/api/large-model/agent';
import * as SessionApi from "@/api/large-model/session";

import ConversationIndex from './components/conversation/index.vue';
import NavbarIndex from './components/navbar/index.vue';


const {proxy} = getCurrentInstance() as any;

const asideWidth = ref(300)
const footerHeight = ref(0)
const headerHeight = ref(60)

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
  conversationIndexRef.value.addSeeion();
};


</script>


<style scoped lang="less">

.layout-navbar {
  position: fixed;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 4px 6px 0 rgba(0, 0, 0, 0.2);
}

:deep(.tiny-container__aside) {
  background-color: #fff;
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

:deep(.tiny-grid .tiny-grid-body__column, .tiny-grid .tiny-grid-footer__column, .tiny-grid .tiny-grid-header__column) {
  border-bottom: none;
}
</style>
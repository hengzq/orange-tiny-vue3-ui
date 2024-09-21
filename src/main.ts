import { createApp } from 'vue';
import * as echarts4 from 'echarts4';
import globalComponents from '@/components';

// Icon
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register'

// 引入 opentiny 组件
import { Modal, Notify } from '@opentiny/vue';
import { setupOpenTiny } from '@/plugins/opentiny';

import { hasPermission } from '@/hooks/permission';
import * as dict from '@/hooks/dict';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';
import { setupProdMockServer } from './mockProdServer';
import './mock';
import App from './App.vue';
import '@/api/interceptor';
import '@/assets/style/index.less';



// eslint-disable-next-line import/extensions
import 'echarts4/map/js/china.js';
import chinaMap from './assets/chaina.json';

if (import.meta.env.VITE_USE_MOCK) setupProdMockServer();
echarts4.registerMap('china', chinaMap);
const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n({ locale: 'zhCN' }));
app.use(globalComponents);
app.use(directive);

setupOpenTiny(app);

app.config.globalProperties.$dict = dict;
app.config.globalProperties.$modal = Modal;
app.config.globalProperties.$notify = Notify;
app.config.globalProperties.$hasPermission = hasPermission

app.mount('#app');

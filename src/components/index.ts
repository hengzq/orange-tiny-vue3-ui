import { App } from 'vue';
import Breadcrumb from './breadcrumb/index.vue';
import DictTag from './dict-tag/index.vue';
import SvgIcon from './svg-icon/index.vue'

export default {
  install(Vue: App) {
    Vue.component('Breadcrumb', Breadcrumb);
    Vue.component('DictTag', DictTag);
    Vue.component('SvgIcon', SvgIcon)
  },
};

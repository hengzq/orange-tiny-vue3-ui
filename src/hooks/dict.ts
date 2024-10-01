import { ref, toRefs } from 'vue';
import * as DictDataApi from '@/api/system/dict/data';

// 数据启用状态 字典类型
export const SYS_DATA_ENABLE_STATUS = 'sys_data_enable_status';
export const SYS_DATA_PRESET_STATUS = 'sys_data_preset_status';
export const SYS_DATA_HIDDEN_STATUS = 'sys_data_hidden_status';


export function getDictData(type: string) {
  let strDictData = sessionStorage.getItem(type);
  if (strDictData) {
    return JSON.parse(strDictData);
  }
  const res = ref([]);
  return (() => {
    DictDataApi.listDictData({ dictType: type }).then((response) => {
      const data = JSON.stringify(response.data);
      sessionStorage.setItem(type, data);
      res.value = response.data;
    });
    return res.value;
  })();
}

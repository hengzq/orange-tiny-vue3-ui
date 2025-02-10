export default {
  path: 'system-storage',
  id: 'SystemStorage',
  label: '存储管理',
  children: [
    {
      path: 'config',
      id: 'Config',
      label: '配置管理',
      component: () => import('@/views/system/storage/config/index.vue'),
    },
  ],
};

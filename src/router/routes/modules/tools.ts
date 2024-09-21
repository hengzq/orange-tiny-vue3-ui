export default {
  path: 'tools',
  id: 'Tools',
  label: '工具',
  children: [
    {
      path: 'icon',
      id: 'ToolsIcon',
      label: '图标',
      component: () => import('@/views/tools/icon/index.vue'),
    },
  ],
};

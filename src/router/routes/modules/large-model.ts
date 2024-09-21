export default {
  path: 'large-model',
  id: 'LargeModel',
  label: 'LargeModel',
  children: [
    {
      path: 'chat',
      id: 'Chat',
      label: 'Chat',
      component: () => import('@/views/large-model/chat/index.vue'),
    },
    {
      path: 'image',
      id: 'Image',
      label: 'Image',
      component: () => import('@/views/large-model/image/index.vue'),
    },
    {
      path: 'model',
      id: 'Model',
      label: 'Model',
      component: () => import('@/views/large-model/model/index.vue'),
    },
  ],
};

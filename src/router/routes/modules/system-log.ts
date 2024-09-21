export default {
  path: 'system-log',
  id: 'SystemLog',
  label: '日志管理类',
  children: [
    {
      path: 'login',
      id: 'Login',
      label: '登陆日志',
      component: () => import('@/views/system/log/login/index.vue'),
    },
    {
      path: 'operation',
      id: 'Operation',
      label: '操作日志',
      component: () => import('@/views/system/log/operation/index.vue'),
    },
  ],
};

export default {
  path: 'system',
  id: 'System',
  label: '系统管理',
  children: [
    {
      path: 'department',
      id: 'Department',
      label: 'Department',
      component: () => import('@/views/system/department/index.vue'),
    },
    {
      path: 'dict',
      id: 'Dict',
      label: '字典类型管理',
      component: () => import('@/views/system/dict-type/index.vue'),
    },
    {
      path: 'data',
      id: 'Data',
      label: '字典数据管理',
      component: () => import('@/views/system/dict-data/index.vue'),
    },
    {
      path: 'user',
      id: 'user',
      label: '用户管理',
      component: () => import('@/views/system/user/index.vue'),
    },
    {
      path: 'role',
      id: 'Role',
      label: '角色管理',
      component: () => import('@/views/system/role/index.vue'),
    },
    {
      path: 'menu',
      id: 'Menu',
      label: '菜单管理',
      component: () => import('@/views/system/menu/index.vue'),
    },
  ],
};

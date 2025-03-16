export default {
    path: 'exception',
    id: 'Exception',
    label: 'Exception',
    component: () => import('@/views/exception/index.vue'),
    children: [
        {
            path: '403',
            id: '403',
            label: '403',
            component: () => import('@/views/exception/403/index.vue'),
        },
        {
            path: '404',
            id: '404',
            label: '404',
            component: () => import('@/views/exception/404/index.vue'),
        },
        {
            path: '500',
            id: '500',
            label: '500',
            component: () => import('@/views/exception/500/index.vue'),
        },
    ],
};

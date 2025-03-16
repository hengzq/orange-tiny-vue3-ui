export default {
    path: 'board',
    name: 'Board',
    id: 'Board',
    label: 'Board',
    component: () => import('@/views/board/index.vue'),
    children: [
        {
            path: 'home',
            name: 'Home',
            id: 'Home',
            label: 'Home',
            component: () => import('@/views/board/home/index.vue'),
        },
        {
            path: 'work',
            name: 'Work',
            id: 'Work',
            label: 'Work',
            component: () => import('@/views/board/work/index.vue'),
        },
    ],
};

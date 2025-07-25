/* eslint-disable prefer-template */
import {createRouter, createWebHistory} from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import DefaultLayout from '@/layout/default-layout.vue';
import appRoutes from './routes';
import createRouteGuard from './guard';

NProgress.configure({showSpinner: false}); // NProgress Configuration

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // 本地地址
        {
            path: '/',
            redirect: `${import.meta.env.VITE_CONTEXT}login`,
        },
        {
            path: '/' + import.meta.env.VITE_CONTEXT,
            redirect: `${import.meta.env.VITE_CONTEXT}large-model/chat`,
            // redirect: `${import.meta.env.VITE_CONTEXT}board/home`,
        },
        // 线上地址
        {
            path: import.meta.env.VITE_CONTEXT,
            redirect: {path: `${import.meta.env.VITE_CONTEXT}login`},
        },
        {
            path: import.meta.env.VITE_CONTEXT + 'login',
            name: 'login',
            component: () => import('@/views/login/index.vue'),
            meta: {
                requiresAuth: false,
            },
        },
        {
            name: 'root',
            path: import.meta.env.VITE_CONTEXT,
            component: DefaultLayout,
            children: appRoutes,
        },
        {
            path: import.meta.env.VITE_CONTEXT + 'app-ui/:appId',
            component: () => import('@/views/large-model/app/ui/index.vue'),
            meta: {
                requiresAuth: false,
            },
        },
        {
            path: import.meta.env.VITE_CONTEXT + 'large-model/app-config/:appId',
            component: () => import('@/views/large-model/app/management/config/index.vue'),
            meta: {
                requiresAuth: false,
            },
        },
        {
            path: import.meta.env.VITE_CONTEXT + ':pathMatch(.*)*',
            name: 'notFound',
            redirect: {path: `${import.meta.env.VITE_CONTEXT}exception/404`},
            // component: () => import('@/views/not-found/index.vue'),
        },
    ],
    scrollBehavior() {
        return {top: 0};
    },
});

createRouteGuard(router);

export default router;

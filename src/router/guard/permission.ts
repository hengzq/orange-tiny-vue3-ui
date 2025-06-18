import type {LocationQueryRaw, Router} from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import {useUserStore} from '@/store';
import {isLogin} from '@/utils/auth';
import {isPathMatch} from "@/utils/validate";


const whiteList = [`${import.meta.env.VITE_CONTEXT}login`, `${import.meta.env.VITE_CONTEXT}agent-ui/*`]

const isWhiteList = (path: string) => {
  return whiteList.some(pattern => isPathMatch(pattern, path))
}


export default function setupPermissionGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    NProgress.start();
    const userStore = useUserStore();
    if (isLogin()) {
      if (userStore.rolePermissions?.length !== 0) {
        next();
        NProgress.done();
      } else {
        try {
          userStore.info().then(() => {
            next({...to, replace: true});
            NProgress.done();
          })
        } catch (error) {
          next({
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          });
        }
      }
    } else {
      if (to.name === 'login' || isWhiteList(to.path)) {
        next();
        NProgress.done();
        return;
      }
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
      NProgress.done();
    }
  });
}

import { defineStore } from 'pinia';
import {
  loginMail as userLoginMail,
  updateUserInfo,
  LoginDataMail,
} from '@/api/user';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import * as AuthApi from '@/api/system/auth';
import * as PermissionApi from '@/api/system/permission';
import * as UserApi from '@/api/system/user';
import { MenuVO } from '@/api/system/menu';

import { UserInfo } from './types';

interface UserState extends UserApi.UserVO {
  rolePermissions: string[];
  menus: MenuVO[];
  menuPermissions: string[];
  buttonPermissions: string[];
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    username: 'admin',
    rolePermissions: [],
    menus: [],
    menuPermissions: [],
    buttonPermissions: [],
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return state;
    },
  },

  actions: {
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    async info() {
      const res = await PermissionApi.getUserInfo();
      const { roles } = res.data;
      const userInfo = {
        // rolePermissions: roles.map((item: RoleVO) => item.permission),
        ...res.data,
      };
      this.setInfo(userInfo);
    },

    async updateInfo(data: UserInfo) {
      const res = await updateUserInfo(data);
      this.setInfo(res.data);
    },

    // Login
    async login(loginForm: AuthApi.LoginParam) {
      try {
        const res = await AuthApi.login(loginForm);
        const { token } = res.data;
        setToken(token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    async loginMail(loginForm: LoginDataMail) {
      try {
        const res = await userLoginMail(loginForm);
        setToken(res.data.token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // Logout
    async logout() {
      this.resetInfo();
      clearToken();
      removeRouteListener();
    },
  },
});

export default useUserStore;

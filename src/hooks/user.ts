import {useRouter} from 'vue-router';
import {useI18n} from 'vue-i18n';
import {Modal} from '@opentiny/vue';
import {useUserStore} from '@/store';

export default function useUser() {
    const {t} = useI18n();
    const router = useRouter();
    const userStore = useUserStore();
    const logout = async (logoutTo?: string) => {
        await userStore.logout();
        const currentRoute = router.currentRoute.value;
        Modal.message({
            message: t('setting.loginout'),
            status: 'success',
        });
        router.push({
            path: `${import.meta.env.VITE_CONTEXT}${logoutTo && typeof logoutTo === 'string' ? logoutTo : 'login'}`,
            query: {
                ...router.currentRoute.value.query,
                redirect: currentRoute.path as string,
            },
        });
    };
    return {
        logout,
    };
}

import { useUserStore } from '@/store';
import { ButtonVO } from '@/api/system/button';

export const hasPermission = (resources: ButtonVO[]) => {
  if (!resources) {
    return false;
  }
  const userStore = useUserStore();
  if (!userStore.buttonPermissions) {
    return false;
  }
  return resources.filter((button) => {
    return (
      button.permission &&
      userStore.buttonPermissions.includes(button.permission)
    );
  });
};

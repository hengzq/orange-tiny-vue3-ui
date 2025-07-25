export interface TreeNode {
  id?: string;
  parentId?: string;
  children?: object[];
}

export const listToTreeConverter = (data: TreeNode[]) => {
  //  创建副本，避免修改原始数据
  const copyData = data.map(item => ({...item}));

  const result: object[] = [];
  copyData.forEach((item) => {
    const parent = copyData.find((i) => i.id === item.parentId);
    if (!parent) {
      result.push(item);
      return;
    }
    if (!parent.children) {
      parent.children = [];
    }
    parent.children.push(item);
  });
  return result;
};

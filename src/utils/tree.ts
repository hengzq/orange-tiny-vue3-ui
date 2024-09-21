export interface TreeNode {
  id?: string;
  parentId?: string;
  children?: object[];
}

export const listToTreeConverter = (data: TreeNode[]) => {
  const result: object[] = [];
  data.forEach((item) => {
    const parent = data.find((i) => i.id === item.parentId);
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

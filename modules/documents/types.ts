export type DocumentMeta = {
  id: string;
  title: string;
  slug: string;
  icon: string | null;
  parentId: string | null;
  position: number;
};

export type TreeNode = DocumentMeta & {
  children: TreeNode[];
};

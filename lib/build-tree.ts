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

/**
 * Converts a flat array of documents into a nested tree structure.
 * O(n) time complexity using a map-based approach.
 */
export function buildTree(docs: DocumentMeta[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // First pass: create a TreeNode for each document
  for (const doc of docs) {
    map.set(doc.id, { ...doc, children: [] });
  }

  // Second pass: wire up parent-child relationships
  for (const doc of docs) {
    const node = map.get(doc.id)!;

    if (doc.parentId && map.has(doc.parentId)) {
      map.get(doc.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

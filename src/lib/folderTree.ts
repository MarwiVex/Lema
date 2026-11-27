import type { FolderSummary } from '@/lib/types/ast';

export interface FolderTreeNode extends FolderSummary {
  children: FolderTreeNode[];
  depth: number;
  directItemCount: number;
  totalItemCount: number;
}

export interface FlattenedFolderEntry {
  folder: FolderTreeNode;
  depth: number;
  pathLabel: string;
}

function getDirectItemCount(folder: FolderSummary): number {
  return (folder.documents?.length || 0) + (folder.latexProjects?.length || 0);
}

/**
 * Builds a defensive forest of folder tree nodes from a flat list.
 * Orphaned parentIds or cycles are safely promoted to root nodes.
 */
export function buildFolderTree(folders: FolderSummary[]): FolderTreeNode[] {
  const nodeMap = new Map<string, FolderTreeNode>();
  for (const folder of folders) {
    nodeMap.set(folder.id, {
      ...folder,
      parentId: folder.parentId ?? null,
      children: [],
      depth: 0,
      directItemCount: getDirectItemCount(folder),
      totalItemCount: getDirectItemCount(folder),
    });
  }

  const roots: FolderTreeNode[] = [];

  for (const folder of folders) {
    const node = nodeMap.get(folder.id)!;
    const parentId = node.parentId;
    if (!parentId || parentId === node.id || !nodeMap.has(parentId)) {
      roots.push(node);
      continue;
    }

    // Cycle check: walk ancestors from parentId up to root
    let createsCycle = false;
    let cursor: string | null | undefined = parentId;
    const seen = new Set<string>([node.id]);
    while (cursor) {
      if (seen.has(cursor)) {
        createsCycle = true;
        break;
      }
      seen.add(cursor);
      const parentNode = nodeMap.get(cursor);
      cursor = parentNode?.parentId;
    }

    if (createsCycle) {
      node.parentId = null;
      roots.push(node);
    } else {
      nodeMap.get(parentId)!.children.push(node);
    }
  }

  const finalize = (nodes: FolderTreeNode[], depth: number): number => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    let subtreeSum = 0;
    for (const node of nodes) {
      node.depth = depth;
      const childrenTotal = finalize(node.children, depth + 1);
      node.totalItemCount = node.directItemCount + childrenTotal;
      subtreeSum += node.totalItemCount;
    }
    return subtreeSum;
  };

  finalize(roots, 0);
  return roots;
}

/**
 * Returns the ancestor chain from root down to the target folder [root, ..., parent, folder].
 */
export function getFolderAncestors(folderId: string, folders: FolderSummary[]): FolderSummary[] {
  const byId = new Map(folders.map((f) => [f.id, f]));
  const chain: FolderSummary[] = [];
  const visited = new Set<string>();
  let current: FolderSummary | undefined = byId.get(folderId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return chain;
}

/**
 * Returns a human-readable hierarchical path label (e.g. "Cálculo y Análisis / Cálculo Vectorial").
 */
export function getFolderPathLabel(
  folderId: string,
  folders: FolderSummary[],
  sep = ' / '
): string {
  const ancestors = getFolderAncestors(folderId, folders);
  return ancestors.map((f) => f.name).join(sep);
}

/**
 * Returns a Set containing `folderId` and all of its descendant folder IDs.
 */
export function getDescendantFolderIds(folderId: string, folders: FolderSummary[]): Set<string> {
  const childrenByParent = new Map<string, string[]>();
  for (const f of folders) {
    if (!f.parentId) continue;
    const list = childrenByParent.get(f.parentId) ?? [];
    list.push(f.id);
    childrenByParent.set(f.parentId, list);
  }

  const result = new Set<string>();
  const stack = [folderId];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (result.has(id)) continue;
    result.add(id);
    const children = childrenByParent.get(id);
    if (children) {
      for (const childId of children) {
        if (!result.has(childId)) stack.push(childId);
      }
    }
  }
  return result;
}

/**
 * Pre-order DFS flattening for select dropdowns and move popovers.
 */
export function flattenFolderTree(roots: FolderTreeNode[]): FlattenedFolderEntry[] {
  const entries: FlattenedFolderEntry[] = [];

  const visit = (nodes: FolderTreeNode[], prefixNames: string[]) => {
    for (const node of nodes) {
      const nextNames = [...prefixNames, node.name];
      entries.push({
        folder: node,
        depth: node.depth,
        pathLabel: nextNames.join(' / '),
      });
      if (node.children.length > 0) {
        visit(node.children, nextNames);
      }
    }
  };

  visit(roots, []);
  return entries;
}

function normalizeForFilter(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Filters a folder tree preserving matching nodes and any ancestor of a matching descendant.
 */
export function filterFolderTree(
  roots: FolderTreeNode[],
  normalizedQuery: string
): { nodes: FolderTreeNode[]; autoExpandIds: Set<string> } {
  const q = normalizeForFilter(normalizedQuery).trim();
  if (!q) {
    return { nodes: roots, autoExpandIds: new Set<string>() };
  }

  const autoExpandIds = new Set<string>();

  const filterNodes = (nodes: FolderTreeNode[]): FolderTreeNode[] => {
    const filtered: FolderTreeNode[] = [];
    for (const node of nodes) {
      const selfMatches = normalizeForFilter(node.name).includes(q);
      const filteredChildren = filterNodes(node.children);
      if (selfMatches || filteredChildren.length > 0) {
        if (filteredChildren.length > 0) {
          autoExpandIds.add(node.id);
        }
        filtered.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : selfMatches ? node.children : [],
        });
      }
    }
    return filtered;
  };

  return { nodes: filterNodes(roots), autoExpandIds };
}

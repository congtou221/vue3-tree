import {
  Handler,
  IDragState,
  ITreeNodeInstance,
  LegacyEventTarget,
  TreeNodeData,
} from "typings/treeComponent";

let handlerCache: Handler | null = null;

export const traverseTree = (root: ITreeNodeInstance): TreeNode => {
  const newRoot: TreeNode | Record<string, any> = {};

  for (const k in root) {
    if (k !== "children" && k !== "parent") {
      (newRoot as any)[k] = (root as any)[k];
    }
  }

  if (root.children && root.children.length > 0) {
    (newRoot as any).children = [];
    for (let i = 0, len = root.children.length; i < len; i++) {
      (newRoot as any).children.push(traverseTree(root.children[i]));
    }
  }
  return newRoot as TreeNode;
};

export const addHandler = (
  element: LegacyEventTarget,
  type: string,
  handler: Handler
) => {
  handlerCache = handler;
  if (element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + type, handler as any); // `as any` 因为attachEvent是IE特有，不完全符合标准
  } else {
    (element as any)["on" + type] = handler;
  }
};

export const removeHandler = (element: LegacyEventTarget, type: string) => {
  if (element.removeEventListener) {
    element.removeEventListener(type, handlerCache!, false);
  } else if (element.detachEvent) {
    element.detachEvent("on" + type, handlerCache as any);
  } else {
    (element as any)["on" + type] = null;
  }
};

/**
 * Tree node data struct
 * Created by ayou on 2017/7/20.
 */
export class TreeNode {
  id: number;
  parent: ITreeNodeInstance | null;
  children: ITreeNodeInstance[] | null;
  // isLeaf: boolean;
  name: string | undefined;
  pid: number | undefined;
  dragDisabled: boolean;
  addLeafNodeDisabled: boolean;
  addTreeNodeDisabled: boolean;
  editNodeDisabled: boolean;
  delNodeDisabled: boolean;
  disabled: boolean;
  dragState!: IDragState;

  constructor(data: TreeNodeData, allDisable?: boolean) {
    const { id } = data;
    this.id = typeof id === "undefined" ? new Date().valueOf() : id;
    this.parent = null;
    this.children = null;
    // this.isLeaf = !!isLeaf;
    this.dragDisabled = allDisable ?? false;
    this.addLeafNodeDisabled = allDisable ?? false;
    this.addTreeNodeDisabled = allDisable ?? false;
    this.editNodeDisabled = allDisable ?? false;
    this.delNodeDisabled = allDisable ?? false;
    this.disabled = false;
    this.dragState = {
      /**顶部锚点状态 */
      isDragEnterUpAnchor: false,

      /**顶部 */
      isDragEnterUp: false,

      /**底部锚点状态 */
      isDragEnterBottomAnchor: false,
      isDragEnterBottomAnchorByPreAnchor: false,
      isDragEnterBottomAnchorByChild: false,
      isChildDragEnterBottom: false,

      /**底部 */
      isDragEnterBottom: false,
      isDragEnterBottomByPreAnchor: false, // 鼠标移入上层锚点触发：底部激活态

      /**节点内部 */
      isDragEnterNode: false,
    };

    // other params
    for (const k in data) {
      if (k !== "id" && k !== "children" && k !== "isLeaf") {
        (this as any)[k] = data[k];
      }
    }
  }

  changeName(name: string): void {
    this.name = name;
  }

  addChildren(children: TreeNode[] | TreeNode): void {
    if (!this.children) {
      this.children = [];
    }

    if (Array.isArray(children)) {
      for (let i = 0, len = children.length; i < len; i++) {
        const child = children[i];
        child.parent = this;
        child.pid = this.id;
      }
      this.children.push(...children);
    } else {
      const child: TreeNode = children;
      child.parent = this;
      child.pid = this.id;
      this.children.push(child);
    }
  }

  // remove self
  remove(): void {
    const parent = this.parent;
    const index = parent?.findChildIndex(this);
    if (index !== undefined) {
      (parent?.children || []).splice(index, 1);
    }
  }

  // remove child
  _removeChild(child: ITreeNodeInstance): void {
    for (let i = 0, len = this.children?.length || 0; i < len; i++) {
      if (this.children![i].id === child.id) {
        (this.children || []).splice(i, 1);
        break;
      }
    }
  }

  isTargetChild(target: ITreeNodeInstance): boolean {
    let parent = target.parent;
    while (parent) {
      if (parent === this) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }

  moveInto(target: ITreeNodeInstance): void {
    if (this.name === "root" || this === target) {
      return;
    }

    // cannot move ancestor to child
    if (this.isTargetChild(target)) {
      return;
    }

    // cannot move to leaf node
    // Tip: every node can be moved into

    // if (target.isLeaf) {
    //   return;
    // }

    this.parent?._removeChild(this);
    this.parent = target;
    this.pid = target.id;
    if (!target.children) {
      target.children = [];
    }
    target.children.unshift(this);
  }

  findChildIndex(child: ITreeNodeInstance): number {
    let index = -1;
    for (
      let i = 0, len = (this.children ? this.children : []).length;
      i < len;
      i++
    ) {
      if ((this.children ? this.children : [])[i] === child) {
        index = i;
        break;
      }
    }
    return index;
  }

  _canInsert(target: ITreeNodeInstance): boolean {
    if (this.name === "root" || this === target) {
      return false;
    }

    // cannot insert ancestor to child
    if (this.isTargetChild(target)) {
      return false;
    }

    this.parent?._removeChild(this);
    this.parent = target.parent;
    this.pid = target.parent?.id;
    return true;
  }

  insertBefore(target: ITreeNodeInstance): void {
    if (!this._canInsert(target)) return;

    const pos = target.parent?.findChildIndex(target);
    if (pos !== undefined) {
      (target.parent?.children ? target.parent.children : []).splice(
        pos,
        0,
        this
      );
    }
  }

  insertAfter(target: ITreeNodeInstance): void {
    if (!this._canInsert(target)) return;

    const pos = target.parent?.findChildIndex(target);
    if (pos !== undefined) {
      (target.parent?.children ? target.parent?.children : []).splice(
        pos + 1,
        0,
        this
      );
    }
  }

  toString(): string {
    return JSON.stringify(traverseTree(this));
  }
}

/**
 * Tree data model
 */

export const getTreeData = (
  data: TreeNodeData[],
  allDisabled?: boolean
): ITreeNodeInstance => {
  const root = new TreeNode({ name: "root", id: 0 }, allDisabled);

  const initNode = (node: TreeNode, data: TreeNodeData[]) => {
    for (let i = 0, len = data.length; i < len; i++) {
      const _data = data[i];

      const child = new TreeNode(_data, allDisabled);
      if (_data.children && _data.children.length > 0) {
        initNode(child, _data.children);
      }
      node.addChildren(child);
    }
  };

  initNode(root, data);
  return root;
};

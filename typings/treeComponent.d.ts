import { PropType, ComputedRef, Ref, ExtractPropTypes } from "vue";

export type Handler = (...args: any[]) => void;

export type LegacyEventTarget = EventTarget & {
  attachEvent?: (eventName: string, callback: any) => void;
  detachEvent?: (eventName: string, callback: any) => void;
};

/**
 * TreeNode interface
 */
export interface TreeNodeData {
  name: string;
  isLeaf?: boolean;
  id?: number;
  dragDisabled?: boolean;
  disabled?: boolean;
  [key: string]: any;
}

// 定义 ITreeNodeInstance 接口
export interface ITreeNodeInstance {
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
  dragState: IDragState;

  // 公共方法签名
  changeName(newName: string): void;
  addChildren(newChildren: ITreeNodeInstance[] | ITreeNodeInstance): void;
  remove(): void;
  _removeChild(child: ITreeNodeInstance): void;
  isTargetChild(target: ITreeNodeInstance): boolean;
  moveInto(target: ITreeNodeInstance): void;
  findChildIndex(child: ITreeNodeInstance): number;
  _canInsert(target: ITreeNodeInstance): boolean;
  insertBefore(target: ITreeNodeInstance): void;
  insertAfter(target: ITreeNodeInstance): void;
  toString(): string;
  getLocation?(): number[];
}

export type VueTree = DefineComponent<TreeComponent>;

export interface TreeComponent {
  model: {
    type: PropType<ITreeNodeInstance>;
    required: true;
  };
  defaultLeafNodeName: {
    type: PropType<string>;
    required: false;
  };
  defaultTreeNodeName: {
    type: PropType<string>;
    required: false;
  };
  defaultAddTreeNodeTitle: {
    type: PropType<string>;
    required: false;
  };
  defaultAddLeafNodeTitle: {
    type: PropType<string>;
    required: false;
  };
  defaultExpanded: {
    type: PropType<boolean>;
    required: false;
  };
  editable: {
    type: PropType<boolean>;
    required: false;
  };
}

// 假设你的TreeComponent有props、data、methods等
export type TreeComponentProps = ExtractPropTypes<TreeComponent>;

export interface TreeComponentData {
  isHover: Ref<boolean>;
  editable: Ref<boolean>;
  isDragEnterUp: Ref<boolean>;
  isDragEnterBottom: Ref<boolean>;
  isDragEnterNode: Ref<boolean>;
  expanded: Ref<boolean>;
  model: Ref<ITreeNodeInstance>;
  menuCard: Ref<HTMLDivElement | null>;
  addCard: Ref<HTMLDivElement | null>;
  showActiveStyle: Ref<boolean>;
  showMenuCard: Ref<boolean>;
  showAddCard: Ref<boolean>;
  fakeDragNode: Ref<HTMLDivElement | null>;
  asyncComponentReady: Ref<boolean>;
  nodeInput: Ref<HTMLInputElement | null>;
}

export interface TreeComponentComputed {
  caretClass: ComputedRef<string>;
  isFolder: ComputedRef<boolean>;
  treeNodeClass: ComputedRef<Record<string, boolean>>;
}

export interface TreeComponentEmits {
  "change-name": (
    id: number,
    oldName: string,
    newName: string,
    eventType: string
  ) => void;
  "delete-node": (model: ITreeNodeInstance) => void;
  "end-edit": (id: number, oldName: string, newName: string) => void;
  click: (toggle: () => void) => void;
  "add-node": () => void;
  drop: (node: ITreeNodeInstance) => void;
  "drop-before": (
    target: ITreeNodeInstance,
    node: ITreeNodeInstance,
    src: ITreeNodeInstance | null
  ) => void;
  "drop-after": (
    target: ITreeNodeInstance,
    node: ITreeNodeInstance,
    src: ITreeNodeInstance | null
  ) => void;
}
interface TreeComponentMethods {
  updateName: (e: Event) => void;
  delNode: () => void;
  setEditable: () => void;
  setUnEditable: (e: KeyboardEvent | FocusEvent) => void;
  toggle: () => void;
  mouseOver: () => void;
  mouseOut: () => void;
  click: () => void;
  addChild: (isLeaf: boolean) => void;
  dragStart: (e: DragEvent) => boolean;
  dragWithCustomImage: (event: DragEvent) => void;
  dragEnd: () => void;
  dragOver: (e: DragEvent) => boolean;
  dragEnter: () => void;
  dragLeave: () => void;
  drop: () => void;
  dragEnterUp: () => void;
  dragOverUp: (e: DragEvent) => boolean;
  dragLeaveUp: () => void;
  dropBefore: () => void;
  dragEnterBottom: () => void;
  dragOverBottom: (e: DragEvent) => boolean;
  dragLeaveBottom: () => void;
  dropAfter: () => void;
  showMenu: () => void;
  showAdd: () => void;
  clickHandler: (event: MouseEvent) => void;
}
interface TreeComponentWatches {
  // 定义Watches
  showActiveStyle: (isActive: boolean) => void;
  showMenuCard: (showMenu: boolean) => void;
  showAddCard: (showAdd: boolean) => void;
}

export interface SlotProps {
  [key: string]: any;
}

export interface IDragState {
  /** 顶部锚点  */
  // 激活态
  isDragEnterUpAnchor: boolean; // 拖拽进入顶部锚点：自身激活态
  // 阴影态 DONE:remove
  // isChildDragEnterUp: boolean; // 拖拽进入顶部触发：上层锚点阴影态
  // 计算树状结构顶部层级 DONE:remove
  // upTriggeredByUpAnchorIndex: number; // 展开的树状结构顶部锚点只有一个

  /** 顶部 */
  isDragEnterUp: boolean; // 拖拽进入顶部：自身激活态
  // TODO: ADD 上层激活态，根据 upTriggeredByUpAnchorIndex 计算得出

  /** 底部锚点 */
  // 激活态
  isDragEnterBottomAnchor: boolean; // 拖拽进入底部锚点：自身激活态
  isDragEnterBottomAnchorByPreAnchor: boolean; // 鼠标移入上层锚点触发：激活态
  // 阴影态
  isDragEnterBottomAnchorByChild: boolean; // 鼠标移入下层锚点触发：上层锚点阴影态 TODO: remove
  isChildDragEnterBottom: boolean; // 鼠标移入叶子节点触发：上层锚点阴影态
  // TODO: ADD 上层激活态 根据 showBottomIsDragEnterBottomAnchorIds 计算得出

  /** 底部 */
  // 激活态
  isDragEnterBottom: boolean; // 拖拽进入底部 ： 底部激活态
  // 被上层激活态
  isDragEnterBottomByPreAnchor: boolean; // 鼠标移入上层锚点触发：底部激活态
  // TODO: ADD 上层激活态 根据 showBottomIsDragEnterBottomAnchorIds 计算得出

  /** 节点内部 */
  isDragEnterNode: boolean; // 拖拽进入节点 ： 激活态
}
export interface SlotProps {
  model: ITreeNodeInstance;
}

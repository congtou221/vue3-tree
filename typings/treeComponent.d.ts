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
  isLeaf: boolean;
  name: string | undefined;
  pid: number | undefined;
  dragDisabled: boolean;
  addLeafNodeDisabled: boolean;
  addTreeNodeDisabled: boolean;
  editNodeDisabled: boolean;
  delNodeDisabled: boolean;
  disabled: boolean;

  // 公共方法签名
  changeName(newName: string): void;
  addChildren(newChildren: ITreeNodeInstance[] | ITreeNodeInstance): void;
  remove(): void;
  _removeChild(child: ITreeNodeInstance): void;
  isTargetChild(target: ITreeNodeInstance): boolean;
  moveInto(target: ITreeNodeInstance): void;
  findChildIndex(child: ITreeNodeInstance): void;
  _canInsert(target: ITreeNodeInstance): boolean;
  insertBefore(target: ITreeNodeInstance): void;
  insertAfter(target: ITreeNodeInstance): void;
  toString(): string;
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

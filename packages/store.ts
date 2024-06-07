import { VueElement, reactive } from "vue"
import { TreeNode } from "./Tree/src/treeModel"

type EnhancedVueElement<T> = VueElement & {
  model: TreeNode // 替换'any'为modal的实际类型
}

// 然后，你可以定义CompInOperationType为增强后的VueElement或null
export type CompInOperationType = EnhancedVueElement<Record<string, any>> | null
interface StoreData {
  compInOperation: CompInOperationType
  activatedKey: number
  showMenuCardId: number | null
  showAddCardId: number | null
  isDragging: number
  wholeTreeNode: TreeNode | null
  operationExpanded: boolean
  setComInOperation: (comp: CompInOperationType) => void
  setActivatedKey: (key: number) => void
  setShowMenuCardId: (id: number | null) => void
  setShowAddCardId: (id: number | null) => void
  setDragging: (isDragging: number) => void
  setWholeTreeNode: (tree: TreeNode) => void
  setComInOperationExpaned: (expanded: boolean) => void
}

const data: StoreData = {
  compInOperation: null,
  activatedKey: 0,
  showMenuCardId: -1,
  showAddCardId: -1,
  isDragging: 0,
  wholeTreeNode: null,
  operationExpanded: false,
  setComInOperation(comp: CompInOperationType) {
    this.compInOperation = comp
  },
  setActivatedKey(key: number) {
    this.activatedKey = key
  },
  setShowMenuCardId(key: number | null) {
    this.showMenuCardId = key
  },
  setShowAddCardId(key: number | null) {
    this.showAddCardId = key
  },
  setDragging(isDragging: number) {
    this.isDragging = isDragging
  },
  setWholeTreeNode(tree: TreeNode) {
    this.wholeTreeNode = tree
  },
  setComInOperationExpaned(expanded: boolean) {
    this.operationExpanded = expanded
  },
}

const store = reactive(data)
export default store

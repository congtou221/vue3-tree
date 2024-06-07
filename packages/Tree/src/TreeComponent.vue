<template>
  <div class="vtl">
    <div
      v-if="model.name !== 'root'"
      :id="`${model.id}`"
      class="vtl-node"
      :class="{ 'vtl-leaf-node': model.isLeaf, 'vtl-tree-node': !model.isLeaf }"
      @click="click"
    >
      <div
        class="vtl-border vtl-up"
        :class="{
          'vtl-active': isDragEnterUp,
          'vtl-anchor-active':
            props.isDragEnterUpAnchor && upTriggeredByUpAnchorIndex === 1,
        }"
        v-if="
          model.parent &&
          model.parent.children &&
          model.parent.children.length > 0 &&
          model.parent.findChildIndex(model) === 0 &&
          expanded
        "
        @drop="dropBefore"
        @dragenter="dragEnterUp"
        @dragover="dragOverUp"
        @dragleave="dragLeaveUp"
      />
      <div
        :class="treeNodeClass"
        :draggable="!model.dragDisabled"
        @dragstart="dragStart"
        @dragover="dragOver"
        @dragenter="dragEnter"
        @dragleave="dragLeave"
        @drop="drop"
        @dragend="dragEnd"
        @mouseover="mouseOver"
        @mouseout="mouseOut"
      >
        <span
          v-if="model.children && model.children.length > 0"
          class="vtl-caret vtl-is-small"
        >
          <i
            class="vtl-icon"
            :class="caretClass"
            @click.prevent.stop="toggle"
          />
        </span>
        <span v-if="model.isLeaf">
          <slot name="leafNodeIcon" :expanded="expanded" :model="model">
            <i class="vtl-icon vtl-menu-icon vtl-icon-file" />
          </slot>
        </span>
        <span v-else>
          <slot name="treeNodeIcon" :expanded="expanded" :model="model">
            <i class="vtl-icon vtl-menu-icon vtl-icon-folder" />
          </slot>
        </span>
        <div v-if="!editable" class="vtl-node-content">
          <slot name="leafNameDisplay" :expanded="expanded" :model="model">
            {{ model.name }}
          </slot>
        </div>
        <input
          v-else
          ref="nodeInput"
          class="vtl-input"
          type="text"
          :value="model.name"
          @input="updateName"
          @blur="setUnEditable"
          @keyup.enter="setUnEditable"
        />
        <div
          v-show="
            isHover ||
            model.id === store.activatedKey ||
            showMenuCard ||
            showAddCard
          "
          class="vtl-operation"
        >
          <!-- <span
            v-if="!model.addTreeNodeDisabled"
            :title="defaultAddTreeNodeTitle"
            @click.stop.prevent="addChild(false)"
          >
            <slot name="addTreeNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-folder-plus-e" />
            </slot>
          </span> -->
          <span
            v-if="!model.addLeafNodeDisabled && !model.isLeaf"
            :title="defaultAddLeafNodeTitle"
            @click.stop.prevent="showAdd()"
          >
            <slot name="addLeafNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-plus" />
            </slot>
          </span>
          <span
            v-if="!model.addTreeNodeDisabled"
            :title="defaultAddTreeNodeTitle"
            @click.stop.prevent="showMenu()"
          >
            <slot name="menuIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-flicker" />
            </slot>
          </span>
        </div>
      </div>
      <div v-if="showAddCard" class="vtl-actived-menu-wrapper">
        <div class="vtl-actived-menu" ref="addCard">
          <ul class="vtl-menu-list">
            <li
              v-if="!model.editNodeDisabled"
              :title="defaultAddLeafNodeTitle"
              class="vtl-menu-item"
              @click.stop.prevent="addChild(true)"
            >
              <slot name="editNodeIcon" :expanded="expanded" :model="model">
                <i class="vtl-icon vtl-icon-plus" />
                <span class="vtl-menu-item-title">文档</span>
              </slot>
            </li>

            <li
              v-if="!model.editNodeDisabled"
              :title="defaultAddTreeNodeTitle"
              class="vtl-menu-item"
              @click.stop.prevent="addChild(false)"
            >
              <slot name="editNodeIcon" :expanded="expanded" :model="model">
                <i class="vtl-icon vtl-icon-folder-plus-e" />
                <span class="vtl-menu-item-title">文件夹</span>
              </slot>
            </li>
          </ul>
        </div>
        <div class="vtl-actived-menu-bg" @click="clickHandler"></div>
      </div>
      <div v-if="showMenuCard" class="vtl-actived-menu-wrapper">
        <div class="vtl-actived-menu" ref="menuCard">
          <ul class="vtl-menu-list">
            <li
              v-if="!model.editNodeDisabled"
              title="edit"
              class="vtl-menu-item"
              @click.stop.prevent="setEditable"
            >
              <slot name="editNodeIcon" :expanded="expanded" :model="model">
                <i class="vtl-icon vtl-icon-edit" />
                <span class="vtl-menu-item-title">重命名</span>
              </slot>
            </li>

            <li
              v-if="!model.delNodeDisabled"
              title="delete"
              class="vtl-menu-item"
              @click.stop.prevent="delNode"
            >
              <slot name="delNodeIcon" :expanded="expanded" :model="model">
                <i class="vtl-icon vtl-icon-trash" />
                <span class="vtl-menu-item-title">删除</span>
              </slot>
            </li>
          </ul>
        </div>
        <div class="vtl-actived-menu-bg" @click="clickHandler"></div>
      </div>
      <div
        v-if="!(model.children && model.children.length > 0 && expanded)"
        class="vtl-border vtl-bottom"
        :class="{
          'vtl-active': isDragEnterBottom,
          'vtl-anchor-active':
            props.showBottomIsDragEnterBottomAnchorIds &&
            props.showBottomIsDragEnterBottomAnchorIds.includes(model.id),
        }"
        @drop="dropAfter"
        @dragenter="dragEnterBottom"
        @dragover="dragOverBottom"
        @dragleave="dragLeaveBottom"
      />
    </div>

    <div
      v-if="model.children && model.children.length"
      :class="{
        'vtl-root': model.name === 'root',
        'vtl-tree-margin': model.name !== 'root',
        hidden: !(model.name === 'root' || expanded),
      }"
    >
      <div
        v-if="
          model.name !== 'root' &&
          model.children &&
          model.children.length > 0 &&
          expanded
        "
        class="vtl-border vtl-up-anchor"
        :class="{
          'vtl-active-shade': isChildDragEnterUp,
          'vtl-active': isDragEnterUpAnchor,
        }"
        @drop="dropAfterUpAnchor"
        @dragenter="dragEnterUpAnchor"
        @dragover="dragOverUpAnchor"
        @dragleave="dragLeaveUpAnchor"
      />
      <component
        :is="AsyncDynamicComponent"
        v-for="model in model.children"
        :key="model.id"
        :default-tree-node-name="defaultTreeNodeName"
        :default-leaf-node-name="defaultLeafNodeName"
        :default-expanded="defaultExpanded"
        :model="model"
        :isDragEnterUpAnchor="props.isDragEnterUpAnchor || isDragEnterUpAnchor"
        :isDragEnterBottomAnchor="
          props.isDragEnterBottomAnchor || isDragEnterBottomAnchor
        "
        :upTriggeredByUpAnchorIndex="upTriggeredByUpAnchorIndex"
        :isLastChildren="isLastChildren"
        :showBottomIsDragEnterBottomAnchorIds="
          showBottomIsDragEnterBottomAnchorIds.length
            ? showBottomIsDragEnterBottomAnchorIds
            : props.showBottomIsDragEnterBottomAnchorIds
        "
        @enter-bottom="onChildEnterBottom"
        @enter-up="onChildEnterUp"
        @leave-bottom="onChildLeaveBottom"
        @leave-up="onChildLeaveUp"
        @enter-bottom-anchor="onChildEnterBottomAnchor"
        @leave-bottom-anchor="onChildLeaveBottomAnchor"
        @leave-up-anchor="onChildLeaveUpAnchor"
      >
        <template v-slot:leafNameDisplay="slotProps">
          <slot name="leafNameDisplay" v-bind="slotProps" />
        </template>
        <!-- <template #addTreeNodeIcon="slotProps">
          <slot name="addTreeNodeIcon" v-bind="slotProps" />
        </template>
        <template #addLeafNodeIcon="slotProps">
          <slot name="addLeafNodeIcon" v-bind="slotProps" />
        </template>
        <template #editNodeIcon="slotProps">
          <slot name="editNodeIcon" v-bind="slotProps" />
        </template>
        <template #delNodeIcon="slotProps">
          <slot name="delNodeIcon" v-bind="slotProps" />
        </template> -->
        <template v-slot:leafNodeIcon="slotProps">
          <slot name="leafNodeIcon" v-bind="slotProps" />
        </template>
        <template v-slot:treeNodeIcon="slotProps">
          <slot name="treeNodeIcon" v-bind="slotProps" />
        </template>
      </component>
    </div>
    <div
      v-if="
        model.name !== 'root' &&
        model.children &&
        model.children.length > 0 &&
        expanded &&
        !isLastChildOfTree(model, store.wholeTreeNode)
      "
      class="vtl-border vtl-bottom-anchor"
      :class="{
        'vtl-active': isDragEnterBottomAnchor,
        'vtl-active-anchor':
          props.showBottomIsDragEnterBottomAnchorIds &&
          props.showBottomIsDragEnterBottomAnchorIds.includes(model.id),
        'vtl-active-shade':
          isChildDragEnterBottom || isDragEnterBottomAnchorByChild,
      }"
      @drop="dropAfterBottomAnchor"
      @dragenter="dragEnterBottomAnchor"
      @dragover="dragOverBottomAnchor"
      @dragleave="dragLeaveBottomAnchor"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
  watchEffect,
  computed,
  ref,
  reactive,
  nextTick,
} from "vue"
import { TreeNode, removeHandler } from "./treeModel"
import eventBus from "~/eventBus"
import store, { CompInOperationType } from "~/store"
import { ITreeNodeInstance } from "typings/treeComponent"
import {
  isLastChildOfSubTree,
  isLastChildrenOfSubTree,
  isLastChildOfTree,
} from "~/utils"

const props = defineProps<{
  model: ITreeNodeInstance
  defaultLeafNodeName?: string
  defaultTreeNodeName?: string
  defaultAddTreeNodeTitle?: string
  defaultAddLeafNodeTitle?: string
  defaultExpanded?: boolean
  editable?: boolean
  isDragEnterBottomAnchor?: boolean
  isDragEnterUpAnchor?: boolean
  upTriggeredByUpAnchorIndex?: number
  isLastChildren?: boolean
  showBottomIsDragEnterBottomAnchorIds?: number[]
}>()

const emit = defineEmits([
  "change-name",
  "delete-node",
  "end-edit",
  "click",
  "add-node",
  "drop",
  "drop-before",
  "drop-after",
  "enter-up",
  "enter-bottom",
  "leave-up",
  "leave-bottom",
  "enter-bottom-anchor",
  "leave-bottom-anchor",
  "leave-up-anchor",
  "enter-up-anchor",
])
const DefaultTreedNode = new TreeNode({ name: "root", isLeaf: false, id: 0 })
const isHover = ref<boolean>(false)
const editable = ref<boolean>(props.editable || false)
const isDragEnterUp = ref<boolean>(false)
const isDragEnterUpAnchor = ref<boolean>(props.isDragEnterUpAnchor || false)
const isDragEnterBottom = ref<boolean>(false)
const isDragEnterBottomAnchor = ref<boolean>(
  props.isDragEnterBottomAnchor || false
)
const isChildDragEnterBottom = ref<boolean>(false)
const isChildDragEnterUp = ref<boolean>(false)
const isDragEnterBottomAnchorByChild = ref<boolean>(false)
const isDragEnterUpAnchorByChild = ref<boolean>(false)

const showBottomIsDragEnterBottomAnchorIds = ref<number[]>([])

const isDragEnterNode = ref<boolean>(false)
const expanded = ref<boolean>(props.defaultExpanded || true)
const model = reactive<ITreeNodeInstance>(props?.model || DefaultTreedNode)
// 定义一个ref来引用DOM元素
const menuCard = ref<HTMLDivElement | null>(null)
const addCard = ref<HTMLDivElement | null>(null)
const showActiveStyle = ref<boolean>(false)
const showMenuCard = ref<boolean>(false)
const showAddCard = ref<boolean>(false)

const fakeDragNode = ref<HTMLDivElement | null>(null)

const asyncComponentReady = ref(false)
const nodeInput = ref<HTMLInputElement | null>(null)

const isLastChild = computed(() =>
  isLastChildOfSubTree(model, store.wholeTreeNode)
)

const isLastChildren = computed(
  () =>
    isLastChildrenOfSubTree(model, store.wholeTreeNode) || props.isLastChildren
)

const upTriggeredByUpAnchorIndex = computed(
  () =>
    (props.upTriggeredByUpAnchorIndex || 0) +
    (props.isDragEnterUpAnchor ? 1 : 0)
)

const caretClass = computed(() =>
  expanded.value ? "vtl-icon-caret-down" : "vtl-icon-caret-right"
)

const isFolder = computed(() => {
  return Boolean(model.children && model.children.length)
})

const treeNodeClass = computed(() => ({
  "vtl-node-main": true,
  "vtl-active": isDragEnterNode.value,
  "vtl-drag-disabled": model.dragDisabled,
  "vtl-disabled": model.disabled,
  "vtl-selected": showActiveStyle.value,
}))

// 在数据操作函数中加入异常处理逻辑
const updateName = (e: Event) => {
  try {
    const target = e.target as HTMLInputElement
    const model = props.model
    const oldName = model.name
    if (target && target.type === "text") {
      model.changeName(target.value)
      eventBus.emit("change-name", {
        id: model.id,
        oldName: oldName,
        newName: target.value,
        node: model,
      })
    }
  } catch (error) {
    console.error("Error updating name:", error)
  }
}

const onChildEnterUp = (e: Event) => {
  isChildDragEnterUp.value = true
}

const onChildEnterBottom = (level: number) => {
  isChildDragEnterBottom.value = true
  const isLast = isLastChildOfSubTree(model, store.wholeTreeNode)

  if (isLast || level > 0) {
    emit("enter-bottom", --level)
  }
}

const onChildLeaveUp = (e: Event) => {
  isChildDragEnterUp.value = false
}

const onChildLeaveBottom = (e: Event) => {
  isChildDragEnterBottom.value = false
  emit("leave-bottom")
}

const onChildEnterBottomAnchor = (isLast: boolean, level: number) => {
  isDragEnterBottomAnchorByChild.value = true
  if (level > 0) {
    emit("enter-bottom-anchor", isLast, --level)
  }
}
const onChildLeaveBottomAnchor = () => {
  isDragEnterBottomAnchorByChild.value = false
  showBottomIsDragEnterBottomAnchorIds.value = []
  emit("leave-bottom-anchor")
}
const onChildLeaveUpAnchor = () => {
  isChildDragEnterUp.value = false
}
const delNode = () => {
  store.setShowMenuCardId(null)
  eventBus.emit("delete-node", props.model)
  props.model.remove()
}

const setEditable = () => {
  editable.value = true
  store.setShowMenuCardId(null)
  watchEffect(() => {
    // 确保在 DOM 更新后聚焦并设置光标位置
    if (nodeInput.value) {
      nodeInput.value.focus()
      nodeInput.value.setSelectionRange(0, nodeInput.value.value.length)
    }
  })
}
const setUnEditable = (e: KeyboardEvent | FocusEvent) => {
  if (editable.value === false) return
  editable.value = false
  const target = e.target as HTMLInputElement
  const model = props.model
  const oldName = model.name
  if (target && target.type === "text") {
    model.changeName(target.value)
    eventBus.emit("change-name", {
      id: model.id,
      oldName: oldName,
      newName: target.value,
      eventType: "blur",
    })
    eventBus.emit("end-edit", {
      id: model.id,
      oldName: oldName,
      newName: target.value,
    })
  }
}

const toggle = async () => {
  if (isFolder) {
    expanded.value = !expanded.value
  }
}
const mouseOver = () => {
  if (model.disabled) return
  isHover.value = true
}
const mouseOut = () => {
  isHover.value = false
}

const click = () => {
  eventBus.emit("click", {
    toggle: toggle,
    ...props.model,
  })
  store.setActivatedKey(model.id)
}

const addChild = (isLeaf: boolean) => {
  const name = isLeaf
    ? props.defaultLeafNodeName || "Leaf Node"
    : props.defaultTreeNodeName || "Tree Node"
  expanded.value = true
  var node = new TreeNode({ name, isLeaf })
  props.model.addChildren(node)
  eventBus.emit("add-node", node)
}

const dragStart = (e: DragEvent) => {
  if (!(props.model.dragDisabled || props.model.disabled)) {
    store.setComInOperation(props as unknown as CompInOperationType)
    store.setDragging(model.id)
    store.setComInOperationExpaned(expanded.value)

    initFakeDragNode()
    dragWithCustomImage(e)

    // if (expanded.value) {
    expanded.value = false
    // }

    // for firefox
    if (!e.dataTransfer) return
    e.dataTransfer.setData("data", "data")
    e.dataTransfer.effectAllowed = "move"
    return true
  }
  return false
}

function dragWithCustomImage(event: DragEvent) {
  if (!fakeDragNode.value) return
  fakeDragNode.value.innerHTML = model.name || ""
  var dt = event.dataTransfer
  if (!dt) return
  dt.setData("text/plain", "Data to Drag")
  dt.setDragImage(fakeDragNode.value, 0, -10)
}

const dragEnd = () => {
  expanded.value = store.operationExpanded
  store.setComInOperation(null)
  removeFakeDragNode()
}

const dragOver = (e: DragEvent) => {
  e.preventDefault()
  return true
}

let lastenter = ref<EventTarget | null>(null)
const dragEnter = (e: DragEvent) => {
  if (!store.compInOperation) return

  if (store.compInOperation?.model.id === props.model.id) return

  isDragEnterNode.value = true
  lastenter.value = e.target
  console.log("#dragEnter", e.target)
}

const dragLeave = (e: DragEvent) => {
  if (e.target === lastenter.value) {
    isDragEnterNode.value = false
    console.log("#dragLeave", e.target)
  }
}

const drop = () => {
  if (!store.compInOperation) return
  const oldParent = store.compInOperation.model.parent
  const model = props.model
  store.compInOperation.model.moveInto(model)
  isDragEnterNode.value = false
  eventBus.emit("drop", {
    target: model,
    node: store.compInOperation.model,
    src: oldParent,
  })
  removeFakeDragNode()
}

const dragEnterUp = () => {
  if (!store.compInOperation) return
  isDragEnterUp.value = true

  emit("enter-up")
}
const dragOverUp = (e: DragEvent) => {
  e.preventDefault()
  return true
}
const dragLeaveUp = () => {
  if (!store.compInOperation) return
  isDragEnterUp.value = false
  emit("leave-up")
  emit("leave-up-anchor")
}
const dragEnterUpAnchor = () => {
  if (!store.compInOperation) return
  isDragEnterUpAnchor.value = true
}
const dragOverUpAnchor = (e: DragEvent) => {
  e.preventDefault()
  return true
}
const dragLeaveUpAnchor = () => {
  if (!store.compInOperation) return
  isDragEnterUpAnchor.value = false
  emit("leave-up")
}
const dropBefore = () => {
  if (!store.compInOperation) return
  const oldParent = store.compInOperation.model.parent
  const model = props.model
  store.compInOperation.model.insertBefore(model)
  isDragEnterUp.value = false
  isChildDragEnterUp.value = false
  eventBus.emit("drop-before", {
    target: model,
    node: store.compInOperation.model,
    src: oldParent,
  })
  emit("leave-up-anchor")
}
const hasBrothers = computed(
  () =>
    model.parent && model.parent.children && model.parent?.children?.length > 1
  // 倒数第二个兄弟
)
const dragEnterBottom = () => {
  if (!store.compInOperation) return
  isDragEnterBottom.value = true

  let node: TreeNode | null = model.parent
  let _model: ITreeNodeInstance | null = model
  let level = 0

  while (
    node &&
    node.children &&
    node.name !== "root" &&
    _model &&
    node?.findChildIndex(_model) === node.children?.length - 1
  ) {
    level++
    node = node.parent
    _model = _model?.parent || null
  }
  if (
    (!model.children &&
      model.parent &&
      model.parent.children &&
      model.parent?.findChildIndex(model) ===
        model.parent.children?.length - 1 &&
      level > 0) ||
    isLastChild.value
  )
    emit("enter-bottom", --level)
}
const dragOverBottom = (e: DragEvent) => {
  e.preventDefault()
  return true
}
const dragLeaveBottom = () => {
  if (!store.compInOperation) return
  isDragEnterBottom.value = false

  emit("leave-bottom")
}
const dragEnterBottomAnchor = () => {
  if (!store.compInOperation) return
  isDragEnterBottomAnchor.value = true

  let node: TreeNode | null = model.parent
  let _model: ITreeNodeInstance | null = model
  let level = 0
  while (
    node &&
    node.children &&
    node.name !== "root" &&
    _model &&
    node?.findChildIndex(_model) === node.children?.length - 1
  ) {
    level++
    node = node.parent
    _model = _model?.parent || null
  }

  let nextLevel = 0
  node = model
  while (node && node.children) {
    nextLevel++
    node = node.children[node.children.length - 1]
  }
  let ifShow = false
  let $model: ITreeNodeInstance | null = model
  let triggeredIds = props.showBottomIsDragEnterBottomAnchorIds?.concat() || []

  while (nextLevel > 0) {
    // ifShow =
    //   ifShow ||
    //   Boolean(
    //     $model &&
    //       $model.parent &&
    //       $model.parent.children &&
    //       $model.parent.findChildIndex($model) ===
    //         $model?.parent.children.length - 1
    // )
    let child: ITreeNodeInstance | null =
      $model && $model.children
        ? $model.children[$model.children.length - 1]
        : null
    if (child && child.id && !triggeredIds.includes(child.id)) {
      // console.log(111222666, ifShow, child, triggeredIds)
      console.log(111222, triggeredIds, child.id)
      triggeredIds.push(child.id)
    }

    $model = child
    --nextLevel
  }

  showBottomIsDragEnterBottomAnchorIds.value = triggeredIds

  if (
    model.parent &&
    model.parent.children &&
    model.parent?.findChildIndex(model) === model.parent.children?.length - 1 &&
    level > 0
  ) {
    // console.log("enter-bottom-anchor1-after", isLastChildren.value, level)

    emit("enter-bottom-anchor", isLastChildren.value, --level)
  }
}
const dragOverBottomAnchor = (e: DragEvent) => {
  e.preventDefault()
  return true
}
const dragLeaveBottomAnchor = () => {
  if (!store.compInOperation) return
  isDragEnterBottomAnchor.value = false
  showBottomIsDragEnterBottomAnchorIds.value = []
  emit("leave-bottom-anchor")
}
const dropAfter = () => {
  if (!store.compInOperation) return
  if (!props.model) return
  const oldParent = store.compInOperation.model?.parent
  const model = props.model
  store.compInOperation.model?.insertAfter(model)
  isDragEnterBottom.value = false
  eventBus.emit("drop-after", {
    target: model,
    node: store.compInOperation.model,
    src: oldParent,
  })
  emit("leave-bottom")
}
const dropAfterBottomAnchor = () => {
  if (!store.compInOperation) return
  if (!props.model) return
  const oldParent = store.compInOperation.model?.parent
  const model = props.model
  store.compInOperation.model?.insertAfter(model)
  isDragEnterBottomAnchor.value = false
  showBottomIsDragEnterBottomAnchorIds.value = []
  eventBus.emit("drop-after-bottomanchor", {
    target: model,
    node: store.compInOperation.model,
    src: oldParent,
  })
  emit("leave-bottom-anchor")
}
const dropAfterUpAnchor = () => {
  if (!store.compInOperation) return
  if (!props.model) return
  const oldParent = store.compInOperation.model?.parent
  const model = props.model
  store.compInOperation.model?.insertAfter(model)
  isDragEnterUpAnchor.value = false
  eventBus.emit("drop-after-upanchor", {
    target: model,
    node: store.compInOperation.model,
    src: oldParent,
  })
}

const showMenu = () => {
  // store.setIsShowingCardType(CardType.Menu);
  store.setShowMenuCardId(model.id)
}

const showAdd = () => {
  store.setShowAddCardId(model.id)
  // store.setIsShowingCardType(CardType.Add);
}

const clickHandler = (event: MouseEvent) => {
  const isMenuCard =
    menuCard.value &&
    event.target instanceof Node &&
    menuCard.value.contains(event.target)

  const isAddCard =
    addCard.value &&
    event.target instanceof Node &&
    addCard.value.contains(event.target)

  // 如果点击发生在protectedElement之外
  if (!(isMenuCard || isAddCard)) {
    store.setShowMenuCardId(null)
    store.setShowAddCardId(null)
    // store.setIsShowingCardType(null);
    unregisterEventBusListeners()

    // 如果需要的话，还可以阻止事件冒泡等进一步处理
    event.stopPropagation()
  }
}

const initFakeDragNode = () => {
  const dragNode = document.createElement("div")
  dragNode.className = "fake-drag-node"
  dragNode.style.cssText =
    "position: fixed;left: -100%;background: #f5f5f5;z-index: 9999;width: 300px;font: 14px;padding: 0 14px;border-radius: 2px;"
  fakeDragNode.value = dragNode

  document.body.appendChild(dragNode)
}

const removeFakeDragNode = () => {
  const dragNode = fakeDragNode.value
  if (dragNode && document.body.contains(dragNode)) {
    document.body.removeChild(dragNode)
  }
}
const registerEventBusListeners = () => {
  eventBus.on("click", (params) => {
    emit("click", params)
  })
  eventBus.on("change-name", (params) => {
    emit("change-name", params)
  })
  eventBus.on("delete-node", (params) => {
    emit("delete-node", params)
  })
  eventBus.on("end-edit", (params) => {
    emit("end-edit", params)
  })
  eventBus.on("add-node", (params) => {
    emit("add-node", params)
  })
  eventBus.on("drop", (params) => {
    emit("drop", params)
  })
  eventBus.on("drop-before", (params) => {
    emit("drop-before", params)
  })
  eventBus.on("drop-after", (params) => {
    emit("drop-after", params)
  })
}

const unregisterEventBusListeners = () => {
  eventBus.off("click")
  eventBus.off("change-name")
  eventBus.off("delete-node")
  eventBus.off("end-edit")
  eventBus.off("add-node")
  eventBus.off("drop")
  eventBus.off("drop-before")
  eventBus.off("drop-after")
}

const AsyncDynamicComponent = defineAsyncComponent(() =>
  import("./TreeComponent.vue").then((module) => module.default)
)

const loadAsyncComponent = async () => {
  await AsyncDynamicComponent
  asyncComponentReady.value = true
}

const saveWholeTreeNode = () => {
  if (model.name === "root") {
    store.setWholeTreeNode(model)
  }
}

onMounted(() => {
  saveWholeTreeNode()
  loadAsyncComponent()
  registerEventBusListeners()
})

onBeforeUnmount(() => {
  unregisterEventBusListeners()
  removeHandler(window, "keyup")
})

watchEffect(() => {
  showActiveStyle.value =
    !(model.disabled || model.dragDisabled) && model.id === store.activatedKey
  showMenuCard.value =
    !(model.disabled || model.dragDisabled) && model.id === store.showMenuCardId
  showAddCard.value =
    !(model.disabled || model.dragDisabled) && model.id === store.showAddCardId
})
</script>

<style lang="less" rel="stylesheet/less">
@selected-background-color: #e6fff9;
@brand-color: #00d8c8;
@hover-color: #25e6d2;
@click-color: #00b3ad;
@dark-brand-color: #03bbad;
@dark-selected-background-color: #112626;
@dark-hover-color: #079389;
@dark-click-color: #23d1bf;
@disable-color: rgba(0, 0, 0, 0.25);
@dark-disable-color: rgba(255, 255, 255, 0.25);
@border-color: rgba(217, 217, 217, 1);
@dark-border-color: rgba(66, 66, 66, 1);
@background-color: #f5f5f5;
@dark-background-color: #000000;
@dash-border-color: #050505;
@dark-dash-border-color: #000000;
@border-color: #d9d9d9;
@dark-border-color: #424242;
@disabled-color: rgba(0, 0, 0, 0.25);
@dark-disabled-color: rgba(151, 151, 151, 1);
@second-font-color: rgba(0, 0, 0, 0.65);
@dark-second-font-color: rgba(255, 255, 255, 0.65);
@first-font-color: rgba(0, 0, 0, 0.88);
@dark-first-font-color: rgba(255, 255, 255, 0.88);
@main-font-color: rgba(0, 0, 0, 0.88);
@dark-main-font-color: rgba(255, 255, 255, 0.85);

@font-face {
  font-family: "icomoon";
  src: url("../../assets/fonts/icomoon.eot?ui1hbx");
  src:
    url("../../assets/fonts/icomoon.eot?ui1hbx#iefix")
      format("embedded-opentype"),
    url("../../assets/fonts/icomoon.ttf?ui1hbx") format("truetype"),
    url("../../assets/fonts/icomoon.woff?ui1hbx") format("woff"),
    url("../../assets/fonts/icomoon.svg?ui1hbx#icomoon") format("svg");
  font-weight: normal;
  font-style: normal;
}

.vtl {
  .vtl-root {
    padding: 2px;
  }

  .vtl-icon {
    /* use !important to prevent issues with browser extensions that change fonts */
    font-family: "icomoon" !important;
    speak: none;
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
    margin: 4px;

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &.vtl-menu-icon {
      margin-right: 4px;

      &:hover {
        color: inherit;
      }
    }
  }

  .vtl-icon-caret-down,
  .vtl-icon-caret-right,
  .vtl-icon-plus,
  .vtl-icon-flicker {
    &:hover {
      cursor: pointer;
      background-color: @border-color;
    }

    &:hover-darkmode {
      cursor: pointer;
      background-color: @dark-border-color;
    }
  }

  .vtl-icon-file:before {
    content: "\e906";
  }

  .vtl-icon-folder:before {
    content: "\e907";
  }

  .vtl-icon-caret-down:before {
    content: "\e901";
  }

  .vtl-icon-caret-right:before {
    content: "\e900";
  }

  .vtl-icon-edit:before {
    content: "\e902";
  }

  .vtl-icon-folder-plus-e:before {
    content: "\e903";
  }

  .vtl-icon-plus:before {
    content: "\e904";
  }

  .vtl-icon-trash:before {
    content: "\e905";
  }

  .vtl-icon-flicker:before {
    content: "\e908";
  }

  .vtl-border {
    position: absolute;
    z-index: 1000;
    height: 2px;
    width: 100%;

    &.vtl-up {
      margin-bottom: 2px;
      margin-top: -5px;
      background-color: transparent;
    }

    &.vtl-up-anchor {
      position: absolute;
      width: calc(2rem - 4px);
      margin-left: -2rem;
      margin-top: -5px;
      z-index: 1000;
    }

    &.vtl-bottom {
      background-color: transparent;
    }

    &.vtl-bottom-anchor {
      position: absolute;
      width: calc(2rem - 4px);
      z-index: 1000;
      margin-top: -5px;
    }

    &.vtl-active-shade {
      border-bottom: 2px solid @disable-color;
    }

    &.vtl-active {
      border-bottom: 2px solid @click-color;
      /*background-color: blue;*/
      &::after {
        content: ""; /* 伪元素必须有内容 */
        position: absolute; /* 脱离文档流，便于定位 */

        border-top: 3px solid transparent; /* 修改为顶部透明 */
        border-bottom: 3px solid transparent; /* 修改为底部透明 */
        border-left: 4px solid @click-color; /* 将有颜色的边设置为左侧，形成向右的箭头 */

        margin-top: -2px;
        top: 0px;
        margin-left: -3px;

        z-index: 1000;
      }
    }

    &.vtl-active-anchor {
      border-bottom: 2px solid @click-color;
    }

    &.vtl-anchor-active {
      border-bottom: 2px solid @click-color;
    }

    &.vtl-active-darkmode {
      border-bottom: 2px solid @dark-click-color;
      /*background-color: blue;*/
    }
  }
  .vtl-node {
    position: relative;
    margin: 5px 0;
    .vtl-node-main {
      display: flex;
      align-items: center;
      padding: 5px 0 5px 1rem;
      .vtl-node-content {
        flex: 1 auto;
        & {
          cursor: pointer;
        }
      }

      .vtl-input {
        border: none;
        max-width: 150px;
        border-bottom: 1px solid @click-color;
      }

      .vtl-input-darkmode {
        border: none;
        max-width: 150px;
        border-bottom: 1px solid @dark-click-color;
      }

      &:hover {
        background-color: #f0f0f0;
      }

      &.vtl-active {
        outline: 2px dashed @dark-hover-color;
        background-color: @selected-background-color;
      }
      &.vtl-selected {
        background-color: @selected-background-color;
        color: @click-color;
      }

      &.vtl-active-darkmode {
        outline: 2px dashed @dark-selected-background-color;
        background-color: @dark-selected-background-color;
      }

      .vtl-caret {
        margin-left: -1rem;
      }

      .vtl-operation {
        margin-left: auto;
        letter-spacing: 1px;
      }
    }
  }

  .vtl-disabled {
    color: @disable-color;
    &:hover {
      cursor: not-allowed;
    }
  }
  .vtl-disabled-darkmode {
    color: @dark-disable-color;
    &:hover {
      cursor: not-allowed;
    }
  }
  .vtl-drag-disabled,
  .vtl-disabled {
    .vtl-node-content {
      &:hover {
        cursor: not-allowed;
      }
    }
  }
  .vtl-item {
    cursor: pointer;
  }

  .vtl-tree-margin {
    margin-left: 2em;
  }

  .vtl-actived-menu-wrapper {
    .vtl-actived-menu-bg {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }

    .vtl-actived-menu {
      position: absolute;
      min-width: 144px;
      right: 0;
      border: 1px solid @border-color;
      border-radius: 5px;
      z-index: 99999;
      background-color: white;

      .vtl-menu-list {
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
        position: relative;
        margin: 0;
        padding: 2px 0px;
        text-align: left;
        list-style-type: none;
        box-shadow: var(--shadow-s4-down);
        border: 1px solid var(--line-border-card);
        overflow-y: overlay;

        .vtl-menu-item {
          line-height: 22px;
          margin: 1px 3px;
          padding: 4px 8px;
          border-radius: 4px;

          &:hover {
            background-color: @background-color;
            cursor: pointer;
          }
        }
      }
    }
  }

  .fake-drag-node {
    position: fixed;
    left: -100%;
    background: @background-color;
    z-index: 9999;
    width: 300px;
    font: 14px;
    padding: 0 14px;
    border-radius: 2px;
  }
  .hidden {
    display: none;
  }
}
</style>

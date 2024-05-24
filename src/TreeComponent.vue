<template>
  <div class="vtl">
    <div
      v-if="model.name !== 'root'"
      :id="model.id"
      class="vtl-node"
      :class="{ 'vtl-leaf-node': model.isLeaf, 'vtl-tree-node': !model.isLeaf }"
      @click="click"
    >
      <div
        class="vtl-border vtl-up"
        :class="{
          'vtl-active': isDragEnterUp,
        }"
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
          class="vtl-operation"
          v-show="
            isHover ||
            model.id === store.activatedKey ||
            showMenuCard ||
            showAddCard
          "
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
            v-if="!model.addLeafNodeDisabled"
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
      <div v-if="showAddCard" ref="addCard" class="vtl-actived-menu">
        <ul class="vtl-menu-list">
          <li
            v-if="!model.editNodeDisabled"
            :title="defaultAddLeafNodeTitle"
            @click.stop.prevent="addChild(true)"
            class="vtl-menu-item"
          >
            <slot name="editNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-plus" />
              <span class="vtl-menu-item-title">文档</span>
            </slot>
          </li>

          <li
            v-if="!model.editNodeDisabled"
            :title="defaultAddTreeNodeTitle"
            @click.stop.prevent="addChild(false)"
            class="vtl-menu-item"
          >
            <slot name="editNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-folder-plus-e" />
              <span class="vtl-menu-item-title">文件夹</span>
            </slot>
          </li>
        </ul>
      </div>
      <div v-if="showMenuCard" ref="menuCard" class="vtl-actived-menu">
        <ul class="vtl-menu-list">
          <li
            v-if="!model.editNodeDisabled"
            title="edit"
            @click.stop.prevent="setEditable"
            class="vtl-menu-item"
          >
            <slot name="editNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-edit" />
              <span class="vtl-menu-item-title">重命名</span>
            </slot>
          </li>

          <li
            v-if="!model.delNodeDisabled"
            title="delete"
            @click.stop.prevent="delNode"
            class="vtl-menu-item"
          >
            <slot name="delNodeIcon" :expanded="expanded" :model="model">
              <i class="vtl-icon vtl-icon-trash" />
              <span class="vtl-menu-item-title">删除</span>
            </slot>
          </li>
        </ul>
      </div>
      <div
        v-if="model.children && model.children.length > 0 && expanded"
        class="vtl-border vtl-bottom"
        :class="{ 'vtl-active': isDragEnterBottom }"
        @drop="dropAfter"
        @dragenter="dragEnterBottom"
        @dragover="dragOverBottom"
        @dragleave="dragLeaveBottom"
      />
    </div>

    <div
      v-show="model.name === 'root' || expanded"
      v-if="model.children && model.children.length"
      :class="{ 'vtl-tree-margin': model.name !== 'root' }"
    >
      <component
        :is="AsyncDynamicComponent"
        v-for="model in model.children"
        :key="model.id"
        :default-tree-node-name="defaultTreeNodeName"
        :default-leaf-node-name="defaultLeafNodeName"
        :default-expanded="defaultExpanded"
        :model="model"
      >
        <template #leafNameDisplay="slotProps">
          <slot name="leafNameDisplay" v-bind="slotProps" />
        </template>
        <template #addTreeNodeIcon="slotProps">
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
        </template>
        <template #leafNodeIcon="slotProps">
          <slot name="leafNodeIcon" v-bind="slotProps" />
        </template>
        <template #treeNodeIcon="slotProps">
          <slot name="treeNodeIcon" v-bind="slotProps" />
        </template>
      </component>
    </div>
  </div>
</template>

<script setup>
import {
  onMounted,
  onBeforeUnmount,
  defineAsyncComponent,
  watchEffect,
} from "vue";
import { computed, ref, reactive } from "@vue/reactivity";
import { TreeNode, removeHandler } from "./treeModel.ts";
import eventBus from "./eventBus.ts";
import store from "./store.ts";

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  defaultLeafNodeName: {
    type: String,
    default: () => "Leaf Node",
  },
  defaultTreeNodeName: {
    type: String,
    default: () => "Tree Node",
  },
  defaultAddTreeNodeTitle: {
    type: String,
    default: () => "Add Tree Node",
  },
  defaultAddLeafNodeTitle: {
    type: String,
    default: () => "Add Leaf Node",
  },
  defaultExpanded: {
    type: Boolean,
    default: () => true,
  },
});

const emit = defineEmits([
  "change-name",
  "delete-node",
  "end-edit",
  "click",
  "add-node",
  "drop",
  "drop-before",
  "drop-after",
]);

const isHover = ref(false);
const editable = ref(props.editable || false);
const isDragEnterUp = ref(false);
const isDragEnterBottom = ref(false);
const isDragEnterNode = ref(false);
const expanded = ref(props.defaultExpanded);
const model = reactive(props.model);
// 定义一个ref来引用DOM元素
const menuCard = ref(null);
const addCard = ref(null);
const showActiveStyle = ref(false);
const showMenuCard = ref(false);
const showAddCard = ref(false);

const fakeDragNode = ref(null);

// 将一些操作封装成计算属性以提高代码复用性和可读性
const rootNode = computed(() => {
  let node = props.$parent;
  while (node?._props.model.name !== "root") {
    node = node.$parent;
  }
  return node;
});

const caretClass = computed(() =>
  expanded.value ? "vtl-icon-caret-down" : "vtl-icon-caret-right"
);

const isFolder = computed(() => {
  return Boolean(model.children && model.children.length);
});

const treeNodeClass = computed(() => ({
  "vtl-node-main": true,
  "vtl-active": isDragEnterNode.value,
  "vtl-drag-disabled": model.dragDisabled,
  "vtl-disabled": model.disabled,
  "vtl-selected": showActiveStyle.value,
}));

// 在数据操作函数中加入异常处理逻辑
const updateName = (e) => {
  try {
    const oldName = props.model.name;
    props.model.changeName(e.target.value);
    console.log("update Name");
    eventBus.emit("change-name", {
      id: props.model.id,
      oldName: oldName,
      newName: e.target.value,
      node: props.model,
    });
  } catch (error) {
    console.error("Error updating name:", error);
  }
};

const delNode = () => eventBus.emit("delete-node", props.model);
const nodeInput = ref(null);

const setEditable = () => {
  editable.value = true;
  watchEffect(() => {
    // 确保在 DOM 更新后聚焦并设置光标位置
    if (nodeInput.value) {
      nodeInput.value.focus();
      nodeInput.value.setSelectionRange(0, nodeInput.value.value.length);
    }
  });
};
const setUnEditable = (e) => {
  if (editable.value === false) return;
  editable.value = false;
  const oldName = props.model.name;
  props.model.changeName(e.target.value);
  eventBus.emit("change-name", {
    id: props.model.id,
    oldName: oldName,
    newName: e.target.value,
    eventType: "blur",
  });
  eventBus.emit("end-edit", {
    id: props.model.id,
    oldName: oldName,
    newName: e.target.value,
  });
};

const toggle = () => {
  if (isFolder) {
    expanded.value = !expanded.value;
  }
};
const mouseOver = () => {
  if (model.disabled) return;
  isHover.value = true;
};
const mouseOut = () => {
  isHover.value = false;
};

const click = () => {
  eventBus.emit("click", {
    toggle: props.toggle,
    ...props.model,
  });
  store.setActivatedKey(model.id);
  console.log("vtl-selected1", model.id, store.activatedKey);
};

watchEffect(() => {
  showActiveStyle.value =
    !(model.disabled || model.dragDisabled) && model.id === store.activatedKey;
  showMenuCard.value =
    !(model.disabled || model.dragDisabled) &&
    model.id === store.showMenuCardId;
  showAddCard.value =
    !(model.disabled || model.dragDisabled) && model.id === store.showAddCardId;
});

const addChild = (isLeaf) => {
  const name = isLeaf ? props.defaultLeafNodeName : props.defaultTreeNodeName;
  expanded.value = true;
  var node = new TreeNode({ name, isLeaf });
  props.model.addChildren(node, true);
  eventBus.emit("add-node", node);
};

const dragStart = (e) => {
  if (!(props.model.dragDisabled || props.model.disabled)) {
    store.setComInOperation(props);
    store.setDragging(model.id);
    // for firefox
    e.dataTransfer.setData("data", "data");
    e.dataTransfer.effectAllowed = "move";
    initFakeDragNode();

    dragWithCustomImage(e);
    return true;
  }
  return false;
};

function dragWithCustomImage(event) {
  if (!fakeDragNode.value) return;
  fakeDragNode.value.innerHTML = model.name;
  var dt = event.dataTransfer;
  dt.setData("text/plain", "Data to Drag");
  dt.setDragImage(fakeDragNode.value, 0, 0);
}

const dragEnd = () => {
  store.setComInOperation(null);
  store.setDragging(null);
  removeFakeDragNode();
};

const dragOver = (e) => {
  e.preventDefault();
  return true;
};
const dragEnter = () => {
  if (!store.compInOperation) return;

  if (store.compInOperation.model.id === props.model.id) return;
  isDragEnterNode.value = true;
};

const dragLeave = () => {
  isDragEnterNode.value = false;
};

const drop = () => {
  if (!store.compInOperation) return;
  const oldParent = store.compInOperation.model.parent;
  store.compInOperation.model.moveInto(props.model);
  isDragEnterNode.value = false;
  eventBus.emit("drop", {
    target: props.model,
    node: store.compInOperation.model,
    src: oldParent,
  });
  removeFakeDragNode();
};

const dragEnterUp = () => {
  if (!store.compInOperation) return;
  isDragEnterUp.value = true;

  console.log("dragEnterUp", store.compInOperation, isDragEnterUp);
};
const dragOverUp = (e) => {
  e.preventDefault();
  return true;
};
const dragLeaveUp = () => {
  if (!store.compInOperation) return;
  isDragEnterUp.value = false;
};
const dropBefore = () => {
  if (!store.compInOperation) return;
  const oldParent = store.compInOperation.model.parent;
  store.compInOperation.model.insertBefore(props.model);
  isDragEnterUp.value = false;
  eventBus.emit("drop-before", {
    target: props.model,
    node: store.compInOperation.model,
    src: oldParent,
  });
};

const dragEnterBottom = () => {
  if (!store.compInOperation) return;
  isDragEnterBottom.value = true;
};
const dragOverBottom = (e) => {
  e.preventDefault();
  return true;
};
const dragLeaveBottom = () => {
  if (!store.compInOperation) return;
  isDragEnterBottom.value = false;
};
const dropAfter = () => {
  if (!store.compInOperation) return;
  const oldParent = store.compInOperation.model.parent;
  store.compInOperation.model.insertAfter(props.model);
  isDragEnterBottom.value = false;
  eventBus.emit("drop-after", {
    target: props.model,
    node: store.compInOperation.model,
    src: oldParent,
  });
};

const showMenu = () => {
  showMenuCard.value = true;
  store.setShowMenuCardId(model.id);
};

const showAdd = () => {
  showAddCard.value = true;
  store.setShowAddCardId(model.id);
};

const asyncComponentReady = ref(false);
const AsyncDynamicComponent = defineAsyncComponent(() =>
  import("./TreeComponent.vue").then((module) => module.default)
);
const loadAsyncComponent = async () => {
  await AsyncDynamicComponent;
  asyncComponentReady.value = true;
};
const registerEventBusListeners = () => {
  eventBus.on("click", (params) => {
    emit("click", params);
  });
  eventBus.on("change-name", (params) => {
    emit("change-name", params);
  });
  eventBus.on("delete-node", (params) => {
    emit("delete-node", params);
  });
  eventBus.on("end-edit", (params) => {
    emit("end-edit", params);
  });
  eventBus.on("add-node", (params) => {
    emit("add-node", params);
  });
  eventBus.on("drop", (params) => {
    emit("drop", params);
  });
  eventBus.on("drop-before", (params) => {
    emit("drop-before", params);
  });
  eventBus.on("drop-after", (params) => {
    emit("drop-after", params);
  });
};

const unregisterEventBusListeners = () => {
  eventBus.off("click");
  eventBus.off("change-name");
  eventBus.off("delete-node");
  eventBus.off("end-edit");
  eventBus.off("add-node");
  eventBus.off("drop");
  eventBus.off("drop-before");
  eventBus.off("drop-after");
};

const clickHandler = (event) => {
  const isClickInside =
    (menuCard.value && menuCard.value.contains(event.target)) ||
    (addCard.value && addCard.value.contains(event.target));

  // 如果点击发生在protectedElement之外
  if (!isClickInside) {
    showMenuCard.value = false;
    // 在这里执行你的逻辑
    store.setShowMenuCardId(null);
    store.setShowAddCardId(null);
    //   !(model.disabled || model.dragDisabled) &&
    //   model.id === store.activatedKey;
    // 如果需要的话，还可以阻止事件冒泡等进一步处理
    event.stopPropagation();
  }
};
const registerDomListeners = () => {
  document.addEventListener("click", clickHandler);
};

const unregisterDomListeners = () => {
  document.removeEventListener("click", clickHandler);
};

const initFakeDragNode = () => {
  const dragNode = document.createElement("div");
  dragNode.className = "fake-drag-node";
  dragNode.style.cssText =
    "position: fixed;left: -100%;background: #f5f5f5;z-index: 9999;width: 300px;font: 14px;padding: 0 14px;border-radius: 2px;";
  fakeDragNode.value = dragNode;

  document.body.appendChild(dragNode);
};

const removeFakeDragNode = () => {
  const dragNode = fakeDragNode.value;
  if (dragNode && document.body.contains(dragNode)) {
    document.body.removeChild(dragNode);
  }
};

onMounted(() => {
  loadAsyncComponent();
  registerEventBusListeners();
  registerDomListeners();
});

onBeforeUnmount(() => {
  unregisterEventBusListeners();
  unregisterDomListeners();
  removeHandler(window, "keyup");
});
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
  src: url("./assets/fonts/icomoon.eot?ui1hbx");
  src:
    url("./assets/fonts/icomoon.eot?ui1hbx#iefix") format("embedded-opentype"),
    url("./assets/fonts/icomoon.ttf?ui1hbx") format("truetype"),
    url("./assets/fonts/icomoon.woff?ui1hbx") format("woff"),
    url("./assets/fonts/icomoon.svg?ui1hbx#icomoon") format("svg");
  font-weight: normal;
  font-style: normal;
}
.vtl {
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
    height: 5px;

    &.vtl-up {
      margin-top: -5px;
      background-color: transparent;
    }

    &.vtl-bottom {
      background-color: transparent;
    }

    &.vtl-active {
      border-bottom: 2px solid @click-color;
      /*background-color: blue;*/
    }

    &.vtl-active-darkmode {
      border-bottom: 2px solid @dark-click-color;
      /*background-color: blue;*/
    }
  }
  .vtl-node {
    position: relative;
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
  .vtl-actived-menu {
    position: absolute;
    min-width: 144px;
    right: 0;
    background-color: white;
    z-index: 1000;
    border: 1px solid @border-color;
    border-radius: 5px;
    margin-right: 10px;
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
}
</style>

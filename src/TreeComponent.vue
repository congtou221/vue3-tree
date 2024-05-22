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
        :class="{ 'vtl-active': isDragEnterUp }"
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
        <div v-show="isHover" class="vtl-operation">
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
            @click.stop.prevent="addChild(true)"
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
              ...
            </slot>
          </span>
        </div>
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
const key = ref(props.key);
// 定义一个ref来引用DOM元素
const menuCard = ref(null);

// // 将一些操作封装成计算属性以提高代码复用性和可读性
// const rootNode = computed(() => {
//   let node = props.$parent;
//   while (node?._props.model.name !== "root") {
//     node = node.$parent;
//   }
//   return node;
// });

const caretClass = computed(() =>
  expanded.value ? "vtl-icon-caret-down" : "vtl-icon-caret-right"
);

const isFolder = computed(() => {
  return Boolean(model.children && model.children.length);
});

const treeNodeClass = computed(() => {
  const {
    model: { dragDisabled, disabled },
  } = props;
  return {
    "vtl-node-main": true,
    "vtl-active": isDragEnterNode.value,
    "vtl-drag-disabled": dragDisabled,
    "vtl-disabled": disabled,
  };
});

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
};

const addChild = (isLeaf) => {
  const name = isLeaf ? props.defaultLeafNodeName : props.defaultTreeNodeName;
  expanded.value = true;
  var node = new TreeNode({ name, isLeaf });
  props.model.addChildren(node, true);
  eventBus.emit("add-node", node);
  store.setActivatedKey(key.value);
};

const dragStart = (e) => {
  if (!(props.model.dragDisabled || props.model.disabled)) {
    store.setComInOperation(props);
    // for firefox
    e.dataTransfer.setData("data", "data");
    e.dataTransfer.effectAllowed = "move";
    return true;
  }
  return false;
};

const dragEnd = () => {
  console.log(999, "dragEnd");
  store.setComInOperation(null);
};

const dragOver = (e) => {
  e.preventDefault();
  return true;
};
const dragEnter = () => {
  console.log(999, "dragEnter1", store.compInOperation);

  if (!store.compInOperation) return;
  console.log(
    999,
    "dragEnter2",
    store.compInOperation.model.id === props.model.id,
    !store.compInOperation,
    props.model.isLeaf
  );
  if (store.compInOperation.model.id === props.model.id) return;
  isDragEnterNode.value = true;

  console.log(999, "dragEnter3", isDragEnterNode.value);
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
  store.setActivatedKey(key.value);
};

onBeforeUnmount(() => {
  removeHandler(window, "keyup");
});

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
const registerDomListeners = () => {
  document.addEventListener("click", function (event) {
    // 判断点击的是否是protectedElement本身，或者是它的子元素
    const isClickInside = menuCard.value.contains(event.target);

    // 如果点击发生在protectedElement之外
    if (!isClickInside) {
      // 在这里执行你的逻辑
      store.setActivatedKey(null);

      // 如果需要的话，还可以阻止事件冒泡等进一步处理
      // event.stopPropagation();
    }
  });
};
onMounted(() => {
  loadAsyncComponent();
  registerEventBusListeners();
  registerDomListeners();
});
</script>

<style lang="less" rel="stylesheet/less">
@selected-background-color: #e6fff9;
@brand-color: #00d8c8;
@hover-color: #25e6d2;
@click-color: #25e6d2;
@dark-brand-color: #03bbad;
@dark-selected-background-color: #112626;
@dark-hover-color: #079389;
@dark-click-color: #23d1bf;
@disable-color: rgba(0, 0, 0, 0.25);
@dark-disable-color: rgba(255, 255, 255, 0.25);

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

    /* Better Font Rendering =========== */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    &.vtl-menu-icon {
      margin-right: 4px;

      &:hover {
        color: inherit;
      }
    }

    &:hover {
      color: @hover-color;
    }

    &:hover-darkmode {
      color: @dark-hover-color;
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

  .vtl-node-main {
    display: flex;
    align-items: center;
    padding: 5px 0 5px 1rem;
    .vtl-node-content {
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
      outline: 2px dashed @selected-background-color;
    }

    &.vtl-active-darkmode {
      outline: 2px dashed @dark-selected-background-color;
    }

    .vtl-caret {
      margin-left: -1rem;
    }

    .vtl-operation {
      margin-left: auto;
      letter-spacing: 1px;
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
  .vtl-item {
    cursor: pointer;
  }

  .vtl-tree-margin {
    margin-left: 2em;
  }
  .vtl-actived-menu {
    position: absolute;
  }
}
</style>

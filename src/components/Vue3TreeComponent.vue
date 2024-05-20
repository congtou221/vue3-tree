<template>
  <div class="vtl">
    <div v-if="model.name !== 'root'" :id="model.id" class="vtl-node"
      :class="{ 'vtl-leaf-node': model.isLeaf, 'vtl-tree-node': !model.isLeaf }">
      <div class="vtl-border vtl-up" :class="{ 'vtl-active': isDragEnterUp }" @drop="dropBefore"
        @dragenter="dragEnterUp" @dragover="dragOverUp" @dragleave="dragLeaveUp" />
      <div :class="treeNodeClass" :draggable="!model.dragDisabled" @dragstart="dragStart" @dragover="dragOver"
        @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop" @dragend="dragEnd" @mouseover="mouseOver"
        @mouseout="mouseOut" @click.stop="click">
        <span v-if="model.children && model.children.length > 0" class="vtl-caret vtl-is-small">
          <i class="vtl-icon" :class="caretClass" @click.prevent.stop="toggle" />
        </span>

        <span v-if="model.isLeaf">
          <slot name="leafNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
            <i class="vtl-icon vtl-menu-icon vtl-icon-file" />
          </slot>
        </span>
        <span v-else>
          <slot name="treeNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
            <i class="vtl-icon vtl-menu-icon vtl-icon-folder" />
          </slot>
        </span>

        <div v-if="!editable" class="vtl-node-content">
          <slot name="leafNameDisplay" :expanded="expanded" :model="model" :root="rootNode">
            {{ model.name }}
          </slot>
        </div>
        <input v-else ref="nodeInput" class="vtl-input" type="text" :value="model.name" @input="updateName"
          @blur="setUnEditable" @keyup.enter="setUnEditable" />
        <div v-show="isHover" class="vtl-operation">
          <span v-if="!model.isLeaf && !model.addTreeNodeDisabled" :title="defaultAddTreeNodeTitle"
            @click.stop.prevent="addChild(false)">
            <slot name="addTreeNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
              <i class="vtl-icon vtl-icon-folder-plus-e" />
            </slot>
          </span>
          <span v-if="!model.isLeaf && !model.addLeafNodeDisabled" :title="defaultAddLeafNodeTitle"
            @click.stop.prevent="addChild(true)">
            <slot name="addLeafNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
              <i class="vtl-icon vtl-icon-plus" />
            </slot>
          </span>
          <span v-if="!model.editNodeDisabled" title="edit" @click.stop.prevent="setEditable">
            <slot name="editNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
              <i class="vtl-icon vtl-icon-edit" />
            </slot>
          </span>
          <span v-if="!model.delNodeDisabled" title="delete" @click.stop.prevent="delNode">
            <slot name="delNodeIcon" :expanded="expanded" :model="model" :root="rootNode">
              <i class="vtl-icon vtl-icon-trash" />
            </slot>
          </span>
        </div>
      </div>
      <div v-if="model.children && model.children.length > 0 && expanded" class="vtl-border vtl-bottom"
        :class="{ 'vtl-active': isDragEnterBottom }" @drop="dropAfter" @dragenter="dragEnterBottom"
        @dragover="dragOverBottom" @dragleave="dragLeaveBottom" />
    </div>

    <div v-show="model.name === 'root' || expanded" v-if="isFolder"
      :class="{ 'vtl-tree-margin': model.name !== 'root' }">
      <item v-for="model in model.children" :key="model.id" :default-tree-node-name="defaultTreeNodeName"
        :default-leaf-node-name="defaultLeafNodeName" :default-expanded="defaultExpanded" :model="model">
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
      </item>
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount } from 'vue';
import { computed, ref } from "@vue/reactivity";
import { TreeNode, removeHandler } from "../Vue3TreeModel.ts";

let compInOperation = null;

export default {
  name: "VueTreeList",
  props: {
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
  },
  setup(props, { emit }) {
    let isHover = ref(false);
    let editable = ref(props.editable || false);
    let isDragEnterUp = ref(false);
    let isDragEnterBottom = ref(false);
    let isDragEnterNode = ref(false);
    let expanded = ref(props.defaultExpanded);

    // 将一些操作封装成计算属性以提高代码复用性和可读性
    const rootNode = computed(() => {
      let node = props.$parent;
      while (node._props.model.name !== "root") {
        node = node.$parent;
      }
      return node;
    });

    const caretClass = computed(() => {
      return props.expanded ? "vtl-icon-caret-down" : "vtl-icon-caret-right";
    });

    const isFolder = computed(() => {
      return props.model.children && props.model.children.length;
    });

    const treeNodeClass = computed(() => {
      const {
        model: { dragDisabled, disabled },
        isDragEnterNode,
      } = props;

      return {
        "vtl-node-main": true,
        "vtl-active": isDragEnterNode,
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
        emit("change-name", {
          id: props.model.id,
          oldName: oldName,
          newName: e.target.value,
          node: props.model,
        });
      } catch (error) {
        console.error("Error updating name:", error);
      }
    };

    const delNode = () => emit("delete-node", props.model);
    const setEditable = () => {
      editable.value = true;
      props.$nextTick(() => {
        const $input = props.$refs.nodeInput;
        $input.focus();
        $input.setSelectionRange(0, $input.value.length);
      });
    };
    const setUnEditable = (e) => {
      if (editable.value === false) return;
      editable.value = false;
      const oldName = props.model.name;
      props.model.changeName(e.target.value);
      emit("change-name", {
        id: props.model.id,
        oldName: oldName,
        newName: e.target.value,
        eventType: "blur",
      });
      emit("end-edit", {
        id: props.model.id,
        oldName: oldName,
        newName: e.target.value,
      });
    };

    const toggle = () => {
      if (props.isFolder) {
        expanded.value = !expanded.value;
      }
    };
    const mouseOver = () => {
      if (props.model.disabled) return;
      isHover.value = true;
    };
    const mouseOut = () => {
      isHover.value = false;
    };

    const click = () => {
      emit("click", {
        toggle: props.toggle,
        ...props.model,
      });
    };

    const addChild = (isLeaf) => {
      const name = isLeaf
        ? props.defaultLeafNodeName
        : props.defaultTreeNodeName;
      expanded.value = true;
      var node = new TreeNode({ name, isLeaf });
      props.model.addChildren(node, true);
      emit("add-node", node);
    };
    const dragStart = (e) => {
      if (!(props.model.dragDisabled || props.model.disabled)) {
        compInOperation = props;
        // for firefox
        e.dataTransfer.setData("data", "data");
        e.dataTransfer.effectAllowed = "move";
        return true;
      }
      return false;
    };

    const dragEnd = () => {
      compInOperation = null;
    };

    const dragOver = (e) => {
      e.preventDefault();
      return true;
    };
    const dragEnter = () => {
      if (!compInOperation) return;
      if (
        compInOperation.model.id === props.model.id ||
        !compInOperation ||
        props.model.isLeaf
      )
        return;
      isDragEnterNode.value = true;
    };

    const dragLeave = () => {
      isDragEnterNode.value = false;
    };
    const drop = () => {
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.moveInto(props.model);
      isDragEnterNode.value = false;
      props.rootNode;
      emit("drop", {
        target: props.model,
        node: compInOperation.model,
        src: oldParent,
      });
    };

    const dragEnterUp = () => {
      if (!compInOperation) return;
      isDragEnterUp.value = true;
    };
    const dragOverUp = (e) => {
      e.preventDefault();
      return true;
    };
    const dragLeaveUp = () => {
      if (!compInOperation) return;
      isDragEnterUp.value = false;
    };
    const dropBefore = () => {
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.insertBefore(props.model);
      isDragEnterUp.value = false;
      emit("drop-before", {
        target: props.model,
        node: compInOperation.model,
        src: oldParent,
      });
    };

    const dragEnterBottom = () => {
      if (!compInOperation) return;
      isDragEnterBottom.value = true;
    };
    const dragOverBottom = (e) => {
      e.preventDefault();
      return true;
    };
    const dragLeaveBottom = () => {
      if (!compInOperation) return;
      isDragEnterBottom.value = false;
    };
    const dropAfter = () => {
      if (!compInOperation) return;
      const oldParent = compInOperation.model.parent;
      compInOperation.model.insertAfter(props.model);
      isDragEnterBottom.value = false;
      emit("drop-after", {
        target: props.model,
        node: compInOperation.model,
        src: oldParent,
      });
    };

    onBeforeUnmount(() => {
      removeHandler(window, "keyup");
    });

    // watchEffect 用于在组件挂载后执行一次，类似于 beforeCreate 钩子
    onMounted(() => {
      this.$options.components.item =
        import("./Vue3TreeComponent.vue").default;
    });

    return {
      isHover,
      editable,
      isDragEnterUp,
      isDragEnterBottom,
      isDragEnterNode,
      expanded,
      updateName,
      delNode,
      setEditable,
      setUnEditable, // 其他方法
      // 模板中其他暴露给模板的方法
    };
  },


};
</script>

<style lang="less" rel="stylesheet/less">
@font-face {
  font-family: "icomoon";
  src: url("../assets/fonts/icomoon.eot?ui1hbx");
  src:
    url("../assets/fonts/icomoon.eot?ui1hbx#iefix") format("embedded-opentype"),
    url("../assets/fonts/icomoon.ttf?ui1hbx") format("truetype"),
    url("../assets/fonts/icomoon.woff?ui1hbx") format("woff"),
    url("../assets/fonts/icomoon.svg?ui1hbx#icomoon") format("svg");
  font-weight: normal;
  font-style: normal;
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
    color: blue;
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
    border-bottom: 3px dashed blue;
    /*background-color: blue;*/
  }
}

.vtl-node-main {
  display: flex;
  align-items: center;
  padding: 5px 0 5px 1rem;

  .vtl-input {
    border: none;
    max-width: 150px;
    border-bottom: 1px solid blue;
  }

  &:hover {
    background-color: #f0f0f0;
  }

  &.vtl-active {
    outline: 2px dashed pink;
  }

  .vtl-caret {
    margin-left: -1rem;
  }

  .vtl-operation {
    margin-left: 2rem;
    letter-spacing: 1px;
  }
}

.vtl-item {
  cursor: pointer;
}

.vtl-tree-margin {
  margin-left: 2em;
}
</style>
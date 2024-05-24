<template>
  <div>
    <button @click="addNode">Add Node</button>
    <vue-tree :model="data">
      <!-- <vue-tree
      @click="onClick"
      @change-name="onChangeName"
      @end-edit="onEndEdit"
      @delete-node="onDel"
      @add-node="onAddNode"
      @drop="drop"
      @drop-before="dropBefore"
      @drop-after="dropAfter"
      :model="data"
      default-tree-node-name="new node"
      default-leaf-node-name="new leaf"
      v-bind:default-expanded="true"
    > -->
      <!-- <template v-slot:leafNameDisplay="slotProps">
        <span>
          {{ slotProps.model.name }}
          <span class="muted">#{{ slotProps.model.id }}</span>
        </span>
      </template> -->
      <!-- eslint-disable vue/no-unused-vars -->
      <!-- <template v-slot:addTreeNodeIcon="slotProps">
        <span class="icon">📂</span>
      </template> -->
      <!-- <template v-slot:addLeafNodeIcon="slotProps">
        <span class="icon">＋</span>
      </template> -->

      <!-- <template v-slot:editNodeIcon="slotProps">
        <span class="icon">📃</span>
      </template>
      <template v-slot:delNodeIcon="slotProps">
        <span class="icon">✂️</span>
      </template> -->
      <!-- <template v-slot:leafNodeIcon="slotProps">
        <span class="icon">🍃</span>
      </template> -->
      <!-- <template v-slot:treeNodeIcon="slotProps">
        <span class="icon">
          {{
            slotProps.model.children &&
            slotProps.model.children.length > 0 &&
            !slotProps.expanded
              ? "🌲"
              : ""
          }}</span
        >
      </template> -->
    </vue-tree>
    <button @click="getNewTree">Get new tree</button>
    <pre>{{ newTree }}</pre>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import { VueTree, getTreeData, TreeNode } from "../src";
import tree from "./tree.json";
const mockTree = [
  {
    name: "Node 1",
    id: 1,
    pid: 0,
    dragDisabled: true,
    addTreeNodeDisabled: true,
    addLeafNodeDisabled: true,
    editNodeDisabled: true,
    delNodeDisabled: true,
    children: [
      {
        name: "Node 1-2",
        id: 2,
        isLeaf: true,
        pid: 1,
      },
    ],
  },
  {
    name: "Node 2",
    id: 3,
    pid: 0,
    disabled: true,
  },
  {
    name: "Node 3",
    id: 4,
    pid: 0,
  },
];

const newTree = ref({});
const data = reactive(getTreeData(tree));

const onDel = (node) => {
  console.log("onDel", node);
  node.remove();
};

const onEndEdit = (params) => {
  console.log("onEndEdit", params);
};

const onChangeName = (params) => {
  console.log("onChangeName", params);
};

const onAddNode = (params) => {
  console.log("onAddNode", params);
};

const onClick = (params) => {
  console.log("onClick", params);
};

const drop = ({ node, src, target }) => {
  console.log("drop", node, src, target);
};

const dropBefore = ({ node, src, target }) => {
  console.log("drop-before", node, src, target);
};

const dropAfter = ({ node, src, target }) => {
  console.log("drop-after", node, src, target);
};

const addNode = () => {
  const node = new TreeNode({ name: "new node", isLeaf: false });
  data.addChildren(node);
};

const formatJson = (jsonObj) => {
  return JSON.stringify(jsonObj, null, 2); // 2 表示使用2个空格作为缩进
};

const getNewTree = () => {
  function _dfs(oldNode) {
    const newNode = {};

    for (const k in oldNode) {
      if (k !== "children" && k !== "parent") {
        newNode[k] = oldNode[k];
      }
    }

    if (oldNode && oldNode.children && oldNode.children.length > 0) {
      newNode.children = [];
      for (const child of oldNode.children) {
        newNode.children.push(_dfs(child));
      }
    }
    return newNode;
  }

  newTree.value = formatJson(_dfs(data));
};
</script>

<style lang="less" rel="stylesheet/less" scoped>
.icon {
  &:hover {
    cursor: pointer;
  }
}

.muted {
  color: gray;
  font-size: 80%;
}
</style>

// import { createApp } from "vue";
import VueTree from "./Tree";
import { getTreeData, TreeNode } from "./Tree/src/treeModel";

// 所有组件列表
// const components = [VueTree];

// 定义 install 方法， App 作为参数
// const install = (app: ReturnType<typeof createApp>): void => {
//   // 遍历注册所有组件
//   components.map((component) =>
//     app.component(component.name || "sailing-component", component)
//   );
// };

// export default {
//   install,
// };
export { VueTree, getTreeData, TreeNode };

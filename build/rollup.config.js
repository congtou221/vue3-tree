const path = require("path"); // 引入path模块
const resolve = require("rollup-plugin-node-resolve"); // 告诉 Rollup 如何查找外部模块
const commonjs = require("rollup-plugin-commonjs"); // 将CommonJS模块转换为 ES2015 供 Rollup 处理
const babel = require("rollup-plugin-babel"); // rollup 的 babel 插件，ES6转ES5
const json = require("rollup-plugin-json"); // rollup 的 json 插件，读取json文件数据
const vue = require("rollup-plugin-vue"); // rollup 的 vue 插件，处理vue文件
const postcss = require("rollup-plugin-postcss"); // rollup 的 postcss 插件，处理css文件
const typescript = require("rollup-plugin-typescript2");
const copy = require("rollup-plugin-copy");

const peerDepsExternal = require("rollup-plugin-peer-deps-external");

const pkg = require("../package.json");

// import resove from "@rollup/plugin-node-resolve";
// import path from "path";
// import { terser } from "rollup-plugin-terser";
// import typescript from "rollup-plugin-typescript2";
// import pkg from "../package.json";
// import vue from "rollup-plugin-vue";
// import postcss from "rollup-plugin-postcss";
// import commonjs from "rollup-plugin-commonjs";
// const babel = require("@rollup/plugin-babel"); // rollup 的 babel 插件，ES6转ES5

const deps = Object.keys(pkg.dependencies);

export default [
  {
    input: path.resolve(__dirname, "../packages/index.ts"),
    output: [
      {
        format: "es",
        file: "lib/vue-tree.esm.js",
        globals: {
          vue: "Vue",
        },
      },
    ],
    plugins: [
      vue(),
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            declaration: true,
          },
          include: ["packages/**/*", "typings/*.d.ts", "src/**/*.vue"],
          exclude: ["node_modules", "packages/**/__tests__/*"],
        },
        abortOnError: false,
      }),
      babel({
        exclude: "node_modules/**", // 排除node_modules下的文件
        babelHelpers: "runtime", // 配置runtime，不设置会报错
      }),
      json(),
      postcss({
        extensions: [".less"], // 处理 .less 文件
        use: ["less"], // 指定解析器
        extract: true, // 提取 CSS 到单独文件
        output: "lib/bundle.css", // 输出文件路径
      }),
      copy({
        targets: [{ src: "typings/*.d.ts", dest: "lib/typings" }],
        flatten: false, // 保留原始目录结构
      }),
      resolve({
        extensions: [".ts", ".tsx", ".json", ".vue"],
      }),
      commonjs(), // 将CommonJS模块转换为 ES2015 供 Rollup 处理

      peerDepsExternal(),
      // 其他插件...
    ],
    external(id) {
      if (/^vue/.test(id)) return false; // 不排除 Vue
      return deps.some((k) => new RegExp("^" + k).test(id));
    },
  },
];

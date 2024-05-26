# vue-tree

[![GitHub open issues](https://img.shields.io/github/issues/sixiaohui/vue3-tree.svg?maxAge=2592000)](https://github.com/sixiaohui/vue3-tree/issues)
[![Npm version](https://img.shields.io/npm/v/vue3-tree.svg?maxAge=2592000)](https://www.npmjs.com/package/vue3-tree)
[![ISC License](https://img.shields.io/github/license/sixiaohui/vue3-tree.svg)](https://github.com/sixiaohui/vue3-tree/blob/master/LICENSE)

## Usage

```HTML
<VueTree :model="mockData"></VueTree>
```

```javascript
import { VueTree, getTreeData } from "sailing-vuetree";

export default {
  data: {
    mockData: getTreeData([
      {
        name: "Node 1",
        id: 1,
        pid: 0,
        isLeaf: false,
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
    ]),
  },
  components: {
    VueTree,
  },
};
```

## API

## Installation

```
npm install vue-tree
```

## Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
pnpm run serve
```

### Compiles and minifies for production

```
pnpm run build
```

### Lints and fixes files

```
pnpm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

### Update the API section of README.md with generated documentation

```
npm run doc:build
```

### Run style guide dev server

```
npm run styleguide
```

### Generate a static HTML style guide

```
npm run styleguide:build
```

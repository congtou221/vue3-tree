import { TreeNode } from "./Tree/src/treeModel";

interface Attributes {
  [key: string]: string | number | boolean;
}

export const createElement = (
  tagName: string,
  attributes?: Attributes,
  parentElement?: HTMLElement
): HTMLElement | null => {
  let element: HTMLElement;

  if (typeof document.createElement !== "undefined") {
    // Modern browsers
    element = document.createElement(tagName);
  } else {
    // For very old browsers like IE8 and below
    element = document.createElement("div");
  }

  if (attributes) {
    for (const attr in attributes) {
      if (attributes.hasOwnProperty(attr)) {
        element.setAttribute(attr, String(attributes[attr]));
      }
    }
  }

  if (parentElement) {
    parentElement.appendChild(element);
  }

  return element;
};

export const removeElement = (element: HTMLElement | null): void => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  } else {
    console.warn("Element not found in the DOM tree, unable to remove.");
  }
};
export const isLastChildOfTree = (
  child: TreeNode | null,
  tree: TreeNode | null
): boolean => {
  if (!tree) return false;
  if (tree.name !== "root") return false;
  const subTreeList = tree.children || [];

  let subTree = subTreeList[subTreeList.length - 1];
  let level = 0;

  while (subTree && subTree.children) {
    subTree = subTree.children[subTree.children.length - 1];
    level++;
  }
  // console.log("isLastChildOfSubTree", subTree, child, subTree === child)
  return subTree === child;
};
export const isLastChildOfSubTree = (
  child: TreeNode | null,
  tree: TreeNode | null
): boolean => {
  if (!tree) return false;
  const subTreeList = tree.children || [];

  for (let i = 0; i < subTreeList.length; i++) {
    let subTree = subTreeList[i];
    let level = 0;

    while (subTree && subTree.children) {
      subTree = subTree.children[subTree.children.length - 1];
      level++;
    }
    // console.log("isLastChildOfSubTree", subTree, child, subTree === child)
    return subTree === child;
  }
  return false;
};

export const isLastChildrenOfSubTree = (
  child: TreeNode | null,
  tree: TreeNode | null
): boolean => {
  if (!tree) return false;
  if (tree.name !== "root") return false;
  const subTreeList = tree.children || [];

  for (let i = 0; i < subTreeList.length; i++) {
    const subTree = subTreeList[i];

    if (subTree && subTree.children) {
      const lastSubTree = subTree.children[subTree.children.length - 1];
      return lastSubTree === child;
    }
  }
  return false;
};

interface Attributes {
  [key: string]: string | number | boolean;
}

export  const createElement = (
  tagName: string,
  attributes?: Attributes,
  parentElement?: HTMLElement
): HTMLElement  | null => {
  let element: HTMLElement ;

  if (typeof document.createElement !== 'undefined') {
    // Modern browsers
    element = document.createElement(tagName);
  } else {
    // For very old browsers like IE8 and below
    element = document.createElement('div');
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
}

export const removeElement = (element: HTMLElement | null): void => {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  } else {
    console.warn('Element not found in the DOM tree, unable to remove.');
  }
}
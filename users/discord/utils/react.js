const render = function (element, container) {
  if (!element) return container;
  if (typeof element == 'string' || typeof element == 'number') {
    container.appendChild(document.createTextNode(String(element)));
    return;
  }

  const component = document.createElement(element.tag);
  element.props &&
    Object.keys(element.props).forEach((prop) =>
      prop == 'onclick' || prop == 'onsubmit'
        ? (component[prop] = element.props[prop])
        : component.setAttribute(prop, element.props[prop]),
    );

  element.children?.forEach?.((child) => {
    render(child, component);
  });

  container.appendChild(component);
};

const react = {
  createElement: function (tag, props, children) {
    const el = { tag, props, children };
    return el;
  },
  render,
  rerender: function (element, container) {
    container.firstChild.remove();
    render(element, container);
  },
};

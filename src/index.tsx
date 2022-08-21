function createElement(type: any, props: any, ...children: any) {
  return {
    type,
    props: {
      ...props,
      children,
    },
  };
}
const Didact = {
  createElement,
};
/** @jsx Didact.createElement */
const element = <div id="foo">hi</div>;

function render(element: any, container: any) {
  const dom = document.createElement(element.type);
  element.props.children.forEach((child: any) => render(child, dom));
  container.appendChild(dom);
  console.log(element);
  console.log(container);
}

render(element, document.getElementById('test'));

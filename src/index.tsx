/*

  React has a shit ton of complexity.

  But what does it boil down to?

  1. describing ui declaratively (jsx)
  2. recalculating ui from scratch
  3. diff & apply updates

import { JsxElement } from "typescript";

// so let's declare our UI
// we have to start somewhere...
function Component() {
  let count = 0;
  return (
    <div
      style={{
        background: 'pink',
      }}
    >
      <span>oh </span>
      <span>shit</span>
      <button>{count}</button>
      <div
        style={{
          background: 'green',
          display: 'flex',
        }}
      >
        I wonder
        <p>Does this really work??</p>
      </div>
    </div>
  );
}

// now lets put it in the dom but where??

// for now we can naively append to the body and assume all of the boilerplate already exists.

putInDOM(<Component />);

function putInDOM(node: React.JSX.Element) {
  const root = document.getElementById('entry');
  traverse(node, root);
  prevTree = root;
}

function traverse(node: JSX.Element, parent: HTMLElement | null = null) {
  // a node can be a couple potential types:
  // a component
  // a string

  console.log(JSON.stringify(node));

  switch (typeof node.type) {
    case 'string': {
      const el = document.createElement(node.type);
      for (const [key, val] of Object.entries(node.props)) {
        if (key !== 'children') {
          // check the value. is it a string? then apply
          if (typeof val === 'string') {
            el[key] = val;
          }
          if (typeof val === 'object') {
            for (const [k, v] of Object.entries(val)) {
              el[key][k] = v;
            }
          }
        }

        // if the key is children, we need to traverse the children
        if (key === 'children') {
          if (typeof val === 'string') {
            el.textContent = val;
          }
          if (typeof val === 'number') {
            el.textContent = val.toString();
          }
          if (Array.isArray(val)) {
            for (const child of val) {
              // check if the child is a string
              if (typeof child === 'string') {
                el.textContent = child;
              }
              if (typeof child === 'number') {
                el.textContent = child.toString();
              }
              if (typeof child === 'object') {
                traverse(child, el);
              }
            }
          }
        }

        parent?.appendChild(el);
      }

      break;
    }
    case 'function': {
      traverse(node.type(), parent);

      break;
    }
    default: {
      throw new Error('NOOP');
    }
  }
}

/*
  
  //// ok so that is initial mount but what about dynamic updates 
  /// when we traverse the createElement tree we can store it in memory
  
  
  so how do we get to the new tree? 
  we need to get the latest data somewhere. It needs to "update" with the latest values after events
  
  we have some options for reactions to events:
  1. declarative - update value and re update 
  2. imperative - on event update the specific node in the ui
  
  but what are reactions fundamentally? Events leading to some new value
  
  we're in js so let's make it feel like js
  ```
  const App = () => {
    let count = 0;
  
    return (
      <button onClick={() => count++}>
        {count}
      </button>
    )
  }
  
  ```
  
  // but we need a mechanism to trigger an update
  
  // for react that's useState, solid is createSignal, vue is ref, svelte is the only one that's really close to the original js
  
  svelte is 
  ```
  <script>
    let count = 0;
  </script>
  
  <button on:click={() => count += 1}>
    {count}
  </button>
  ```
  
  svelte has a compile that makes this work. 
  
  ```
  import { reactive } from 'our-framework
  const App = () => {
    let count = reactive(0);
  
    return (
      <button onClick={() => count++}>
        {count}
      </button>
    )
  }
  
  ```
  
  we're wanting to approach this the way react does - focusing on recalculating the entire tree / diffing it and applying granular updates
  
  to start we will need a tree to compare against
  
  the naive approach is to just duplicate the entire DOM and diff against updates but there's a couple issues:
  
  1. We still need state updates tied to components
  2. We need to flag sections of the tree for updates
  
  it's this decision that led to the fiber tree (previously virtual dom)
  
  now for comparison - React doesn't compare the fiber tree against the DOM 
  
  instead it maintains two fiber trees: a current tree and a work in progress tree.
  
  then takes the diff and applies to DOM
  
  so to start we need to construct a fiber tree - we can be pragmatic about what it contains
  

const fiberTypes = {
  ROOT: 'ROOT',
  FUNCTION_COMPONENT: 'FUNCTION_COMPONENT',
  DIV: 'DIV',
  SPAN: 'SPAN',
  BUTTON: 'BUTTON',
} as const;

class Fiber {
  type: (typeof fiberTypes)[keyof typeof fiberTypes];
  parent: Fiber | null;

  constructor(
    type: (typeof fiberTypes)[keyof typeof fiberTypes],
    parent: Fiber | null = null
  ) {
    this.type = type;
    this.parent = parent;
  }
}

Fuck that complexity. Just basics:

- updating dom is expensive if we have to always repaint entire thing we'll be fucked

so let's diff and do minimal updates

but to diff we need to know what the tree looked like before

an action occurs (i.e. mouse click button updates state)

then we run shit find out new tree

diff

apply updates to dom

But to start we need to store the og tree.

No need to complicate shit - just store it in a variable


let prevTree = null;

// now we can do:

function putInDOM(node: React.JSX.Element) {
  const root = document.body;
  traverse(node, root);
  prevTree = root; // added this
}

cool now we have an old tree copy to compare against another tree but how do we get an update to trigger the rebuild of a new tree to compare?

We need events/ state to trigger that we need to rebuild a tree

that's what useState is for

We'll rebuild useState from the api it offers

// ## useState

the first step is that useState allows us to pass a default value

function useState(initialValue){
  let initialState= initialValue;

  // remember it returns a tuple (an array with two values)
  return [initialState, ]
  // well shit this isn't very interactive
}

how do we get useState to be interactive?

bc of scope the value has to exist somewhere OUTSIDE of this thing

that sort of covers the first return value in the tuple.

The second is a bit more important - it needs to tell React: recalculate the tree / update the value;

It might be tempting to just put that shit outside in a variable somewhere but it needs to be dynamic. 

If you wanted to be really simple you could just have an array of values for every useState and then sort of count the useStates until you get the one you're at and with the incremented index access the value

Another idea is you could have a dictionary / object, since useStates HAVE to be called inside of components we could use the component function definition as the key and the array to account for multiple instances?


if we do it that way we run into the same pitfall that react did where hooks have to be called in the same order

I'm thinking of alt solutions.....

the identity isn't stable since we're calling the components to get the second tree...

how can you give a stable id to something that's referentially different/ value will be different?

in theory for the second argument it could ask "react" for a stable identity and then it's tied to that dispatch and then when called will have the same identity to quickly get the value

since useState is called every render / i.e. everytime useState is called, we can't ask for the stable identifier there i.e. 

function useState(initialValue) {
  const stableId = React.getHookId(); // React gives us a unique, stable identifier
  ...
}

because the next time we call useState it will be a different value

tbh this would be a perfect use case for a compiler to make it easier to manage the state and hooks under the hood so we don't give devs higher level of complexity with rules of hooks.

But a compiler is outside the scope of this so the array will do
*/

import { JsxElement } from 'typescript';

let componentMap = new Map<
  Function,
  Array<{
    state: any;
    setState: (newState: any) => void;
    prevState: any;
  }>
>();

/*
  now everytime we hit a function/component we can add it to the map if it referentially doesn't exist


   case 'function': {
      traverse(node.type(), parent);
      
      break;
    }


    becomes

     case 'function': {
      traverse(node.type(), parent);
      if (!componentMap.has(node.type)) {
        componentMap.set(node.type, []);
      } 
      break;
    }



    ok sick now we have a place to store the state but let's implement it in the useState func




let currentComponent: Function | null = null;
let hookIndex = 0;
let flaggedComponent: Function | null = null;

function useState(initialValue: any) {
  // check where we are in the component map?

  const currentComponent = componentMap.get(currentComponent);
  // see if it exists
  if (currentComponent) {
    return [
      currentComponent[hookIndex].state,
      currentComponent[hookIndex].setState,
    ];
  }

  // if it doesn't, create a new entry
  const state = initialValue;
  const setState = (newState: any) => {
    // flag the component for update / trigger render
    flaggedComponent = currentComponent;
    // update the state
    currentComponent[hookIndex].prevState = currentComponent[hookIndex].state;
    currentComponent[hookIndex].state = newState;
  };

  // add to the component map
  componentMap.set(currentComponent, [
    {
      state,
      setState,
      prevState: state,
    },
  ]);
  // increment the hook index
  hookIndex++;
  // return the state and setState function
  return [state, setState];
}

// there's a lot of bugs but the idea is there
*/

/*
  in order to have state / flag components for updates we need a mechanism to store state / have a representatino of the tree
  so we can diff against it

  react uses a fiber tree so let's do that



*/

// Reminder we are making a Fiber instance for every react element (basically every tag or component)
class Fiber {
  type: string; // this is the tag name or component function
  parent: Fiber | null;
  props: Record<string, any>;
  sibling: Fiber | null = null;
  child: Fiber | null = null;
  dom: HTMLElement | null = null;
  value?: string | number;

  constructor(
    type: string,
    props: Record<string, any> = {},
    parent: Fiber | null = null,
    dom: HTMLElement | null = null,
    value?: string | number
  ) {
    this.dom = dom;
    this.type = type;
    this.props = props;
    this.parent = parent;
    this.value = value;
  }
}

// ok now conceptually we are going to start at the root and traverse it and make these Fibers and populate them on the fly

// to start we will do it naively & it will look damn close to the traverse function we had before

// let's create a root for the tree

let root = new Fiber('ROOT');

function traverseReactTree(
  node: JsxElement,
  parent: Fiber | null = null,
  existingFiber: Fiber | null = null
): Fiber {
  const fiber = existingFiber
    ? existingFiber
    : new Fiber(node.type, node.props, parent);

  if (parent && !parent.child) parent.child = fiber;

  if (
    node.props &&
    'children' in node.props &&
    Array.isArray(node.props.children)
  ) {
    let children: Array<{ fiber: Fiber; element: ReactElement }> = [];
    let index = 0;
    for (const child of node.props.children) {
      const childFiber = isReactTransitionalElement(child)
        ? new Fiber(child.type, child.props, fiber)
        : new Fiber('TEXT', {}, fiber, null, child);

      if (childFiber.type === 'TEXT')
        console.log('CREATED TEXT FIBER: ', childFiber);
      // if the child is a string or number,
      children.push({ fiber: childFiber, element: child });

      if (index === 0) {
        fiber.child = childFiber; // set the first child
      }
      if (index > 0) {
        // set the sibling of the previous child
        if (children[index - 1]) {
          children[index - 1]['fiber'].sibling = childFiber;
        }
      }

      if (!fiber.child) {
      }
      index++;
    }

    // now we need to traverse the children
    for (const { element, fiber: childFiber } of children) {
      traverseReactTree(element, fiber, childFiber);
    }
  }

  if (
    node.props &&
    'children' in node.props &&
    !Array.isArray(node.props.children)
  ) {
    const textFiber = new Fiber('TEXT', {}, fiber, null, node.props.children);
    fiber.child = textFiber; //
  }

  switch (typeof node.type) {
    case 'function': {
      const componentFiber = traverseReactTree(node.type(), node);
      fiber.child = componentFiber;
      break;
    }
    case 'string':
      {
        fiber.dom = document.createElement(node.type);

        // set the attributes on the dom element
        for (const [key, value] of Object.entries(node.props)) {
          if (key !== 'children') {
            // if the value is an object, we assume it's a style object
            if (typeof value === 'object' && !Array.isArray(value)) {
              for (const [styleKey, styleValue] of Object.entries(value)) {
                fiber.dom!.style[styleKey as any] = styleValue;
              }
            } else {
              fiber.dom![key] = value;
            }
          }
        }
      }
      break;
  }

  return fiber;
}

function Component() {
  let count = 0;
  return (
    <div
      style={{
        background: 'pink',
      }}
    >
      <span>oh </span>
      <span>shit</span>
      <button>{count}</button>
      <div
        style={{
          background: 'green',
          display: 'flex',
        }}
      >
        I wonder
        <p>Does this really work??</p>
      </div>
      <div test-id="wow">
        i think it does :D
        <table></table>
      </div>
    </div>
  );
}

traverseReactTree(<Component />, root);

console.log(root);

commitToDOM(root, document.body);

function commitToDOM(fiber: Fiber, parent: HTMLElement) {
  if (fiber.type === 'TEXT' && typeof fiber.value === 'string')
    parent.innerHTML = fiber.value;
  if (fiber.type === 'TEXT' && typeof fiber.value === 'number')
    parent.innerHTML = fiber.value.toString();
  if (fiber.dom) parent.append(fiber.dom);
  if (fiber.child) commitToDOM(fiber.child, fiber.dom || parent);
  if (fiber.sibling) commitToDOM(fiber.sibling, parent);
}

function isReactTransitionalElement(obj: any) {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.$$typeof &&
    obj.$$typeof.toString() === 'Symbol(react.transitional.element)'
  );
}

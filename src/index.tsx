/* 
  React has a shit ton of complexity.

  But what does it boil down to?

  1. describing ui declaratively (jsx)
  2. recalculating ui from scratch
  3. diff & apply updates
*/

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
  const root = document.body;
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
  
  */

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

/*
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

*/

let prevTree = null;

/*
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

*/
// ## useState
/*

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



*/

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

export const React = {
  // we need that render later

  createRoot: (element: HTMLElement) => {
    return {
      render: (component: React.JSX.Element) => {
        // a shit ton of stuff:
        // 1. start initial render
      },
    };
  },
};

const root = createRoot(document.getElementById('app'));
root.render(<App />);

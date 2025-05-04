// // High level ideas of React

// // React begins at an entry point
// export function createRoot(domNode: HTMLElement) {
//   return {
//     render(element: any) {
//       console.log('rendering', element);
//     },
//   };
// }

// // recursively generates a tree of elements/fibers
// // then it generates the ui from that tree via the DOM

// enum ElementType {
//   ROOT,
//   DIV,
//   SPAN,
// }

// class Node {
//   private type: ElementType;
//   private data: string | null;
//   private children: Array<Node>;
//   constructor(type: ElementType, data: string | null = null) {
//     this.type = type;
//     this.data = data;
//     this.children = [];
//   }

//   setType(type: ElementType) {
//     this.type = type;
//   }

//   getType() {
//     return this.type;
//   }

//   setData(data: string) {
//     this.data = data;
//   }

//   getData() {
//     return this.data;
//   }

//   addChild(child: Node) {
//     this.children.push(child);
//   }

//   getChildren() {
//     return this.children;
//   }
// }

// const root = new Node(ElementType.ROOT);

// const child1 = new Node(ElementType.DIV, 'child1');
// const child2 = new Node(ElementType.SPAN, 'child2');
// const child3 = new Node(ElementType.SPAN, 'child3');

// root.addChild(child1);
// root.addChild(child2);
// root.addChild(child3);

// const grandChild1 = new Node(ElementType.DIV, 'child1-child1');
// const grandChild2 = new Node(ElementType.SPAN, 'child1-child2');

// child1.addChild(grandChild1);
// child1.addChild(grandChild2);

// const a = new Node(ElementType.DIV, 'grandChild1');
// const b = new Node(ElementType.DIV, 'grandChild2');

// grandChild1.addChild(a);
// grandChild1.addChild(b);

// function dfs(node: Node) {
//   console.log(node.getData());

//   if (node.getChildren().length === 0) {
//     return node;
//   }
//   for (const children of node.getChildren()) {
//     dfs(children);
//   }
// }

// dfs(root);

class _Node {
  private data: string | null;
  // node behind
  private next: _Node | null;

  constructor(data: string | null) {
    this.data = data;
    this.next = null;
  }

  setNext(next: _Node | null) {
    this.next = next;
  }

  getNext() {
    return this.next;
  }
  getData() {
    return this.data;
  }
}

// FIFO
class Queue {
  private head: _Node | null;
  private tail: _Node | null;

  constructor() {
    this.head = null;
    this.tail = null;
  }

  // add to end
  enqueue(node: _Node) {
    node.setNext(null);
    // empty
    if (!this.head) {
      this.head = node;
      this.tail = node;
      return;
    }
    // add first
    if (this.tail) {
      this.tail.setNext(node);
      this.tail = node;
    }
  }

  dequeue() {
    // empty
    if (!this.head || !this.tail) {
      return null;
    }

    // remove with multiple
    const head = this.head;
    this.head = head.getNext();
    head.setNext(null);

    return head.getData();
  }
}
import { test, expect } from 'bun:test';

test('passes', () => {
  const queue = new Queue();
  const node1 = new _Node('1');
  const node2 = new _Node('2');

  queue.enqueue(node1);
  queue.enqueue(node2);
  expect(queue.dequeue()).toBe('1');
  expect(queue.dequeue()).toBe('2');
  expect(queue.dequeue()).toBeNull();

  const node3 = new _Node('3');
  queue.enqueue(node3);
  const node4 = new _Node('4');
  queue.enqueue(node4);

  expect(queue.dequeue()).toBe('3');
  expect(queue.dequeue()).toBe('4');
  expect(queue.dequeue()).toBeNull();
});

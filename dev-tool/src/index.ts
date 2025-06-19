// Don't change these values. They're used by React Dev Tools.
export const NoFlags = /*                      */ 0b0000000000000000000000000000000;
export const PerformedWork = /*                */ 0b0000000000000000000000000000001;
export const Placement = /*                    */ 0b0000000000000000000000000000010;
export const DidCapture = /*                   */ 0b0000000000000000000000010000000;
export const Hydrating = /*                    */ 0b0000000000000000001000000000000;

// You can change the rest (and add more).
export const Update = /*                       */ 0b0000000000000000000000000000100;
export const Cloned = /*                       */ 0b0000000000000000000000000001000;

export const ChildDeletion = /*                */ 0b0000000000000000000000000010000;
export const ContentReset = /*                 */ 0b0000000000000000000000000100000;
export const Callback = /*                     */ 0b0000000000000000000000001000000;
/* Used by DidCapture:                            0b0000000000000000000000010000000; */

export const ForceClientRender = /*            */ 0b0000000000000000000000100000000;
export const Ref = /*                          */ 0b0000000000000000000001000000000;
export const Snapshot = /*                     */ 0b0000000000000000000010000000000;
export const Passive = /*                      */ 0b0000000000000000000100000000000;
/* Used by Hydrating:                             0b0000000000000000001000000000000; */

export const Visibility = /*                   */ 0b0000000000000000010000000000000;
export const StoreConsistency = /*             */ 0b0000000000000000100000000000000;

// It's OK to reuse these bits because these flags are mutually exclusive for
// different fiber types. We should really be doing this for as many flags as
// possible, because we're about to run out of bits.
export const ScheduleRetry = StoreConsistency;
export const ShouldSuspendCommit = Visibility;
export const DidDefer = ContentReset;
export const FormReset = Snapshot;
export const AffectedParentLayout = ContentReset;

export const LifecycleEffectMask =
  Passive | Update | Callback | Ref | Snapshot | StoreConsistency;

// Union of all commit flags (flags with the lifetime of a particular commit)
export const HostEffectMask = /*               */ 0b0000000000000000111111111111111;

// These are not really side effects, but we still reuse this field.
export const Incomplete = /*                   */ 0b0000000000000001000000000000000;
export const ShouldCapture = /*                */ 0b0000000000000010000000000000000;
export const ForceUpdateForLegacySuspense = /* */ 0b0000000000000100000000000000000;
export const DidPropagateContext = /*          */ 0b0000000000001000000000000000000;
export const NeedsPropagation = /*             */ 0b0000000000010000000000000000000;
export const Forked = /*                       */ 0b0000000000100000000000000000000;

// Static tags describe aspects of a fiber that are not specific to a render,
// e.g. a fiber uses a passive effect (even if there are no updates on this particular render).
// This enables us to defer more work in the unmount case,
// since we can defer traversing the tree during layout to look for Passive effects,
// and instead rely on the static flag as a signal that there may be cleanup work.
export const SnapshotStatic = /*               */ 0b0000000001000000000000000000000;
export const LayoutStatic = /*                 */ 0b0000000010000000000000000000000;
export const RefStatic = LayoutStatic;
export const PassiveStatic = /*                */ 0b0000000100000000000000000000000;
export const MaySuspendCommit = /*             */ 0b0000001000000000000000000000000;
// ViewTransitionNamedStatic tracks explicitly name ViewTransition components deeply
// that might need to be visited during clean up. This is similar to SnapshotStatic
// if there was any other use for it.
export const ViewTransitionNamedStatic = /*    */ SnapshotStatic;
// ViewTransitionStatic tracks whether there are an ViewTransition components from
// the nearest HostComponent down. It resets at every HostComponent level.
export const ViewTransitionStatic = /*         */ 0b0000010000000000000000000000000;
const OFFSET = 2; // px
function highlightRenderForElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (!rect) {
    console.log('Element has no bounding rect');
    return;
  }
  const highlight = document.createElement('div');
  highlight.style.position = 'fixed';
  highlight.style.top = `${rect.top}px`;
  highlight.style.left = `${rect.left}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  highlight.style.zIndex = '999999999';
  highlight.style.outline = '2px dashed pink';
  highlight.style.outlineOffset = `${OFFSET}px`;
  highlight.style.pointerEvents = 'none';
  highlight.style.transition = 'outline-offset 0.3s ease-in-out';
  highlight.style.backgroundColor = 'rgba(255, 192, 203, 0.08)';
  highlight.style.borderRadius = '4px';
  document.documentElement.appendChild(highlight);
  setTimeout(() => {
    document.documentElement.removeChild(highlight);
  }, 300);
}

const HTMLMap = new Map<HTMLElement, FiberNode>();

const ComponentMap = new Map<FiberNode, Function>();

function traverseFiber(fiber: FiberNode, isRoot = false) {
  if (!fiber) return;

  if (isRoot) {
    console.log('Root fiber:', fiber);
    traverseFiber(fiber.child);
    return;
  }

  if (fiber.stateNode instanceof HTMLElement) {
    HTMLMap.set(fiber.stateNode, fiber);
    if (fiber.flags === Update) {
      highlightRenderForElement(fiber.stateNode);
    }
  }

  if (typeof fiber.elementType === 'function') {
    ComponentMap.set(fiber, fiber.elementType);
  }

  if (fiber.sibling) {
    traverseFiber(fiber.sibling);
  }
  if (fiber.child) {
    traverseFiber(fiber.child);
  }
}

// Override with your own implementation
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = function (
  id,
  root,
  priorityLevel,
  ...rest
) {
  traverseFiber(root.current, true);
  console.log('ComponentMap entries: ', [...ComponentMap.entries()]);
};

const highlightedElements = new Map<HTMLElement, HTMLElement>();

function highlightElement(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  if (!rect) {
    return;
  }
  // remove any existing highlight that isn't this element
  highlightedElements.forEach((highlight, el) => {
    if (el !== element) {
      highlight.remove();
      highlightedElements.delete(el);
    }
  });
  // make sure it's got a relevant fiber node
  const fiberNode = HTMLMap.get(element);

  if (!fiberNode) {
    return;
  }

  const highlight = document.createElement('div');
  highlight.style.position = 'fixed';
  highlight.style.top = `${rect.top}px`;
  highlight.style.left = `${rect.left}px`;
  highlight.style.width = `${rect.width}px`;
  highlight.style.height = `${rect.height}px`;
  highlight.style.zIndex = '999999999';
  highlight.style.outline = '2px solid white';
  highlight.style.outlineOffset = `${OFFSET}px`;
  highlight.style.pointerEvents = 'none';
  highlight.style.borderRadius = '4px';
  highlight.style.transition = 'outline-offset 0.3s ease-in-out';

  // append to the top right corn the element name inside of a div
  const elementName = document.createElement('div');
  elementName.innerText = fiberNode.type.toString();
  // css
  elementName.style.position = 'absolute';
  elementName.style.top = '0';
  elementName.style.right = -rect.width / 2 + 'px';
  elementName.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  elementName.style.padding = '2px 4px';
  elementName.style.borderRadius = '4px';
  elementName.style.fontSize = '12px';
  elementName.style.fontFamily = 'Arial, sans-serif';
  elementName.style.color = 'black';
  elementName.style.pointerEvents = 'none';
  elementName.style.zIndex = '999999999';
  highlight.appendChild(elementName);

  document.documentElement.appendChild(highlight);

  // add to the map
  highlightedElements.set(element, highlight);
}

// on cursor move
document.addEventListener('mousemove', (event) => {
  const element = document.elementFromPoint(event.clientX, event.clientY);
  if (element) {
    // check if element is already highlighted
    if (highlightedElements.has(element as HTMLElement)) {
      console.log('Element already highlighted');
      return;
    }
    highlightElement(element);
  }
});

type FiberNode = {
  child: FiberNode | null;
  flags: number; // a bitmask of flags / arbitrary values to signal
  stateNode: HTMLElement | null; // DOM element associated with this fiber
  type: string | Function | symbol;
  return: FiberNode | null; // Parent fiber
  sibling: FiberNode | null;
};

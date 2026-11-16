import snippet from "../snippets/art-of-europe.html";

export const frames = async (n = 3) => {
  for (let i = 0; i < n; i++) await new Promise(resolve => requestAnimationFrame(resolve));
};

export const settle = () => new Promise(resolve => setTimeout(resolve, 0));

export async function until<T>(condition: () => T | Promise<T>, what: string, ms = 20000): Promise<NonNullable<T>> {
  const end = Date.now() + ms;
  for (;;) {
    try {
      const value = await condition();
      if (value) return value as NonNullable<T>;
    } catch {}
    if (Date.now() > end) throw new Error("timed out waiting for " + what);
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

/** Text of a tree, through shadow roots. */
export function deepText(node: Node) {
  let text = "";
  const walk = (n: Node) => {
    if (n.nodeType === 3) text += n.textContent + " ";
    if ((n as Element).shadowRoot) (n as Element).shadowRoot!.childNodes.forEach(walk);
    n.childNodes?.forEach(walk);
  };
  walk(node);
  return text;
}

export function deepFind<T extends Element = Element>(root: Node, selector: string) {
  const found: T[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === 1 && (n as Element).matches(selector)) found.push(n as T);
    if ((n as Element).shadowRoot) (n as Element).shadowRoot!.childNodes.forEach(walk);
    n.childNodes?.forEach(walk);
  };
  walk(root);
  return found;
}

export const pointer = (target: Element, type: string, at: { x: number; y: number }, init: PointerEventInit = {}) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, cancelable: true, pointerId: 7, button: 0, isPrimary: true, clientX: at.x, clientY: at.y, ...init }));

export const center = (element: Element) => {
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export async function click(target: Element) {
  const at = center(target);
  pointer(target, "pointerdown", at);
  pointer(target, "pointerup", at);
  await frames();
}

export async function drag(target: Element, from: { x: number; y: number }, to: { x: number; y: number }) {
  pointer(target, "pointerdown", from);
  pointer(target, "pointermove", { x: from.x + 8, y: from.y + 8 });
  await frames(2);
  pointer(target, "pointermove", to);
  await frames(2);
  pointer(target, "pointerup", to);
  await frames();
}

export const mount = document.createElement("div");

export function startMount() {
  document.body.append(mount);
}

export function stopMount() {
  mount.replaceChildren();
  mount.remove();
  document.designMode = "off";
}

/** Mounts the art-of-europe snippet; `lang` goes on its holder. */
export function make(lang = "") {
  const holder = document.createElement("div");
  if (lang) holder.lang = lang;
  holder.innerHTML = snippet;
  mount.append(holder);
  return holder.querySelector("webwriter-branching-scenario") as any;
}

export const dataBlock = (scenario: Element) =>
  scenario.querySelector(':scope > script[slot="data"]:not([data-branching-labels])') as HTMLScriptElement;

export const storedNodes = (scenario: Element) =>
  JSON.parse(dataBlock(scenario).textContent!).editorContent.drawflow.Home.data;

export function edit(scenario: Element) {
  scenario.setAttribute("contenteditable", "");
  document.designMode = "on";
}

export function read(scenario: Element) {
  document.designMode = "off";
  scenario.removeAttribute("contenteditable");
}

// Chrome raises "ResizeObserver loop completed with undelivered notifications" when an observer callback
// changes layout again within a frame. The diagram's viewport does that while it opens; it is harmless, but Mocha
// fails the running test for any uncaught error. Delivering the callbacks one frame later avoids the loop.
const NativeResizeObserver = window.ResizeObserver;
window.ResizeObserver = class extends NativeResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    super((entries, observer) => requestAnimationFrame(() => callback(entries, observer)));
  }
};

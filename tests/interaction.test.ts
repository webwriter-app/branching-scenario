/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-branching-scenario";
import "../src/widgets/webwriter-gamebook-page";
import "../src/widgets/webwriter-gamebook-popup";
import "../src/widgets/webwriter-gamebook-branch";
import "../src/widgets/webwriter-gamebook-button";
import "../src/widgets/webwriter-gamebook-branch-button";
import { center, click, deepFind, edit, frames, make, mount, startMount, stopMount, until } from "./helpers";

mocha.setup(getMochaConfig());

const touch = (target: Element, type: string, y: number, x = 100) =>
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, composed: true, cancelable: true, pointerId: 11, pointerType: "touch", button: 0, isPrimary: true, clientX: x, clientY: y }));

const key = (target: Element, init: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", { bubbles: true, composed: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};

describe("<webwriter-branching-scenario> input, layout and theme", function () {
  this.timeout(30000);
  let scenario: any;

  const editorOf = () => deepFind<any>(scenario.shadowRoot, "node-editor")[0];
  const splitOf = () => deepFind<any>(scenario.shadowRoot, "split-view")[0];
  const resizeOf = () => deepFind<any>(scenario.shadowRoot, "vertical-resize-view")[0];

  before(async function () {
    startMount();
    scenario = make("");
    await customElements.whenDefined("webwriter-branching-scenario");
    await scenario.updateComplete;
  });
  after(stopMount);

  it("a choice is a native button that takes keyboard focus", async function () {
    const button = scenario.querySelector('webwriter-gamebook-button');
    await button.updateComplete;
    const native = button.button.shadowRoot.querySelector("button");
    assert.equal(native.localName, "button");
    assert.isAtLeast(native.tabIndex, 0);
  });

  it("a choice is at least 24 pixels high and a long label wraps inside the widget", async function () {
    mount.style.width = "300px";
    await frames(3);
    const visible = deepFind<HTMLElement>(scenario, "webwriter-gamebook-button").find(b => b.getBoundingClientRect().height > 0)!;
    const rect = (visible as any).button.getBoundingClientRect();
    assert.isAtLeast(rect.height, 24);
    assert.isAtMost(rect.right, scenario.getBoundingClientRect().right + 1);
    mount.style.width = "";
  });

  it("the reading view takes color and font from the page and the title is a part", async function () {
    const wrapper = scenario.parentElement as HTMLElement;
    wrapper.style.setProperty("--ww-text-color", "rgb(1, 2, 3)");
    wrapper.style.setProperty("--ww-font-family", "monospace");
    await frames(2);
    const viewer = deepFind<HTMLElement>(scenario.shadowRoot, "webwriter-gamebook-viewer")[0];
    const titlebar = viewer.shadowRoot!.querySelector(".titlebar")!;
    assert.equal(getComputedStyle(titlebar).color, "rgb(1, 2, 3)");
    assert.include(getComputedStyle(viewer).fontFamily, "monospace");
    assert.equal(viewer.shadowRoot!.querySelector(".gamebookTitle")!.getAttribute("part"), "title");
    assert.include(viewer.getAttribute("exportparts"), "page-title");
    wrapper.style.removeProperty("--ww-text-color");
    wrapper.style.removeProperty("--ww-font-family");
  });

  const startEditing = async () => {
    if (scenario.isContentEditable) return;
    edit(scenario);
    await until(() => deepFind(scenario.shadowRoot, "ww-node").length > 5, "nodes");
    await frames(3);
  };

  it("the node kinds take the theme accents and fall back to today's colors", async function () {
    await startEditing();
    const editor = editorOf();
    const kind = (id: number) => getComputedStyle(editor.shadowRoot.querySelector(`ww-node[data-ww-key="${id}"]`)).getPropertyValue("--kind").trim();
    assert.equal(kind(2), "#3077ba");
    assert.equal(kind(7), "#9762b4");
    const wrapper = scenario.parentElement as HTMLElement;
    wrapper.style.setProperty("--ww-theme-accent-1", "rgb(10, 20, 30)");
    wrapper.style.setProperty("--ww-theme-accent-2", "rgb(40, 50, 60)");
    assert.equal(kind(2), "rgb(10, 20, 30)");
    assert.equal(kind(7), "rgb(40, 50, 60)");
    wrapper.style.removeProperty("--ww-theme-accent-1");
    wrapper.style.removeProperty("--ww-theme-accent-2");
  });

  it("the toolbar and the node detail do not scroll sideways at 300 pixels", async function () {
    await startEditing();
    mount.style.width = "300px";
    await frames(4);
    const toolbar = deepFind<any>(scenario.shadowRoot, "node-editor-toolbar")[0];
    const controls = toolbar.shadowRoot.querySelector(".controls");
    assert.isAtMost(controls.scrollWidth, controls.clientWidth + 1);
    assert.isAtMost(scenario.scrollWidth, scenario.clientWidth + 1);
    for (const id of [2, 7]) {
      await click(editorOf().shadowRoot.querySelector(`ww-node[data-ww-key="${id}"]`));
      await frames(4);
      const content = resizeOf().shadowRoot.querySelector(".content");
      assert.isAtMost(content.scrollWidth, content.clientWidth + 1, `node ${id}`);
    }
    mount.style.width = "";
  });

  it("the zoom buttons are labelled and at least 24 pixels wide", async function () {
    await startEditing();
    for (const id of ["#zoomInBtn", "#zoomOutBtn", "#jumpToOriginBtn"]) {
      const button = editorOf().shadowRoot.querySelector(id);
      assert.isNotEmpty(button.label, id);
      assert.isAtLeast(button.getBoundingClientRect().width, 24, id);
    }
  });

  it("the divider between the diagram and the detail drags by touch", async function () {
    await startEditing();
    const split = splitOf();
    const divider = split.shadowRoot.querySelector(".divider");
    const upper = split.shadowRoot.querySelector(".itemStart");
    const before = upper.getBoundingClientRect().height;
    const y = center(divider).y;
    touch(divider, "pointerdown", y);
    touch(divider, "pointermove", y - 60);
    touch(divider, "pointerup", y - 60);
    await frames(2);
    const after = upper.getBoundingClientRect().height;
    assert.isBelow(after, before);
    assert.isAtLeast(after, split.minStart);
    assert.equal(scenario.editorState.dividerPosition, Math.round(after));
    assert.equal(getComputedStyle(divider).touchAction, "none");
  });

  it("the divider is a separator that the arrow keys move", async function () {
    await startEditing();
    const split = splitOf();
    const grip = split.shadowRoot.querySelector('[role="separator"]');
    const upper = split.shadowRoot.querySelector(".itemStart");
    assert.equal(grip.getAttribute("aria-orientation"), "horizontal");
    assert.equal(grip.tabIndex, 0);
    key(grip, { key: "End" });
    await frames(2);
    const tall = upper.getBoundingClientRect().height;
    assert.equal(tall, split.maxStart);
    const arrow = key(grip, { key: "ArrowUp" });
    await frames(2);
    assert.isTrue(arrow.defaultPrevented);
    assert.isBelow(upper.getBoundingClientRect().height, tall);
  });

  it("the detail height changes by touch and by key, inside its limits", async function () {
    await startEditing();
    const view = resizeOf();
    const divider = view.shadowRoot.querySelector(".divider");
    const content = view.shadowRoot.querySelector(".content");
    const before = content.getBoundingClientRect().height;
    const y = center(divider).y;
    touch(divider, "pointerdown", y);
    touch(divider, "pointermove", y + 50);
    touch(divider, "pointerup", y + 50);
    await frames(2);
    assert.equal(Math.round(content.getBoundingClientRect().height), Math.min(Math.round(before) + 50, view.maxHeight));
    key(view.shadowRoot.querySelector('[role="separator"]'), { key: "Home" });
    await frames(2);
    assert.equal(content.getBoundingClientRect().height, view.minHeight);
  });

  it("copy and paste keys in authored text and in inputs stay with the text", async function () {
    await startEditing();
    const authored = scenario.querySelector("webwriter-gamebook-page p, webwriter-gamebook-page h2") as HTMLElement;
    for (const k of ["c", "v"]) assert.isFalse(key(authored, { key: k, ctrlKey: true }).defaultPrevented, k);
    const input = deepFind<HTMLInputElement>(scenario.shadowRoot, "input")[0];
    assert.exists(input);
    for (const k of ["c", "v"]) assert.isFalse(key(input, { key: k, ctrlKey: true }).defaultPrevented, k);
  });

  it("a node takes the focus, is selected by Enter, moves with the arrow keys and is deleted with Delete", async function () {
    await startEditing();
    const editor = editorOf();
    const nodeOf = (id: number) => editor.shadowRoot.querySelector(`ww-node[data-ww-key="${id}"]`) as HTMLElement;
    const node = nodeOf(12);
    assert.exists(node);
    assert.isAtLeast(node.tabIndex, 0);
    node.focus();
    key(node, { key: "Enter" });
    await frames(3);
    assert.equal(scenario.editorState.selectedNode.id, 12);
    const moves: any[] = [];
    editor.shadowRoot.querySelector("ww-scene").addEventListener("ww-move", (e: CustomEvent) => moves.push(e.detail));
    const x = () => Number(nodeOf(12).getAttribute("x"));
    const before = x();
    key(node, { key: "ArrowRight" });
    node.dispatchEvent(new KeyboardEvent("keyup", { key: "ArrowRight", bubbles: true, composed: true }));
    await until(() => moves.length && x() > before, "the node to move");
    key(nodeOf(12), { key: "Delete" });
    await until(() => !nodeOf(12), "the node to be deleted");
    assert.equal(scenario.editorState.selectedNode.id, -1);
  });

  it("copy and paste keys in the diagram still work with nodes", async function () {
    await startEditing();
    const surface = editorOf().shadowRoot.querySelector("#nodeEditor");
    assert.isTrue(key(surface, { key: "c", ctrlKey: true }).defaultPrevented);
    assert.isTrue(key(surface, { key: "v", ctrlKey: true }).defaultPrevented);
  });
});

mocha.run();

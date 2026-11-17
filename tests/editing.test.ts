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
import { center, click, deepFind, drag, dataBlock, edit, frames, make, pointer, read, startMount, stopMount, storedNodes, until } from "./helpers";

mocha.setup(getMochaConfig());

describe("<webwriter-branching-scenario> modes", function () {
  this.timeout(30000);
  let scenario: any;

  before(async function () {
    startMount();
    scenario = make("");
    await customElements.whenDefined("webwriter-branching-scenario");
    await scenario.updateComplete;
  });
  after(stopMount);

  const editorOf = () => deepFind<any>(scenario.shadowRoot, "node-editor")[0];
  const nodeOf = (id: number) => editorOf().shadowRoot.querySelector(`ww-node[data-ww-key="${id}"]`);

  it("read mode renders the viewer and no node editor", function () {
    assert.lengthOf(deepFind(scenario, "webwriter-gamebook-viewer"), 1);
    assert.lengthOf(deepFind(scenario.shadowRoot, "node-editor"), 0);
  });

  it("switching to edit mode renders the node editor", async function () {
    edit(scenario);
    await until(() => deepFind(scenario.shadowRoot, "node-editor").length === 1, "node editor");
    assert.lengthOf(deepFind(scenario.shadowRoot, "webwriter-gamebook-viewer"), 0);
  });

  it("the editor draws the stored nodes", async function () {
    const stored = storedNodes(scenario);
    await until(() => deepFind(scenario.shadowRoot, "ww-node").length === Object.keys(stored).length, "nodes");
  });

  it("the editor draws every stored connection", async function () {
    const stored = storedNodes(scenario);
    const wires = Object.values<any>(stored).reduce((sum, node) => sum + Object.values<any>(node.outputs).reduce((n, port) => n + port.connections.length, 0), 0);
    await until(() => deepFind(scenario.shadowRoot, "ww-path").length === wires, "paths");
  });

  it("exactly one node is the start page", function () {
    assert.lengthOf(deepFind(scenario.shadowRoot, "ww-node.origin"), 1);
  });

  it("a stored node is drawn at its stored place", function () {
    assert.equal(getComputedStyle(nodeOf(8)!).translate, "-463px 192px");
  });

  it("the editor does not show an empty diagram while loading", function () {
    assert.equal(editorOf().diagram.nodes.length, Object.keys(storedNodes(scenario)).length);
  });

  it("switching back to read mode renders the viewer again", async function () {
    read(scenario);
    await until(() => deepFind(scenario.shadowRoot, "webwriter-gamebook-viewer").length === 1 && deepFind(scenario.shadowRoot, "node-editor").length === 0, "viewer");
  });

  it("configureScenario does nothing in read mode", async function () {
    await scenario.configureScenario();
    assert.lengthOf(deepFind(scenario.shadowRoot, "#scenario-options"), 0);
  });

  it("configureScenario opens the options dialog in edit mode", async function () {
    edit(scenario);
    await until(() => deepFind(scenario.shadowRoot, "node-editor").length === 1, "node editor again");
    await scenario.configureScenario();
    assert.lengthOf(deepFind(scenario.shadowRoot, "#scenario-options"), 1);
  });
});

describe("<webwriter-branching-scenario> editing the diagram", function () {
  this.timeout(30000);
  let scenario: any;
  let editor: any;
  const transactions: string[] = [];
  const track = (type: string) => () => transactions.push(type);
  const starts = track("ww-transactionstart");
  const ends = track("ww-transactionend");

  const sceneOf = () => editor.shadowRoot.querySelector("ww-scene");
  const nodeOf = (id: number) => editor.shadowRoot.querySelector(`ww-node[data-ww-key="${id}"]`);
  const dataOf = () => storedNodes(scenario);
  const container = (id: number) => scenario.querySelector(`:scope > [drawflownodeid="${id}"]`);

  before(async function () {
    startMount();
    scenario = make("");
    await customElements.whenDefined("webwriter-branching-scenario");
    await scenario.updateComplete;
    edit(scenario);
    await until(() => deepFind(scenario.shadowRoot, "node-editor").length === 1, "node editor");
    editor = deepFind<any>(scenario.shadowRoot, "node-editor")[0];
    await until(() => deepFind(scenario.shadowRoot, "ww-node").length === Object.keys(dataOf()).length, "nodes");
    window.addEventListener("ww-transactionstart", starts);
    window.addEventListener("ww-transactionend", ends);
  });
  after(function () {
    window.removeEventListener("ww-transactionstart", starts);
    window.removeEventListener("ww-transactionend", ends);
    stopMount();
  });

  const wheel = (init: WheelEventInit) => {
    const event = new WheelEvent("wheel", { bubbles: true, composed: true, cancelable: true, clientX: 300, clientY: 300, ...init });
    sceneOf().dispatchEvent(event);
    return event;
  };
  const apart = (a: Element, b: Element) => {
    const [p, q] = [center(a), center(b)];
    return Math.hypot(p.x - q.x, p.y - q.y);
  };

  // The tests build on each other, as the old check page did: the diagram keeps its changes.

  it("the view starts small with the start page in the middle", async function () {
    await until(() => apart(nodeOf(8), sceneOf()) < 3, "the start page in the middle");
    assert.closeTo(nodeOf(8).getBoundingClientRect().width / nodeOf(8).offsetWidth, 0.45, 0.01);
  });

  it("the grid is the scene's background and follows the view", function () {
    assert.equal(sceneOf().getAttribute("background"), "dots");
    assert.equal(sceneOf().style.backgroundImage, "");
  });

  it("a plain wheel is left to the page and Ctrl with the wheel zooms", async function () {
    const width = () => nodeOf(8).getBoundingClientRect().width;
    const before = width();
    assert.isFalse(wheel({ deltaY: -100 }).defaultPrevented);
    await frames();
    assert.equal(width(), before);
    assert.isTrue(wheel({ deltaY: -100, ctrlKey: true }).defaultPrevented);
    await until(() => width() > before, "the zoom");
  });

  it("the jump button glides the view to the start page", async function () {
    wheel({ deltaY: -400, ctrlKey: true });
    await frames();
    const origin = nodeOf(8);
    editor.shadowRoot.querySelector("#jumpToOriginBtn").click();
    await until(() => apart(origin, sceneOf()) < 3, "the start page in the middle");
  });

  it("clicking a node selects it and shows its container", async function () {
    await click(nodeOf(7));
    assert.equal(scenario.editorState.selectedNode.id, 7);
    assert.isTrue(nodeOf(7).hasAttribute("selected"));
    assert.strictEqual(scenario.editorState.selectedContainer, container(7));
  });

  it("clicking another node moves the selection", async function () {
    await click(nodeOf(2));
    assert.equal(scenario.editorState.selectedNode.id, 2);
    assert.isFalse(nodeOf(7).hasAttribute("selected"));
    assert.isTrue(nodeOf(2).hasAttribute("selected"));
  });

  it("clicking the background clears the selection", async function () {
    const at = center(sceneOf());
    pointer(sceneOf(), "pointerdown", at);
    pointer(sceneOf(), "pointerup", at);
    await frames();
    assert.equal(scenario.editorState.selectedNode.id, -1);
    assert.isNull(editor.shadowRoot.querySelector("ww-node[selected]"));
  });

  it("clicking a connection selects it and its source node", async function () {
    const path = editor.shadowRoot.querySelector('ww-path[data-ww-key="8-2-output_1-input_1"]');
    let selected = 0;
    editor.addEventListener("connectionSelected", () => selected++, { once: true });
    sceneOf().dispatchEvent(new CustomEvent("ww-select", { detail: { keys: ["8-2-output_1-input_1"], items: [path] }, bubbles: true, composed: true, cancelable: true }));
    await frames();
    assert.equal(selected, 1);
    assert.isTrue(path.hasAttribute("selected"));
    assert.equal(scenario.editorState.selectedNode.id, 8);
  });

  it("dragging a node moves it, stores the place and is one undo step", async function () {
    const node = nodeOf(12);
    const before = { x: dataOf()[12].pos_x, y: dataOf()[12].pos_y };
    const from = center(node);
    transactions.length = 0;
    await drag(node, from, { x: from.x + 90, y: from.y + 45 });
    const after = dataOf()[12];
    assert.isAbove(after.pos_x, before.x + 100);
    assert.isAbove(after.pos_y, before.y + 50);
    assert.equal(editor.diagram.node(12).pos_x, after.pos_x);
    assert.equal(getComputedStyle(node).translate, `${after.pos_x}px ${after.pos_y}px`);
    assert.include(transactions, "ww-transactionstart");
    assert.equal(transactions.at(-1), "ww-transactionend");
  });

  it("dragging from an output to an input connects the nodes", async function () {
    const port = nodeOf(12).querySelector('[data-ww-port="output_1"]');
    const target = nodeOf(15).querySelector('[data-ww-port="input_1"]');
    const buttons = () => container(12).querySelectorAll("webwriter-gamebook-button").length;
    const before = buttons();
    transactions.length = 0;
    await drag(port, center(port), center(target));
    const connections = dataOf()[12].outputs.output_1.connections;
    assert.lengthOf(connections, 1);
    assert.equal(connections[0].node, "15");
    assert.isTrue(dataOf()[15].inputs.input_1.connections.some((c: any) => c.node === "12"));
    assert.isNotNull(editor.shadowRoot.querySelector('ww-path[data-ww-key="12-15-output_1-input_1"]'));
    assert.equal(buttons(), before + 1);
    assert.include(transactions, "ww-transactionstart");
  });

  it("an output that is connected is full and starts no other wire", async function () {
    const port = nodeOf(12).querySelector('[data-ww-port="output_1"]');
    assert.equal(port.getAttribute("data-ww-capacity"), "1");
    assert.equal(port.getAttribute("data-ww-link"), "flow");
    const target = nodeOf(7).querySelector('[data-ww-port="input_1"]');
    await drag(port, center(port), center(target));
    assert.lengthOf(dataOf()[12].outputs.output_1.connections, 1);
  });

  it("a connection that exists or breaks a rule is refused", function () {
    assert.equal(editor.diagram.addConnection({ outputId: 12, inputId: 15, outputClass: "output_1", inputClass: "input_1" }), "duplicate");
    assert.equal(editor.diagram.addConnection({ outputId: 12, inputId: 99, outputClass: "output_1", inputClass: "input_1" }), "missing");
  });

  it("the context menu deletes a connection and its button", async function () {
    const path = editor.shadowRoot.querySelector('ww-path[data-ww-key="12-15-output_1-input_1"]');
    const context = new CustomEvent("ww-context", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { kind: "path", key: "12-15-output_1-input_1", item: path, hit: path, groups: [], target: null, point: { clientX: 300, clientY: 300 }, via: "pointer" },
    });
    path.dispatchEvent(context);
    await frames();
    assert.isTrue(context.defaultPrevented);
    editor.shadowRoot.querySelector(".deleteButton").click();
    await frames();
    assert.lengthOf(dataOf()[12].outputs.output_1.connections, 0);
    assert.isNull(editor.shadowRoot.querySelector('ww-path[data-ww-key="12-15-output_1-input_1"]'));
    assert.lengthOf(container(12).querySelectorAll("webwriter-gamebook-button"), 0);
  });

  it("a right click on a node selects it and offers the delete button", async function () {
    const node = nodeOf(2);
    const at = center(node);
    node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, composed: true, cancelable: true, clientX: at.x, clientY: at.y }));
    await until(() => editor.shadowRoot.querySelector(".deleteButton"), "the delete button");
    assert.equal(scenario.editorState.selectedNode.id, 2);
    editor.shadowRoot.querySelector("ww-scene").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
    await frames();
  });

  it("the Delete key removes the selected node and its container", async function () {
    await click(nodeOf(12));
    nodeOf(12).dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, composed: true, cancelable: true }));
    await frames();
    assert.isUndefined(dataOf()[12]);
    assert.isNull(nodeOf(12));
    assert.isNull(container(12));
    assert.equal(scenario.editorState.selectedNode.id, -1);
  });

  it("the start page is not deleted by the Delete key", async function () {
    await click(nodeOf(8));
    nodeOf(8).dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true, composed: true, cancelable: true }));
    await frames();
    assert.isOk(dataOf()[8]);
    assert.isOk(nodeOf(8));
  });

  it("adding a page makes a node and a container as one step", async function () {
    const count = Object.keys(dataOf()).length;
    transactions.length = 0;
    editor.addNode("page", "Added page");
    await frames();
    const added = Object.values<any>(dataOf()).find(node => node.data.title === "Added page");
    assert.equal(Object.keys(dataOf()).length, count + 1);
    assert.isOk(added);
    assert.isOk(container(added.id));
    assert.isOk(nodeOf(added.id));
    assert.include(transactions, "ww-transactionstart");
    assert.equal(transactions.at(-1), "ww-transactionend");
  });

  it("a branch takes one incoming connection and none from a branch", async function () {
    editor.addNode("branch", "Fork");
    await frames();
    const fork = Object.values<any>(dataOf()).find(node => node.data.title === "Fork");
    // New nodes appear in the middle of the view, on top of each other: move the fork away so that the wire ends on it.
    editor.diagram.moveNode(fork.id, 1500, 900);
    await frames();
    const target = nodeOf(fork.id).querySelector('[data-ww-port="input_1"]');
    const first = nodeOf(11).querySelector('[data-ww-port="output_2"]');
    await drag(first, center(first), center(target));
    const added = Object.values<any>(dataOf()).find(node => node.data.title === "Added page");
    const second = nodeOf(added.id).querySelector('[data-ww-port="output_1"]');
    await drag(second, center(second), center(target));
    const incoming = dataOf()[fork.id].inputs.input_1.connections;
    assert.lengthOf(incoming, 1);
    assert.equal(incoming[0].node, "11");
    assert.equal(container(fork.id).incomingContainerId, 11);
    assert.lengthOf(dataOf()[added.id].outputs.output_1.connections, 0);
    assert.isTrue(nodeOf(fork.id).classList.contains("branch"));
    assert.equal(editor.diagram.addConnection({ outputId: fork.id, inputId: fork.id, outputClass: "output_1", inputClass: "input_1" }), "missing");
  });

  it("a change of the stored data from outside reaches the editor", async function () {
    const block = dataBlock(scenario);
    const value = JSON.parse(block.textContent!);
    value.editorContent.drawflow.Home.data[8].pos_x = 100;
    block.textContent = JSON.stringify(value);
    await until(() => getComputedStyle(nodeOf(8)).translate === "100px 192px", "the moved node");
  });
});

mocha.run();

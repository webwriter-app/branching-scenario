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
import { WebwriterBranchingScenario } from "../src/widgets/webwriter-branching-scenario";
import tinyTale from "./fixtures/tiny-tale.json";
import { dataBlock, edit, make, mount, startMount, stopMount, storedNodes, until } from "./helpers";

mocha.setup(getMochaConfig());

const fileOf = (value: unknown, name = "scenario.json") => new File([typeof value === "string" ? value : JSON.stringify(value)], name, { type: "application/json" });
const containers = (scenario: Element) => Array.from(scenario.children).filter(child => child.localName.startsWith("webwriter-gamebook-") && !child.localName.endsWith("button"));

describe("<webwriter-branching-scenario> conversions and signals", function () {
  this.timeout(30000);
  let scenario: any;

  beforeEach(async function () {
    startMount();
    scenario = make("");
    await customElements.whenDefined("webwriter-branching-scenario");
    await scenario.updateComplete;
  });
  afterEach(stopMount);

  it("declares its formats for the editor", function () {
    assert.deepEqual(Object.keys(WebwriterBranchingScenario.convertFrom), [".json"]);
    assert.deepEqual(Object.keys(WebwriterBranchingScenario.convertTo), [".json", ".twee", "section"]);
    for (const method of [...Object.values(WebwriterBranchingScenario.convertFrom), ...Object.values(WebwriterBranchingScenario.convertTo)]) {
      assert.isFunction(scenario[method], method);
    }
  });

  it("exports the scenario as JSON with the graph and every page", function () {
    const file = scenario.exportJson() as File;
    assert.equal(file.name, "european-art-history.json");
    return file.text().then(text => {
      const parsed = JSON.parse(text);
      assert.equal(parsed.format, "webwriter-branching-scenario");
      assert.equal(parsed.title, "European Art History");
      assert.equal(Object.keys(parsed.graph.drawflow.Home.data).length, Object.keys(storedNodes(scenario)).length);
      assert.equal(parsed.containers.length, containers(scenario).length);
      assert.notInclude(parsed.containers.join(""), "contenteditable");
    });
  });

  it("imports the fixture only when the returned function runs", async function () {
    const before = scenario.innerHTML;
    const apply = await scenario.importJson(fileOf(tinyTale));
    assert.equal(scenario.innerHTML, before);
    apply();
    await scenario.updateComplete;
    assert.deepEqual(containers(scenario).map(c => c.getAttribute("pagetitle")), ["Start", "Finish"]);
    assert.deepEqual(Object.keys(storedNodes(scenario)), ["1", "2"]);
    assert.equal(JSON.parse(dataBlock(scenario).textContent!).title, "Tiny Tale");
    await until(() => scenario.editorState.title === "Tiny Tale", "title");
  });

  it("rejects invalid files and leaves the scenario unchanged", async function () {
    const before = scenario.innerHTML;
    const cases: [string, File, RegExp][] = [
      ["not JSON", fileOf("{nope"), /not valid JSON/],
      ["other format", fileOf({ ...tinyTale, format: "other" }), /not an export/],
      ["broken link", fileOf({ ...tinyTale, graph: { drawflow: { Home: { data: { 1: { ...tinyTale.graph.drawflow.Home.data["1"], outputs: { output_1: { connections: [{ node: "9", output: "input_1" }] } } } } } } } }), /invalid node graph/],
      ["missing page", fileOf({ ...tinyTale, containers: tinyTale.containers.slice(0, 1) }), /do not match/],
    ];
    for (const [name, file, message] of cases) {
      let error: Error | undefined;
      try { await scenario.importJson(file); } catch (e) { error = e as Error; }
      assert.match(error?.message ?? "", message, name);
    }
    assert.equal(scenario.innerHTML, before);
  });

  it("drops scripts and event handlers from imported pages", async function () {
    const dirty = { ...tinyTale, containers: [
      tinyTale.containers[0].replace("<p>", '<p onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a><a href="java&#9;script:alert(2)">y</a><a href="  JAVA&#10;SCRIPT:alert(3)">z</a><iframe src="data:text/html,x"></iframe><object data="x"></object><embed src="x">'),
      tinyTale.containers[1],
    ] };
    (await scenario.importJson(fileOf(dirty)))();
    const html = containers(scenario)[0].innerHTML;
    assert.notInclude(html, "onclick");
    assert.notInclude(html, "<script");
    assert.notInclude(html, "javascript:");
    assert.notMatch(html, /java\s*script:/i);
    assert.notMatch(html, /<(object|embed)|data:text/i);
  });

  it("round-trips the scenario through its own file", async function () {
    const first = JSON.parse(await (scenario.exportJson() as File).text());
    (await scenario.importJson(fileOf(first)))();
    await scenario.updateComplete;
    const second = JSON.parse(await (scenario.exportJson() as File).text());
    assert.deepEqual(second.graph, first.graph);
    assert.equal(second.title, first.title);
    assert.deepEqual(second.containers, first.containers);
  });

  it("imports into a scenario that is being edited", async function () {
    edit(scenario);
    await until(() => scenario.nodeEditor, "editor");
    (await scenario.importJson(fileOf(tinyTale)))();
    await until(() => scenario.nodeEditor.diagram.nodes.length === 2, "graph restored");
    assert.equal(containers(scenario).length, 2);
  });

  it("exports a Twee story with a passage per node and labelled links", async function () {
    const text = await (scenario.exportTwee() as File).text();
    const nodes = Object.values(storedNodes(scenario)) as any[];
    assert.equal((text.match(/^:: /gm) ?? []).length, nodes.length + 2);
    assert.match(text, /^:: StoryTitle\nEuropean Art History/);
    assert.match(text, /"start": "A Short Course"/);
    assert.include(text, "[[Start Course->Introduction]]");
    assert.match(text, /^:: Introduction \[page\] \{"position"/m);
  });

  it("converts pages to sections that link to each other", function () {
    const fragment = scenario.toSections() as DocumentFragment;
    const sections = Array.from(fragment.children);
    const nodes = Object.values(storedNodes(scenario)) as any[];
    assert.equal(sections.length, nodes.filter(node => node.class !== "branch").length);
    assert.isTrue(sections.every(section => section.localName === "section" && section.querySelector("h2")));
    for (const link of fragment.querySelectorAll('a[href^="#scenario-"]')) {
      assert.exists(fragment.querySelector(link.getAttribute("href")!), link.textContent!);
    }
    assert.notExists(fragment.querySelector("webwriter-gamebook-button"));
  });

  it("publishes the current page and whether it has ended", async function () {
    const page = scenario.signals.page;
    const ended = scenario.signals.ended;
    assert.equal(page, scenario.signals.page, "the signal instance is stable");
    await until(() => page.get() === "A Short Course", "origin page");
    assert.isFalse(ended.get());
    const button = scenario.querySelector('webwriter-gamebook-page[pagetitle="A Short Course"] webwriter-gamebook-button');
    await button.updateComplete;
    button.button.click();
    await until(() => page.get() === "Introduction", "next page");
  });

  it("an end page publishes ended and edit mode clears the page", async function () {
    (await scenario.importJson(fileOf(tinyTale)))();
    const page = scenario.signals.page;
    await until(() => page.get() === "Start", "start");
    scenario.querySelector("webwriter-gamebook-button").button.click();
    await until(() => scenario.signals.ended.get() === true, "ended");
    assert.equal(page.get(), "Finish");
    edit(scenario);
    await until(() => scenario.nodeEditor, "editor");
    assert.equal(page.get(), "");
    assert.isFalse(scenario.signals.ended.get());
  });
});

mocha.run();

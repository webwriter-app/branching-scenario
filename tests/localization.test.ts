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
import { deepFind, deepText, make, startMount, stopMount, until } from "./helpers";

mocha.setup(getMochaConfig());

describe("<webwriter-branching-scenario> localization", function () {
  this.timeout(30000);
  let english: any;
  let german: any;
  let french: any;

  const toolbarText = (scenario: Element) => deepFind(scenario.shadowRoot!, "node-editor-toolbar").map(deepText).join(" ");

  before(async function () {
    startMount();
    english = make("");
    await customElements.whenDefined("webwriter-branching-scenario");
    await english.updateComplete;
    english.setAttribute("contenteditable", "");
    german = make("de");
    french = make("fr");
    for (const scenario of [german, french]) scenario.setAttribute("contenteditable", "");
  });
  after(stopMount);

  it("an editor in German shows German texts", async function () {
    await until(() => toolbarText(german).includes("Hinzufügen"), "German toolbar");
  });

  it("an editor in French on the same page shows French texts", async function () {
    await until(() => toolbarText(french).includes("Ajouter"), "French toolbar");
  });

  it("the English instance is not changed by the others", async function () {
    await until(() => toolbarText(english).includes("Add"), "English toolbar");
    assert.notInclude(toolbarText(english), "Hinzufügen");
  });

  it("the drawer action label follows the language", async function () {
    await until(() => german.actions.configureScenario.label === "Szenario-Optionen" && english.actions.configureScenario.label === "Scenario options", "action label");
  });

  it("the drawer is told about a language change", async function () {
    let told = 0;
    german.addEventListener("optionschange", () => told++);
    german.closest("div").lang = "fr";
    await until(() => german.actions.configureScenario.label !== "Szenario-Optionen", "new label");
    assert.isAbove(told, 0);
  });

  it("a changed language reaches the editor's inner components", async function () {
    await until(() => toolbarText(german).includes("Ajouter"), "French after change");
  });

  it("a page widget localizes its drawer option", async function () {
    const page = german.querySelector("webwriter-gamebook-page");
    await until(() => page.options.pageTitle.label !== "Page title", "page title label");
  });

  it("the authored lang attribute is untouched", function () {
    const page = german.querySelector("webwriter-gamebook-page");
    assert.isFalse(german.hasAttribute("lang"));
    assert.isFalse(page.hasAttribute("lang"));
  });
});

mocha.run();

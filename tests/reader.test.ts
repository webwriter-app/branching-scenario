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
import type { WebwriterGamebookBranchButton } from "../src/widgets/webwriter-gamebook-branch-button";
import type { WebwriterGamebookButton } from "../src/widgets/webwriter-gamebook-button";
import type { WebwriterGamebookPage } from "../src/widgets/webwriter-gamebook-page";
import type { WebwriterGamebookPopup } from "../src/widgets/webwriter-gamebook-popup";
import { settle } from "./helpers";

mocha.setup(getMochaConfig());

const fixture = document.createElement("main");

async function load(markup: string) {
  fixture.innerHTML = markup;
  const scenario = fixture.firstElementChild as HTMLElement;
  await settle();
  return scenario;
}

function container<T extends HTMLElement>(scenario: HTMLElement, id: number) {
  return scenario.querySelector<T>(`[drawflownodeid="${id}"]`)!;
}

async function activate(owner: Element, targetId: number) {
  const choice = owner.querySelector<WebwriterGamebookButton | WebwriterGamebookBranchButton>(`[datatargetid="${targetId}"]`)!;
  choice.button.shadowRoot!.querySelector("button")!.click();
  await settle();
}

function visible(element: Element) {
  return getComputedStyle(element).display !== "none";
}

describe("<webwriter-branching-scenario> reader", function () {
  before(function () { document.body.append(fixture); });
  afterEach(function () { fixture.replaceChildren(); });
  after(function () { fixture.remove(); });

  it("navigates between pages and popups and keeps the authored HTML", async function () {
    const scenario = await load(`
      <webwriter-branching-scenario>
        <script type="application/json" slot="data">{"title":"Saved scenario"}</script>
        <webwriter-gamebook-page drawflownodeid="1" originpage="1" style="display:none;color:navy">
          <!-- Author's comment -->
          <p><em>Welcome</em></p>
          <webwriter-gamebook-button datatargetid="2"></webwriter-gamebook-button>
        </webwriter-gamebook-page>
        <webwriter-gamebook-popup drawflownodeid="2" contenteditable="" titlelabel="First choice">
          <webwriter-gamebook-button datatargetid="3"></webwriter-gamebook-button>
        </webwriter-gamebook-popup>
        <webwriter-gamebook-popup drawflownodeid="3" contenteditable="">
          <webwriter-gamebook-button datatargetid="1"></webwriter-gamebook-button>
        </webwriter-gamebook-popup>
        <webwriter-gamebook-page drawflownodeid="4"><p>Alternate destination</p></webwriter-gamebook-page>
      </webwriter-branching-scenario>
    `);
    const origin = container<WebwriterGamebookPage>(scenario, 1);
    const first = container<WebwriterGamebookPopup>(scenario, 2);
    const second = container<WebwriterGamebookPopup>(scenario, 3);
    const html = scenario.innerHTML;
    assert(visible(origin) && !visible(first), "Read the legacy origin and inline styles");
    assert(!first.dialog && !second.dialog, "Defer dialogs until requested");

    const show = first.showDialog.bind(first);
    let opens = 0;
    first.showDialog = () => { opens++; return show(); };
    for (let visit = 0; visit < 3; visit++) {
      await activate(origin, 2);
      assert((first.dialog as any).open && visible(first), "Open the chosen popup");
      await activate(first, 3);
      assert((second.dialog as any).open && !visible(first), "Replace the previous popup");
      await activate(second, 1);
      assert(visible(origin) && !visible(second), "Return to the page");
    }
    assert(opens === 3, "Each activation navigates once after revisits");
    assert(scenario.innerHTML === html, "Reader navigation preserves authored HTML");

    origin.querySelector("webwriter-gamebook-button")!.setAttribute("datatargetid", "4");
    await activate(origin, 4);
    assert(visible(container(scenario, 4)) && !visible(origin), "Read the current choice target");

    scenario.remove();
    fixture.append(scenario);
    await settle();
    assert(visible(container(scenario, 4)), "Keep the current page after reconnecting");

    const script = scenario.querySelector('script[slot="data"]')!;
    (script.firstChild as Text).data = '{"title":"Updated from the document"}';
    await settle();
    const title = scenario.shadowRoot!.querySelector("webwriter-gamebook-viewer")!
      .shadowRoot!.querySelector(".gamebookTitle")!;
    assert(title.textContent === "Updated from the document", "Restore direct text edits");
    assert(visible(container(scenario, 4)), "A title edit keeps the current page");
  });

  it("applies the branch rules of a submitted task", async function () {
    const scenario = await load(`
      <webwriter-branching-scenario>
        <webwriter-gamebook-page drawflownodeid="1" originpage="1">
          <webwriter-task id="question"></webwriter-task>
          <webwriter-gamebook-branch-button datatargetid="2"></webwriter-gamebook-branch-button>
        </webwriter-gamebook-page>
        <webwriter-gamebook-branch drawflownodeid="2">
          <script type="application/json" slot="data">{"rules":[{"elementId":"question","condition":"correct","target":3}],"elseRule":{"target":4}}</script>
        </webwriter-gamebook-branch>
        <webwriter-gamebook-page drawflownodeid="3">Correct</webwriter-gamebook-page>
        <webwriter-gamebook-page drawflownodeid="4">Fallback</webwriter-gamebook-page>
      </webwriter-branching-scenario>
    `);
    const start = container<WebwriterGamebookPage>(scenario, 1);
    const task = start.querySelector<HTMLElement & { answer: HTMLElement }>("webwriter-task")!;
    task.answer = Object.assign(document.createElement("webwriter-text"), { solution: "yes", value: "yes" });
    const choice = start.querySelector<WebwriterGamebookBranchButton>("webwriter-gamebook-branch-button")!;
    assert(choice.disabled, "Require the branch input to be submitted");
    task.dispatchEvent(new Event("submit", { bubbles: true, composed: true, cancelable: true }));
    await settle();
    assert(!choice.disabled, "Enable the choice after a valid submission");
    await activate(start, 2);
    assert(visible(container(scenario, 3)), "Use the matching rule");
  });
});

mocha.run();

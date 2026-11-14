import "../src/widgets/webwriter-branching-scenario/webwriter-branching-scenario";
import "../src/widgets/webwriter-gamebook-page/webwriter-gamebook-page";
import "../src/widgets/webwriter-gamebook-popup/webwriter-gamebook-popup";
import "../src/widgets/webwriter-gamebook-branch/webwriter-gamebook-branch";
import "../src/widgets/webwriter-gamebook-button/webwriter-gamebook-button";
import "../src/widgets/webwriter-gamebook-branch-button/webwriter-gamebook-branch-button";

const fixture = document.createElement("main");
document.body.append(fixture);

const settle = () => new Promise(resolve => setTimeout(resolve, 0));

function assert(condition, message) {
  if (!condition) throw Error(message);
}

async function load(markup) {
  fixture.innerHTML = markup;
  const scenario = fixture.firstElementChild;
  await settle();
  return scenario;
}

function container(scenario, id) {
  return scenario.querySelector(`[drawflownodeid="${id}"]`);
}

async function activate(owner, targetId) {
  const choice = owner.querySelector(`[datatargetid="${targetId}"]`);
  choice.button.shadowRoot.querySelector("button").click();
  await settle();
}

function visible(element) {
  return getComputedStyle(element).display !== "none";
}

async function testNavigation() {
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
  const origin = container(scenario, 1);
  const first = container(scenario, 2);
  const second = container(scenario, 3);
  const html = scenario.innerHTML;
  assert(visible(origin) && !visible(first), "Read the legacy origin and inline styles");
  assert(!first.dialog && !second.dialog, "Defer dialogs until requested");

  const show = first.showDialog.bind(first);
  let opens = 0;
  first.showDialog = () => { opens++; return show(); };
  for (let visit = 0; visit < 3; visit++) {
    await activate(origin, 2);
    assert(first.dialog.open && visible(first), "Open the chosen popup");
    await activate(first, 3);
    assert(second.dialog.open && !visible(first), "Replace the previous popup");
    await activate(second, 1);
    assert(visible(origin) && !visible(second), "Return to the page");
  }
  assert(opens === 3, "Each activation navigates once after revisits");
  assert(scenario.innerHTML === html, "Reader navigation preserves authored HTML");

  origin.querySelector("webwriter-gamebook-button").setAttribute("datatargetid", "4");
  await activate(origin, 4);
  assert(visible(container(scenario, 4)) && !visible(origin), "Read the current choice target");

  scenario.remove();
  fixture.append(scenario);
  await settle();
  assert(visible(container(scenario, 4)), "Keep the current page after reconnecting");

  const script = scenario.querySelector('script[slot="data"]');
  script.firstChild.data = '{"title":"Updated from the document"}';
  await settle();
  const title = scenario.shadowRoot.querySelector("webwriter-gamebook-viewer")
    .shadowRoot.querySelector(".gamebookTitle");
  assert(title.textContent === "Updated from the document", "Restore direct text edits");
  assert(visible(container(scenario, 4)), "A title edit keeps the current page");
}

async function testBranchRules() {
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
  const start = container(scenario, 1);
  const task = start.querySelector("webwriter-task");
  task.answer = Object.assign(document.createElement("webwriter-text"), { solution: "yes", value: "yes" });
  const choice = start.querySelector("webwriter-gamebook-branch-button");
  assert(choice.disabled, "Require the branch input to be submitted");
  task.dispatchEvent(new Event("submit", { bubbles: true, composed: true, cancelable: true }));
  await settle();
  assert(!choice.disabled, "Enable the choice after a valid submission");
  await activate(start, 2);
  assert(visible(container(scenario, 3)), "Use the matching rule");
}

function report(detail) {
  window.dispatchEvent(new CustomEvent("test-update", { detail }));
}

report({ type: "beforeAll" });
for (const [id, run] of Object.entries({ navigation: testNavigation, branchRules: testBranchRules })) {
  const test = { id, path: ["Branching Scenario", id] };
  report({ type: "beforeOne", ...test });
  try {
    await run();
    report({ type: "afterOne", ...test, passed: true });
  } catch (error) {
    console.error(error);
    report({ type: "afterOne", ...test, passed: false });
  } finally {
    fixture.replaceChildren();
  }
}
fixture.remove();
report({ type: "afterAll" });

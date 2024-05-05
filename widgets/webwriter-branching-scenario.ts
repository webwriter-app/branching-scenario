import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement } from "lit/decorators.js";

@customElement("webwriter-branching-scenario")
export class WebwriterBranchingScenario extends LitElementWw {
  render() {
    return html` <div>
      <h1>Test</h1>
      <p>Hello, world!</p>
    </div>`;
  }
}

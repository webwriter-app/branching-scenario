import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";

@customElement("webwriter-branching-scenario")
export class WebwriterBranchingScenario extends LitElementWw {
  static styles = css`
    .container {
      border-style: solid;
      border-color: #000000;
      border-width: 1px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
    }

    .controls {
      /* Styles for special div */
      background-color: #f0f0f0;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      gap: 10px; /* Adjust the value to your desired spacing */
      padding: 10px;
    }
  `;

  render() {
    console.log("render", this);
    return html` <head> </head>
      <body>
        <div class="container">
          <div>Graph</div>
          <div class="controls">
            <button>Zoom In</button>
            <button>Zoom Out</button>
            <button>Add Sheet</button>
            <button>Add Branch</button>
          </div>
          <div>Sheet</div>
        </div>
      </body>`;
  }
}

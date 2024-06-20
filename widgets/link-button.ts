import { html, css, LitElement, unsafeCSS } from "lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { LitElementWw } from "@webwriter/lit";

import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import { SlOption, SlSelect } from "@shoelace-style/shoelace";

@customElement("link-button")
export class LinkButton extends LitElementWw {
  @property({ type: String }) name: string;
  @property({ type: Number }) dataTargetId: number;
  @property({ type: String }) identifier: string;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
    };
  }

  // connectedCallback() {
  //   console.log("LinkButton added to the DOM");
  //   this.innerHTML = `
  //     <div>
  //       <sl-button variant="text" size="medium" style="padding: 0px;"
  //         >${this.name}</sl-button
  //       >
  //       <input
  //         part="options"
  //         .value=${this.name}
  //         @change=${(e) => (this.name = e.target.value)}
  //       />
  //     </div>
  //   `;
  // }

  //TODO: Focus is messed up, when clicking on the input, the focus shifts away from the button
  render() {
    return html`
      <div>
        <sl-button variant="text" size="medium" style="padding: 0px;"
          >${this.name}</sl-button
        >
        <sl-select clearable id="nodeSelect" value="option-1">
          <sl-option value="option-1">Option 1</sl-option>
          <sl-option value="option-2">Option 2</sl-option>
          <sl-option value="option-3">Option 3</sl-option>
        </sl-select>
        <input
          part="options"
          .value=${this.name}
          @change=${(e) => (this.name = e.target.value)}
        />
      </div>
    `;
  }
}

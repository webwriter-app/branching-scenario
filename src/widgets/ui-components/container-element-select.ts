import { html, css, LitElement, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlSelect,
  SlOption,
  SlDivider,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace";
import Drawflow, { DrawflowNode } from "drawflow";

const NO_NODE_SELECTED: DrawflowNode = {
  id: -1,
  name: "unselect",
  inputs: {},
  outputs: {},
  pos_x: 0,
  pos_y: 0,
  class: "unselect",
  data: {},
  html: "",
  typenode: false,
};

@customElement("container-element-select")
export class ContainerElementSelect extends LitElement {
  @property({ type: Object }) accessor container;
  @property({ type: Object }) accessor options = [];
  @property({ type: Object }) accessor selectedNode;
  @property({ type: String }) accessor value;

  @state() accessor searchTerm = "";

  @query("sl-input") accessor searchElement!: SlInput;
  @query("sl-select") accessor selectElement!: SlSelect;

  static styles = css`
    .nodeSelect {
      width: 100%;
    }
    .node-option-visible {
      display: block;
    }
    .node-option-hidden {
      display: none;
    }
  `;

  /*

  */
  // Move the option gathering logic to firstUpdated lifecycle method
  firstUpdated() {
    const containersSlot = this.container?.shadowRoot.querySelector("slot");
    const assignedElements = containersSlot.assignedElements();

    // Check if there is a non-empty <p> element in the assignedElements
    const hasNonEmptyP = assignedElements.some(
      (el) => el.tagName === "P" && el.textContent.trim() !== ""
    );

    if (hasNonEmptyP) {
      this.options = [...this.options, { tagName: "Text" }];
    }

    // Filter nodes with class "ww-widget" and add them to this.options
    const wwWidgetElements = assignedElements.filter((el) =>
      el.classList.contains("ww-widget")
    );

    this.options = [...this.options, ...wwWidgetElements];
  }

  render() {
    return html`
      <sl-select
        placement="bottom"
        hoist
        class="nodeSelect"
        placeholder="Not connected"
        clearable
        .value=${this.value}
        @sl-input=${this._handleElementSelect}
      >
        ${repeat(
          this.options,
          (element) => (element as HTMLElement).id, // or use another unique identifier
          (element) => html`
            <sl-option value=${(element as HTMLElement).tagName}
              >${(element as HTMLElement).tagName}</sl-option
            >
          `
        )}
      </sl-select>
    `;
  }

  private _handleElementSelect(event: Event) {
    if (
      event.target instanceof HTMLElement &&
      event.target.tagName.toLowerCase() === "sl-select"
    ) {
      const selectedValue = (event.target as SlSelect).value;
      this.value = selectedValue;
    }
  }
}

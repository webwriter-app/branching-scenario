import { html, css, LitElement, PropertyValues } from "lit";

import { classMap } from "lit-html/directives/class-map.js";
import { customElement, property, state, query } from "lit/decorators.js";
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlSelect,
  SlOption,
  SlDivider,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace";
import Drawflow, { DrawflowNode } from "drawflow";
import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import search from "@tabler/icons/outline/search.svg";

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

@customElement("output-connection-control")
export class OutputConnectionControl extends LitElement {
  @property({ type: Object }) accessor nodeEditor;
  @property({ type: Object }) accessor selectedNode;
  @property({ type: Number }) accessor incomingNodeId;
  @property({ type: String }) accessor outputClass;
  @property({ type: Boolean }) accessor disabled;
  @property({ type: Boolean }) accessor required;
  @property({ type: Boolean }) accessor hasValue = false;
  @property({ type: Boolean }) accessor inOutputList; // New attribute

  @state() accessor searchTerm = "";

  @query("sl-input") accessor searchElement!: SlInput;
  @query("sl-select") accessor selectElement!: SlSelect;

  static styles = css`
    .node-option-visible {
      display: block;
    }
    .node-option-hidden {
      display: none;
    }

    :host([in-output-list]) sl-select {
      --sl-input-border-width: 0px;
      --sl-input-padding: 0px;
    }
    :host([in-output-list]) sl-select::part(listbox) {
      width: 250px;
      height: 250px;
    }

    :host([in-output-list]) sl-select::part(display-input) {
      border: none;
      font-weight: 500;
      color: #0084c7;
      font-size: 12px;
      width: 70px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
    }

    sl-select::part(listbox) {
      width: 250px;
      height: 250px;
    }

    sl-select.no-value::part(combobox) {
      border: 1px solid #dc2625;
    }

    .icon-header {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .searchInput {
      --sl-input-border-width: 1px;
    }
  `;

  /*

  */
  firstUpdated() {
    const openObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "open"
        ) {
          this.onOpenChange(this.selectElement.hasAttribute("open"));
        }
      });
    });
    openObserver.observe(this.selectElement, { attributes: true });

    this.hasValue = this.selectElement.value != "-1";
  }

  /*

  */
  render() {
    const data = this.nodeEditor.editor.drawflow.drawflow.Home.data;
    const nodeId = this.selectedNode.id;

    const options = (nodeClass) =>
      Object.keys(data)
        .filter(
          (key) =>
            data[key].id !== nodeId &&
            data[key].id !== Number(this.incomingNodeId) &&
            data[key].class === nodeClass
        )
        .map(
          (key) => html`<sl-option
            value="${data[key].id}"
            class="node-option-visible ${data[key].class}"
            @mouseenter=${() => this.nodeEditor._highlightNode(data[key].id)}
            @mouseleave=${() => this.nodeEditor._unhighlightNode(data[key].id)}
            >${data[key].data.title}</sl-option
          >`
        );

    const hasNodesOfClass = (nodeClass) =>
      Object.keys(data).some(
        (key) =>
          data[key].id !== nodeId &&
          data[key].id !== Number(this.incomingNodeId) &&
          data[key].class === nodeClass
      );

    return html`
      ${console.log(this.required)}
      <sl-select
        placement="bottom"
        hoist
        class="${!this.hasValue && this.required && !this.disabled
          ? "no-value"
          : ""}"
        size=${this.inOutputList ? "small" : "medium"}
        placeholder="Not connected"
        clearable
        .value=${this.selectedNode?.outputs?.[this.outputClass]
          ?.connections?.[0]?.node ?? "-1"}
        @sl-input=${this._handleUserInputTargetPage}
        @mouseenter=${() => this._highlightConnectionAndNode()}
        @mouseleave=${() => this._unhighlightConnectionAndNode()}
        ?disabled=${this.disabled}
      >
        <div style="padding: 10px">
          <sl-input
            placeholder="Search..."
            @sl-input=${this.handleSearch}
            @click=${() => this.searchElement.focus()}
            @keydown=${this.handleKeydown}
            clearable
            class="searchInput"
          >
            <sl-icon src=${search} slot="prefix"></sl-icon>
          </sl-input>
        </div>
        <sl-divider></sl-divider>
        ${Object.keys(data).length === 1
          ? html`<small>No nodes found</small>`
          : html`
              ${hasNodesOfClass("page") || hasNodesOfClass("origin")
                ? html`
                    <small class="icon-header" id="divider-page"
                      ><sl-icon src="${file}"></sl-icon> Pages</small
                    >
                    ${options("page")} ${options("origin")}
                    ${hasNodesOfClass("popup") || hasNodesOfClass("branch")
                      ? html`<sl-divider id="divider-page"></sl-divider>`
                      : ""}
                  `
                : ""}
              ${hasNodesOfClass("popup")
                ? html`
                    <small class="icon-header" id="divider-popup"
                      ><sl-icon src="${squares}"></sl-icon> Popup</small
                    >
                    ${options("popup")}
                    ${hasNodesOfClass("branch")
                      ? html`<sl-divider id="divider-popup"></sl-divider>`
                      : ""}
                  `
                : ""}
              ${hasNodesOfClass("branch")
                ? html`
                    <small class="icon-header" id="divider-branch"
                      ><sl-icon src="${arrowsSplit2}"></sl-icon> Smart
                      Branch</small
                    >
                    ${options("branch")}
                  `
                : ""}
              <small id="no-nodes-found" style="display: none"
                >No nodes found</small
              >
            `}
      </sl-select>
    `;
  }

  /*

  */
  private handleSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.searchTerm = searchTerm;

    this.shadowRoot.querySelectorAll("sl-option").forEach((option) => {
      const title = option.textContent.toLowerCase();
      option.classList.toggle(
        "node-option-visible",
        title.includes(searchTerm)
      );
      option.classList.toggle(
        "node-option-hidden",
        !title.includes(searchTerm)
      );
    });

    this._toggleDividers(
      "page",
      this.hasVisibleNodesOfClass("page") ||
        this.hasVisibleNodesOfClass("origin")
    );
    this._toggleDividers("popup", this.hasVisibleNodesOfClass("popup"));
    this._toggleDividers("branch", this.hasVisibleNodesOfClass("branch"));
    (
      this.shadowRoot.querySelector("#no-nodes-found") as HTMLElement
    ).style.display = this._hasNoVisibleNodes() ? "block" : "none";
  }

  /*

  */
  private _toggleDividers(dividerId: string, shouldDisplay: boolean) {
    const displayStyle = shouldDisplay ? "flex" : "none";
    this.shadowRoot
      .querySelectorAll(`#divider-${dividerId}`)
      .forEach((element) => {
        (element as HTMLElement).style.display = displayStyle;
      });
  }

  /*

  */
  private _hasNoVisibleNodes() {
    return !(
      this.hasVisibleNodesOfClass("page") ||
      this.hasVisibleNodesOfClass("origin") ||
      this.hasVisibleNodesOfClass("popup") ||
      this.hasVisibleNodesOfClass("branch")
    );
  }

  /*

  */
  private hasVisibleNodesOfClass(nodeClass: string) {
    return (
      this.shadowRoot.querySelectorAll(`.node-option-visible.${nodeClass}`)
        .length > 0
    );
  }

  /*

  */
  private handleKeydown(event: KeyboardEvent) {
    this.searchElement.focus();
    event.stopPropagation();
  }

  /*

  */
  private _handleUserInputTargetPage(event: Event) {
    // console.log(this.selectElement);
    // const partElement = this.selectElement.shadowRoot?.querySelector(
    //   `[part="display-input"]`
    // );

    // console.log(partElement);

    // const placeholder = partElement.children;
    // console.log(placeholder);

    if (
      event.target instanceof HTMLElement &&
      event.target.tagName.toLowerCase() === "sl-select"
    ) {
      //console.log(event.target);
      const selectedValue = (event.target as SlSelect).value;
      const connections =
        this.selectedNode?.outputs?.[this.outputClass]?.connections;

      this.hasValue = selectedValue !== "";

      if (connections?.[0]?.node === undefined && selectedValue) {
        this.nodeEditor.editor.addConnection(
          this.selectedNode.id,
          selectedValue,
          this.outputClass,
          "input_1"
        );
      }
      //
      else if (connections?.[0]?.node !== undefined && selectedValue) {
        this.nodeEditor.editor.removeSingleConnection(
          this.selectedNode.id,
          connections[0].node,
          this.outputClass,
          "input_1"
        );
        this.nodeEditor.editor.addConnection(
          this.selectedNode.id,
          selectedValue,
          this.outputClass,
          "input_1"
        );
      }
      //
      else if (!selectedValue) {
        this._unhighlightConnectionAndNode();
        this.nodeEditor.editor.removeSingleConnection(
          this.selectedNode.id,
          connections?.[0]?.node,
          this.outputClass,
          "input_1"
        );
      }
    }
  }

  /*

  */
  private _highlightConnectionAndNode() {
    const inputNodeId =
      this.selectedNode?.outputs?.[
        this.outputClass
      ]?.connections?.[0]?.node.toString();
    if (!this.selectElement.open && inputNodeId) {
      this.nodeEditor.highlightConnectionAndNode(
        this.selectedNode.id,
        inputNodeId,
        this.outputClass,
        "input_1",
        inputNodeId
      );
    }
  }

  /*

  */
  private _unhighlightConnectionAndNode() {
    const inputNodeId =
      this.selectedNode?.outputs?.[
        this.outputClass
      ]?.connections?.[0]?.node.toString();
    if (inputNodeId) {
      this.nodeEditor.unhighlightConnectionAndNode(
        this.selectedNode.id,
        inputNodeId,
        this.outputClass,
        "input_1",
        inputNodeId
      );
    }
  }

  /*

  */
  private onOpenChange(isOpen: boolean) {
    const nodeId =
      this.selectedNode?.outputs?.[
        this.outputClass
      ]?.connections?.[0]?.node.toString();
    if (isOpen) {
      this._unhighlightConnectionAndNode();
      this.nodeEditor._highlightOutput(this.selectedNode.id, this.outputClass);
    } else {
      this.nodeEditor._unhighlightOutput(
        this.selectedNode.id,
        this.outputClass
      );
    }
  }
}

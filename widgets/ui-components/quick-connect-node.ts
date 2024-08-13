import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";
import { DrawflowNode } from "drawflow";
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlIcon,
  SlDivider,
  SlInput,
  SlDropdown,
  SlMenu,
  SlMenuItem,
} from "@shoelace-style/shoelace";

import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import route2 from "@tabler/icons/outline/route-2.svg";
import search from "@tabler/icons/outline/search.svg";

@customElement("quick-connect-node")
export class QuickConnectNode extends LitElementWw {
  @query("sl-select")
  nodeSelect;

  @query("sl-input")
  inputElement!: SlInput;

  @property({ type: Object }) nodeEditor;
  @property({ type: Boolean }) isNodeSelected = false;
  @property({ type: Object, attribute: false }) selectedNode?: DrawflowNode;

  @property({ attribute: false }) changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?,
    outputHadConnections?
  ) => {};

  @state() searchTerm = "";

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-icon": SlIcon,
      "sl-divider": SlDivider,
      "sl-input": SlInput,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
    };
  }

  //import CSS
  static get styles() {
    return css`
      .controls {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        font-family: "Roboto", sans-serif;
        font-size: 20px;
        font-weight: bold;
        box-sizing: border-box;
        width: 100%;
      }

      sl-select {
        flex-grow: 1; /* Allow sl-select to grow and take up remaining space */
      }

      sl-select::part(listbox) {
        width: 250px;
      }

      sl-button {
        width: 100px; /* Set a fixed width for the button */
        flex-shrink: 0; /* Prevent the button from shrinking */
      }

      .icon-header {
        display: flex;
        align-items: center;
        gap: 7px;
      }
    `;
  }

  protected firstUpdated(_changedProperties: any): void {
    this._resetSelect();
  }

  render() {
    const data = this.nodeEditor.editor.drawflow.drawflow.Home.data;
    const nodeId = this.selectedNode.id;

    const filteredNodes = Object.keys(data).filter(
      (key) =>
        data[key].id !== nodeId &&
        data[key].data.title
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );

    const filterAndMapOptions = (nodeClass) =>
      filteredNodes
        .filter((key) => data[key].class === nodeClass)
        .map(
          (key) => html`<sl-option
            value="${data[key].id}"
            @mouseenter=${() => this.nodeEditor._highlightNode(data[key].id)}
            @mouseleave=${() => this.nodeEditor._unhighlightNode(data[key].id)}
          >
            ${data[key].data.title}
          </sl-option>`
        );

    const hasNodesOfClass = (nodeClass) =>
      filteredNodes.some((key) => data[key].class === nodeClass);

    return html`
      <div class="controls">
        <sl-select
          hoist
          placeholder="Page"
          @sl-change=${this._handleSelectChange}
        >
          <div style="padding: 10px">
            <sl-input
              placeholder="Search..."
              @sl-input=${this.handleSearch}
              @click=${() => this.inputElement.focus()}
              @keydown=${this.handleKeydown}
              clearable
            >
              <sl-icon src=${search} slot="prefix"></sl-icon>
            </sl-input>
          </div>
          <sl-divider></sl-divider>

          ${filteredNodes.length === 0
            ? html`<small>No nodes found</small>`
            : html`
                ${hasNodesOfClass("page") || hasNodesOfClass("origin")
                  ? html`
                      <small class="icon-header"
                        ><sl-icon src="${file}"></sl-icon> Pages</small
                      >
                      ${filterAndMapOptions("page")}
                      ${filterAndMapOptions("origin")}
                      ${hasNodesOfClass("popup") || hasNodesOfClass("branch")
                        ? html`<sl-divider></sl-divider>`
                        : ""}
                    `
                  : ""}
                ${hasNodesOfClass("popup")
                  ? html`
                      <small class="icon-header"
                        ><sl-icon src="${squares}"></sl-icon> Popup</small
                      >
                      ${filterAndMapOptions("popup")}
                      ${hasNodesOfClass("branch")
                        ? html`<sl-divider></sl-divider>`
                        : ""}
                    `
                  : ""}
                ${hasNodesOfClass("branch")
                  ? html`
                      <small class="icon-header"
                        ><sl-icon src="${arrowsSplit2}"></sl-icon> Smart
                        Branch</small
                      >
                      ${filterAndMapOptions("branch")}
                    `
                  : ""}
              `}
        </sl-select>
        <sl-button
          @click=${() => this._connectSelectedNodes()}
          ?disabled=${!this.isNodeSelected}
          ><sl-icon src=${route2} slot="prefix"></sl-icon> Connect</sl-button
        >
      </div>
    `;
  }

  /*


  */
  private _handleSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.isNodeSelected = !!selectElement.value;
  }

  /*


  */
  private _addOutputToSelectedNode() {
    this.nodeEditor.editor.addNodeOutput(this.selectedNode.id);
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputCreated"
    );
  }

  /*


  */
  private _connectSelectedNodes() {
    //Get the node to be connected from the sl-select "nodeSelect"
    const nodeToBeConnectedId = this.nodeSelect.value;

    //add output to the selected node and get output id
    this._addOutputToSelectedNode();
    const outputs = this.nodeEditor.editor.getNodeFromId(
      this.selectedNode.id
    ).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    //Use the main input to connect the selected Nodes
    this.nodeEditor.editor.addConnection(
      this.selectedNode.id,
      nodeToBeConnectedId,
      lastOutputKey,
      "input_1"
    );
  }

  /*

  */
  private _resetSelect() {
    if (this.nodeSelect) {
      this.nodeSelect.value = "";
      this.isNodeSelected = false;
    }
  }

  /*
    Prevent space key from closing the dropdown when typing in the input
  */
  private handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof SlInput) {
      event.stopPropagation(); // Prevent event propagation
    }
  }

  private handleSearch = (event) => {
    this.searchTerm = event.target.value;
  };
}

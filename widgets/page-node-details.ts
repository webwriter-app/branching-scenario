import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlTextarea,
  SlDivider,
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlIconButton,
  SlInput,
  SlIcon,
} from "@shoelace-style/shoelace";

import { LinkButton } from "./gamebook-components/link-button";

//Tabler Icon Import
import plus from "@tabler/icons/outline/plus.svg";
import file from "@tabler/icons/outline/file.svg";
import minus from "@tabler/icons/outline/minus.svg";
import route2 from "@tabler/icons/outline/route-2.svg";

//CSS
import styles from "../css/page-node-details-css";

@customElement("page-node-details")
export class PageNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-input": SlInput,
      "sl-icon": SlIcon,
      "link-button": LinkButton,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @query(".nodeSelect")
  nodeSelect;
  @query("#textAreaHTML")
  textAreaHTML;

  //internal reactive state, not part of the component's API
  @state()
  editor?: Drawflow;

  @property({ type: Boolean }) isNodeSelected = false;

  //public properties are part of the component's public API
  @property({ type: Object, attribute: false }) selectedNode?: DrawflowNode;
  @property({ type: Number }) selectedNodeId = null;

  @property({ type: Number }) createdNodeId = null;
  @property({ type: Object, attribute: false }) nodesInEditor = {};

  @property({ type: Function }) _hoverConnection = (string) => {};
  @property({ type: Function }) _unhoverConnection = (string) => {};

  protected firstUpdated(_changedProperties: any): void {
    this._resetSelect();
    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.createdNodeId = id;
    });
  }

  updated(changedProperties) {
    if (changedProperties.has("selectedNodeId")) {
      this._resetSelect();
    }
  }

  render() {
    return html` <div class="page-node-details">
      <div class="title-bar">
        <div class="div-icon">
          <sl-icon src=${file}></sl-icon>
        </div>
        <div class="div-title">
          <p class="title">${this.selectedNode.data.title}</p>
          <p class="subtitle">Gamebook Page</p>
        </div>

        <div class="last-item">
          <div class="control-node">
            <div class="horizontal">
              <p class="subtitle">
                Incoming
                (${this.selectedNode.inputs.input_1.connections.length.toString()})
              </p>
            </div>
            <div class="horizontalStack">
              ${this.selectedNode.inputs.input_1.connections.map(
                (connection, index) =>
                  html` <div class="horizontal">
                    <p style="color: gray">${index + 1}</p>
                    <sl-button
                      variant="text"
                      size="small"
                      @mouseenter=${() =>
                        this._hoverConnection(
                          `${connection.node}-${connection.input}-${this.selectedNode.id}-input_1`
                        )}
                      }
                      @mouseleave=${() =>
                        this._unhoverConnection(
                          `${connection.node}-${connection.input}-${this.selectedNode.id}-input_1`
                        )}
                      }
                    >
                      ${this.editor.getNodeFromId(connection.node).data.title}
                    </sl-button>
                    <sl-icon-button
                      src=${minus}
                      style="font-size: 0.8rem;"
                      @click=${() =>
                        this._deleteOutputFromNode(
                          parseInt(connection.node),
                          connection.input
                        )}
                    >
                    </sl-icon-button>
                  </div>`
              )}
            </div>
          </div>

          <sl-divider vertical style="height: 70px;"></sl-divider>

          <div class="control-node">
            <div class="horizontal">
              <p class="subtitle">
                Outgoing
                (${Object.keys(this.selectedNode.outputs).length.toString()})
              </p>
              <sl-icon-button
                class="last-item"
                src=${plus}
                style="font-size: 0.8rem;"
                @click=${this._addOutputToSelectedNode}
              ></sl-icon-button>
            </div>
            <div class="horizontalStack">
              ${Object.entries(this.selectedNode.outputs).map(
                ([output_class, drawflowConnection], index) => html` <div
                  class="horizontal"
                >
                  <p>${index + 1}</p>
                  ${drawflowConnection.connections.length > 0
                    ? html` <sl-button
                        variant="text"
                        size="small"
                        @mouseenter=${() =>
                          this._hoverConnection(
                            `${this.selectedNode.id}-${output_class}-${drawflowConnection.connections[0].node}-input_1`
                          )}
                        }
                        @mouseleave=${() =>
                          this._unhoverConnection(
                            `${this.selectedNode.id}-${output_class}-${drawflowConnection.connections[0].node}-input_1`
                          )}
                        }
                      >
                        ${this.editor.getNodeFromId(
                          drawflowConnection.connections[0].node
                        ).data.title}
                      </sl-button>`
                    : html`<p style="color: lightgray">No connection</p>`}

                  <sl-icon-button
                    src=${minus}
                    style="font-size: 0.8rem;"
                    @click=${() =>
                      this._deleteOutputFromNode(
                        this.selectedNode.id,
                        output_class
                      )}
                  >
                  </sl-icon-button>
                </div>`
              )}
            </div>
          </div>
        </div>
      </div>

      <div class="controls">
        <sl-select
          class="nodeSelect"
          placeholder="Page"
          @sl-change=${this._handleSelectChange}
        >
          ${Object.keys(this.nodesInEditor)
            .filter(
              (key) => this.nodesInEditor[key].id !== this.selectedNode.id
            )
            .map(
              (key) =>
                html`<sl-option value=${this.nodesInEditor[key].id}>
                  ${this.nodesInEditor[key].data.title}
                </sl-option>`
            )}
        </sl-select>
        <sl-button
          @click=${() => this._connectSelectedNodes()}
          ?disabled=${!this.isNodeSelected}
        >
          <sl-icon slot="prefix" src="${route2}"></sl-icon>
          Connect</sl-button
        >
      </div>
      <div class="pageDiv">
        <div class="page">
          <slot></slot>
        </div>
      </div>
    </div>`;
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
    this.editor.addNodeOutput(this.selectedNode.id);

    const event = new CustomEvent("outputCreated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  /*


  */
  private _deleteOutputFromNode(output_id: number, output_class: string) {
    this.editor.removeNodeOutput(output_id, output_class);

    const event = new CustomEvent("outputDeleted", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  /*


  */
  private _connectSelectedNodes() {
    //Get the node to be connected from the sl-select "nodeSelect"
    const nodeToBeConnectedId = this.nodeSelect.value;

    //add output to the selected node and get output id
    this._addOutputToSelectedNode();
    const outputs = this.editor.getNodeFromId(this.selectedNode.id).outputs;
    const outputKeys = Object.keys(outputs);
    const lastOutputKey = outputKeys[outputKeys.length - 1];

    //Use the main input to connect the selected Nodes
    this.editor.addConnection(
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
}

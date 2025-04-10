import { html, css } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { msg, str, localized } from "@lit/localize";
// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlButton,
  SlIcon,
  SlIconButton,
  SlDialog,
} from "@shoelace-style/shoelace";

import { NodeOutputSelect } from "../node-output-select/node-output-select";

import plus from "@tabler/icons/outline/plus.svg";
import minus from "@tabler/icons/outline/minus.svg";
import XCircleFill from "bootstrap-icons/icons/x-circle-fill.svg";

import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

@localized()
export class NodeConnectionList extends LitElementWw {
  @property({ type: Boolean, reflect: true }) accessor output = false;
  @property({ type: Boolean, reflect: true }) accessor input = false;
  @property({ type: Boolean, reflect: true }) accessor branch = false;

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  @state() accessor deleteOutputClass: string = "";

  /*


  */
  // Registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-icon-button": SlIconButton,
      "sl-icon": SlIcon,
      "node-output-select": NodeOutputSelect,
      "sl-dialog": SlDialog,
    };
  }

  /*


  */
  static get styles() {
    return css`
      .titlebar {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #d4d4d8;
        padding-bottom: 5px;
        width: 100%;
      }

      .titlebar p {
        font-size: 12px;
        color: #3f3f46;
        margin: 0px;
        padding: 0px;
        margin-right: auto;
        max-width: 150px;
        min-width: 80px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .verticalStack {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        overflow-y: scroll;
        padding-right: 5px;

        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
        position: relative;
      }

      .item {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        width: 100%;
        border-bottom: 1px solid #e4e4e7;
        padding-left: 5px;
        box-sizing: border-box;
      }

      .item p {
        padding: 0px;
        margin: 0px;
        font-size: 12px;
      }

      .itemButton {
        width: 100%;
      }

      sl-button::part(base) {
        justify-content: flex-start; /* Aligns the content to the left */
        text-align: left; /* Ensures text within the button is aligned left */
      }

      sl-button::part(label) {
        max-width: 130px; /* Ensures the label takes up the full width of the button */
        text-align: left; /* Aligns the text within the label to the left */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: auto;
      }

      sl-icon-button.minus::part(base) {
        padding: 0px;
      }

      sl-icon-button.add::part(base) {
        padding-left: 0px;
        padding-top: 0px;
        padding-bottom: 0px;
        padding-right: 4px;
        font-size: 16px;
      }

      .verticalStack::-webkit-scrollbar {
        width: 6px; /* Width of the scrollbar */
      }

      .verticalStack::-webkit-scrollbar-track {
        background: transparent; /* Hide the track */
      }

      .verticalStack::-webkit-scrollbar-thumb {
        background-color: #888; /* Color of the scrollbar handle */
        border-radius: 10px; /* Rounded corners */
      }

      .verticalStack::-webkit-scrollbar-thumb:hover {
        background-color: #555; /* Darker color on hover */
      }

      .no-node-message {
        font-size: 12px;
        color: red;
        margin: 0px;
        padding-top: 10px;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: start;
        width: 100%;
        height: 100%;
      }

      .branch-item {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
        width: 100%;
        box-sizing: border-box;
      }

      .branch-item-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        margin-top: 10px;
        gap: 5px;
        width: 100%;
        height: 100%;
        text-align: center;
      }

      sl-dialog::part(base) {
        position: absolute;
      }

      sl-dialog::part(overlay) {
        position: absolute;
      }
    `;
  }

  /*


  */
  renderOutputs() {
    return html`
      <div class="container">
        <div class="titlebar">
          <p>
            ${msg(
              str`Outputs (${
                Object.keys(this.editorStore.selectedNode.outputs).length
              })`
            )}
          </p>
          <sl-icon-button @click=${this._addOutput} src=${plus} class="add">
          </sl-icon-button>
        </div>
        <div class="verticalStack">
          ${repeat(
            Object.entries(this.editorStore.selectedNode.outputs),
            ([output_class]) =>
              `${this.editorStore.selectedNode.id}-${output_class}`,
            ([output_class, drawflowConnection], index) => html`
              <div
                class="item"
                @mouseenter=${() =>
                  this.dispatchEvent(
                    new CustomEvent("highlightOutput", {
                      detail: {
                        outputNodeId: this.editorStore.selectedNode.id,
                        outputClass: output_class,
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
                @mouseleave=${() =>
                  this.dispatchEvent(
                    new CustomEvent("unhighlightOutput", {
                      detail: {
                        outputNodeId: this.editorStore.selectedNode.id,
                        outputClass: output_class,
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
              >
                <p style="color: gray">${index + 1}</p>
                <node-output-select
                  .outputClass=${output_class}
                  in-output-list
                  .inOutputList=${true}
                ></node-output-select>
                <sl-icon-button
                  class="minus"
                  src=${minus}
                  style="font-size: 15px;"
                  @click=${() => this._preDeleteOutput(output_class)}
                ></sl-icon-button>
              </div>
            `
          )}
        </div>
      </div>

      <sl-dialog
        label=${msg("Delete Output")}
        class="dialog"
        id="delete_output_dialog"
      >
        ${msg(
          str`You are about to delete ${this.deleteOutputClass} which has an outgoing connection. Do you wish to proceed?`
        )}
        <sl-button
          slot="footer"
          variant="primary"
          outline
          @click=${() =>
            (
              this.shadowRoot.getElementById("delete_output_dialog") as SlDialog
            ).hide()}
          >Abort</sl-button
        >
        <sl-button
          slot="footer"
          variant="danger"
          outline
          @click=${() => {
            const dialog = this.shadowRoot?.getElementById(
              "delete_output_dialog"
            ) as SlDialog;
            this._deleteOutput(this.deleteOutputClass);
            dialog?.hide();
          }}
        >
          Delete
        </sl-button>
      </sl-dialog>
    `;
  }

  /*


  */
  renderInputs() {
    return html`
      <div class="container">
        <div class="titlebar">
          <p>
            ${msg(
              str`Incoming (${
                this.editorStore.selectedNode?.inputs["input_1"]?.connections
                  .length ?? 0
              })`
            )}
          </p>
        </div>
        <div class="verticalStack">
          ${this.editorStore.selectedNode?.inputs["input_1"]?.connections.map(
            (connection, index) => html` <div class="item">
              <p style="color: gray">${index + 1}</p>
              <sl-button
                class="itemButton"
                variant="text"
                size="small"
                @mouseenter=${() =>
                  this.dispatchEvent(
                    new CustomEvent("highlightConnection", {
                      detail: {
                        outputNodeId: connection?.node,
                        inputNodeId: this.editorStore.selectedNode.id,
                        outputClass: connection?.input,
                        inputClass: "input_1",
                        highlightButton: true,
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
                @mouseleave=${() =>
                  this.dispatchEvent(
                    new CustomEvent("unhighlightConnection", {
                      detail: {
                        outputNodeId: connection?.node,
                        inputNodeId: this.editorStore.selectedNode.id,
                        outputClass: connection?.input,
                        inputClass: "input_1",
                        highlightButton: true,
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
              >
                ${this.editorStore.editorContent.drawflow.Home.data[
                  connection.node
                ].data.title}
              </sl-button>
              <sl-icon-button
                src=${XCircleFill}
                style="font-size: 14px; color: #71717A;"
                @click=${() =>
                  this.dispatchEvent(
                    new CustomEvent("deleteConnection", {
                      detail: {
                        outputNodeId: connection?.node,
                        inputNodeId: this.editorStore.selectedNode.id,
                        outputClass: connection?.input,
                        inputClass: "input_1",
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
              ></sl-icon-button>
            </div>`
          )}
        </div>
      </div>
    `;
  }

  /*

 
  */
  renderInputsBranch() {
    const connections =
      this.editorStore.selectedNode.inputs.input_1?.connections;

    const length = connections ? Object.values(connections).length : 0;

    return html`
      <div class="container">
        <div class="titlebar">
          <p>${msg("Accessing")}</p>
        </div>
        <div class="verticalStack">
          ${length > 0
            ? html` ${connections.map(
                (connection, index) => html` 
                <div class="item">
              <p style="color: gray">${index + 1}</p>
              <sl-button
                class="itemButton"
                variant="text"
                size="small"
                 @mouseenter=${() =>
                   this.dispatchEvent(
                     new CustomEvent("highlightConnection", {
                       detail: {
                         outputNodeId: connection?.node,
                         inputNodeId: this.editorStore.selectedNode.id,
                         outputClass: connection?.input,
                         inputClass: "input_1",
                         highlightButton: true,
                       },
                       bubbles: true,
                       composed: true,
                     })
                   )}
                @mouseleave=${() =>
                  this.dispatchEvent(
                    new CustomEvent("unhighlightConnection", {
                      detail: {
                        outputNodeId: connection?.node,
                        inputNodeId: this.editorStore.selectedNode.id,
                        outputClass: connection?.input,
                        inputClass: "input_1",
                        highlightButton: true,
                      },
                      bubbles: true,
                      composed: true,
                    })
                  )}
              >
                  ${
                    this.editorStore.editorContent.drawflow.Home.data[
                      connection.node
                    ].data.title
                  }
              </sl-button>
                    <sl-icon-button
                      src=${XCircleFill}
                      style="font-size: 14px; color: #71717A;"
                      @click=${() =>
                        this.dispatchEvent(
                          new CustomEvent("deleteConnection", {
                            detail: {
                              outputNodeId: connection?.node,
                              inputNodeId: this.editorStore.selectedNode.id,
                              outputClass: connection?.input,
                              inputClass: "input_1",
                            },
                            bubbles: true,
                            composed: true,
                          })
                        )}
                    ></sl-icon-button>
                  </div>
                </div>`
              )}`
            : html` <div class="container">
                <p class="no-node-message">
                  ${msg(
                    " Connect a node to create rules based on its content!"
                  )}
                </p>
              </div>`}
        </div>
      </div>
    `;
  }

  /*


  */
  render() {
    if (this.output) {
      return this.renderOutputs();
    } else if (this.input) {
      return this.renderInputs();
    } else if (this.branch) {
      return this.renderInputsBranch();
    } else {
      return html`<p>Please specify either 'input' or 'output' attribute.</p>`;
    }
  }

  /*


  */
  private _preDeleteOutput(output_class: string) {
    if (
      this.editorStore.selectedNode.outputs[output_class].connections.length >=
      1
    ) {
      this.deleteOutputClass = output_class;
      (
        this.shadowRoot.getElementById("delete_output_dialog") as SlDialog
      ).show();
    } else {
      this._deleteOutput(output_class);
    }
  }

  /*


  */
  private _deleteOutput(output_class: string) {
    this.dispatchEvent(
      new CustomEvent("deleteOutput", {
        detail: {
          nodeId: this.editorStore.selectedNode.id,
          outputClass: output_class,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /*


  */
  private _addOutput() {
    this.dispatchEvent(
      new CustomEvent("addOutput", {
        detail: { nodeId: this.editorStore.selectedNode.id },
        bubbles: true,
        composed: true,
      })
    );
  }
}

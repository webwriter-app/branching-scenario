import {
  html,
  css,
  LitElement,
  unsafeCSS,
  PropertyValues,
  PropertyDeclaration,
} from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlButton, SlIconButton } from "@shoelace-style/shoelace";

// Drawflow Imports
import { DrawflowNode } from "drawflow";

import { OutputConnectionControl } from "./output-connection-control";

import plus from "@tabler/icons/outline/plus.svg";
import minus from "@tabler/icons/outline/minus.svg";
import XCircleFill from "bootstrap-icons/icons/x-circle-fill.svg";

@customElement("node-connection-list")
export class NodeConnectionList extends LitElementWw {
  @property({ type: Object }) nodeEditor;
  @property({ type: Object, attribute: true, reflect: true })
  selectedNode?: DrawflowNode;

  @property({ type: Boolean, reflect: true }) output = false;
  @property({ type: Boolean, reflect: true }) input = false;

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

  // Registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-icon-button": SlIconButton,
      "output-connection-control": OutputConnectionControl,
    };
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        box-sizing: border-box;
        height: 100%;
      }

      .titlebar {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid gray;
        padding-bottom: 5px;
        width: 100%;
      }

      .titlebar p {
        font-family: "Roboto", sans-serif;
        font-size: 12px;
        font-weight: bold;
        color: gray;
        margin: 0px;
        padding: 0px;
        margin-right: auto;
        color: #3f3f46;
        max-width: 100px;
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
        border-bottom: 1px solid #d4d4d8;
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

      sl-icon-button::part(base) {
        padding: 0px;
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
    `;
  }

  renderOutputs() {
    return html`
      <div class="container">
        <div class="titlebar">
          <p>
            Outputs
            (${Object.keys(this.selectedNode.outputs).length.toString()})
          </p>
          <sl-icon-button
            src=${plus}
            style="font-size: 0.8rem;"
            @click=${this._addOutputToSelectedNode}
          ></sl-icon-button>
        </div>
        <div class="verticalStack">
          ${repeat(
            Object.entries(this.selectedNode.outputs),
            ([output_class]) => `${this.selectedNode.id}-${output_class}`,
            ([output_class, drawflowConnection], index) => html`
              <div class="item">
                <p style="color: gray">${index + 1}</p>
                <output-connection-control
                  .selectedNode=${this.selectedNode}
                  .nodeEditor=${this.nodeEditor}
                  .outputClass=${output_class}
                  @mouseenter=${() => {
                    if (drawflowConnection.connections[0]) {
                      this.nodeEditor._highlightConnection(
                        this.selectedNode.id,
                        drawflowConnection.connections[0].node,
                        output_class,
                        "input_1"
                      );
                    }
                  }}
                  @mouseleave=${() => {
                    if (drawflowConnection.connections[0]) {
                      this.nodeEditor._unhighlightConnection(
                        `${this.selectedNode.id}-${drawflowConnection.connections[0].node}-${output_class}-input_1`
                      );
                    }
                  }}
                ></output-connection-control>
                <sl-icon-button
                  src=${minus}
                  style="font-size: 0.8rem;"
                  @click=${() =>
                    this._deleteOutputFromNode(
                      this.selectedNode.id,
                      output_class
                    )}
                ></sl-icon-button>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  renderInputs() {
    return html`
      <div class="container">
        <div class="titlebar">
          <p>
            Incoming
            (${this.selectedNode.inputs.input_1.connections.length.toString()})
          </p>
        </div>
        <div class="verticalStack">
          ${this.selectedNode.inputs.input_1.connections.map(
            (connection, index) => html` <div class="item">
              <p style="color: gray">${index + 1}</p>
              <sl-button
                class="itemButton"
                variant="text"
                size="small"
                @mouseenter=${() =>
                  this.nodeEditor._highlightConnection(
                    connection.node,
                    this.selectedNode.id,
                    connection.input,
                    "input_1"
                  )}
                @mouseleave=${() =>
                  this.nodeEditor._unhighlightConnection(
                    `${connection.node}-${this.selectedNode.id}-${connection.input}-input_1`
                  )}
              >
                ${this.nodeEditor.editor.getNodeFromId(connection.node).data
                  .title}
              </sl-button>
              <sl-icon-button
                src=${XCircleFill}
                style="font-size: 14px; color: #71717A;"
                @click=${() =>
                  this._deleteOutputFromNode(
                    parseInt(connection.node),
                    connection.input
                  )}
              ></sl-icon-button>
            </div>`
          )}
        </div>
      </div>
    `;
  }

  render() {
    if (this.output) {
      return this.renderOutputs();
    } else if (this.input) {
      return this.renderInputs();
    } else {
      return html`<p>Please specify either 'input' or 'output' attribute.</p>`;
    }
  }

  private _deleteOutputFromNode(output_id: number, output_class: string) {
    let outputHadConnections =
      (this.nodeEditor.editor.getNodeFromId(output_id) as DrawflowNode).outputs[
        output_class
      ].connections.length != 0;

    this.nodeEditor.editor.removeNodeOutput(output_id, output_class);

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputDeleted",
      null,
      null,
      null,
      null,
      null,
      output_class,
      outputHadConnections
    );
  }

  private _addOutputToSelectedNode() {
    this.nodeEditor.editor.addNodeOutput(this.selectedNode.id);
    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "outputCreated"
    );
  }
}

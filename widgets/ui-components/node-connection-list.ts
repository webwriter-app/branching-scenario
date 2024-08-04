import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";

// Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlButton, SlIconButton } from "@shoelace-style/shoelace";

// Drawflow Imports
import { DrawflowNode } from "drawflow";

// Tabler Icon Import
import plus from "@tabler/icons/outline/plus.svg";
import minus from "@tabler/icons/outline/minus.svg";

@customElement("node-connection-list")
export class NodeConnectionList extends LitElementWw {
  @property({ type: Object }) nodeEditor;
  @property({ type: Object, attribute: false }) selectedNode?: DrawflowNode;

  @property({ attribute: false }) _addOutputToSelectedNode = () => {};
  @property({ attribute: false }) _deleteOutputFromNode = (
    nodeId,
    outputClass
  ) => {};

  @property({ type: Boolean, reflect: true }) output = false;
  @property({ type: Boolean, reflect: true }) input = false;

  // Registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-icon-button": SlIconButton,
    };
  }

  static get styles() {
    return css`
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 175px;
        justify-content: left;
        align-items: left;
      }

      .titlebar {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        border-bottom: 1px solid gray;
        height: 20px;
        padding-bottom: 5px;
      }

      .titlebar p {
        font-family: "Roboto", sans-serif;
        font-size: 12px;
        color: gray;
        margin: 0px;
        padding: 0px;
        margin-right: auto;
        color: #3f3f46;
      }

      .verticalStack {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        height: 80px;
        width: 100%;
        overflow-y: auto;
        padding-right: 10px;
      }

      .item {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        height: 30px;
        width: 170px;

        border-bottom: 1px solid #d4d4d8;
      }

      .item p {
        padding: 0px;
        margin: 0px;
        font-size: 12px;
      }

      .itemButton::part(label) {
        width: 110px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }

      .itemButton {
        margin-right: auto;
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
          ${Object.entries(this.selectedNode.outputs).map(
            ([output_class, drawflowConnection], index) => html` <div
              class="item"
            >
              <p style="color: gray">${index + 1}</p>
              ${drawflowConnection.connections.length > 0
                ? html` <sl-button
                    class="itemButton"
                    variant="text"
                    size="small"
                    @mouseenter=${() =>
                      this.nodeEditor._highlightConnection(
                        this.selectedNode.id,
                        drawflowConnection.connections[0].node,
                        output_class,
                        "input_1"
                      )}
                    @mouseleave=${() =>
                      this.nodeEditor._unhighlightConnection(
                        `${this.selectedNode.id}-${drawflowConnection.connections[0].node}-${output_class}-input_1`
                      )}
                  >
                    ${this.nodeEditor.editor.getNodeFromId(
                      drawflowConnection.connections[0].node
                    ).data.title}
                  </sl-button>`
                : html`<sl-button
                    class="itemButton"
                    variant="text"
                    size="small"
                    disabled
                    >Not connected</sl-button
                  > `}
              <sl-icon-button
                src=${minus}
                style="font-size: 0.8rem;"
                @click=${() =>
                  this._deleteOutputFromNode(
                    this.selectedNode.id,
                    output_class
                  )}
              ></sl-icon-button>
            </div>`
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
                src=${minus}
                style="font-size: 0.8rem;"
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
}

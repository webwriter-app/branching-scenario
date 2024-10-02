import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { PageNodeDetails } from "./page-node-details";
import { provide, consume, createContext } from "@lit/context";
import { gamebookStore, GamebookStore } from "../context-test";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider } from "@shoelace-style/shoelace";

//Import Styles
import styles from "../../css/selected-node-details-css";
import { PopupNodeDetails } from "./popup-node-details";
import { ToggleableInput } from "../ui-components/toggleable-input";
import { NodeConnectionList } from "../ui-components/node-connection-list";

//Tabler Icon Import
import { BranchNodeDetails } from "./branch-node-details";

@customElement("node-details-selector")
export class SelectedNodeViewRenderer extends LitElementWw {
  @property({ attribute: false }) accessor changeInEditorCallback = (
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
  @property({ attribute: false }) accessor markUsedOutputs = () => {};

  static get scopedElements() {
    return {
      "page-node-details": PageNodeDetails,
      "popup-node-details": PopupNodeDetails,
      "branch-node-details": BranchNodeDetails,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
      "sl-icon": SlIcon,
      "sl-divider": SlDivider,
    };
  }

  @consume({ context: gamebookStore, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor providedStore = new GamebookStore("Default");

  //import CSS
  static styles = [styles];

  render() {
    return html`
      ${this.providedStore.selectedNode.id !== -1
        ? html` <div class="selected-node">
            ${this.providedStore.selectedNode.class == "page" ||
            this.providedStore.selectedNode.class == "origin"
              ? html`
                  <page-node-details
                    .changeInEditorCallback=${(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    ) => {
                      this.changeInEditorCallback(
                        drawflow,
                        updateType,
                        node,
                        removedNodeId,
                        inputNode,
                        outputNode,
                        inputClass,
                        outputClass,
                        outputHadConnections
                      );
                    }}
                  >
                    <slot></slot>
                  </page-node-details>
                `
              : this.providedStore.selectedNode.class == "branch"
              ? html` <branch-node-details
                  .markUsedOutputs=${() => this.markUsedOutputs()}
                  .changeInEditorCallback=${(
                    drawflow,
                    updateType,
                    node,
                    removedNodeId,
                    inputNode,
                    outputNode,
                    inputClass,
                    outputClass,
                    outputHadConnections
                  ) => {
                    this.changeInEditorCallback(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    );
                  }}
                >
                  <slot></slot>
                </branch-node-details>`
              : this.providedStore.selectedNode.class == "popup"
              ? html`
                  <popup-node-details
                    .changeInEditorCallback=${(
                      drawflow,
                      updateType,
                      node,
                      removedNodeId,
                      inputNode,
                      outputNode,
                      inputClass,
                      outputClass,
                      outputHadConnections
                    ) => {
                      this.changeInEditorCallback(
                        drawflow,
                        updateType,
                        node,
                        removedNodeId,
                        inputNode,
                        outputNode,
                        inputClass,
                        outputClass,
                        outputHadConnections
                      );
                    }}
                  >
                    <slot></slot>
                  </popup-node-details>
                `
              : null}
          </div>`
        : html`
            <div class="no-node-selected">
              <p>Click on a node to view its content</p>
              <slot></slot>
            </div>
          `}
    `;
  }

  /*


  */
  private renameNode(text: String) {
    // this.nodeEditor.editor.updateNodeDataFromId(
    //   this.providedStore.selectedNode.id,
    //   {
    //     ...this.providedStore.selectedNode.data,
    //     title: text,
    //   }
    // );
    // this.changeInEditorCallback(
    //   { ...this.nodeEditor.editor.drawflow },
    //   "nodeRenamed",
    //   this.providedStore.selectedNode
    // );
  }
}

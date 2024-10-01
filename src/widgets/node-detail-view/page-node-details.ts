import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

import { QuickConnectNode } from "../ui-components/quick-connect-node";

//CSS
import styles from "../../css/page-node-details-css";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider } from "@shoelace-style/shoelace";

//Tabler Icon Import
import squares from "@tabler/icons/filled/squares.svg";
import file from "@tabler/icons/filled/file.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import { BranchNodeDetails } from "./branch-node-details";
import { ToggleableInput } from "../ui-components/toggleable-input";
import { NodeConnectionList } from "../ui-components/node-connection-list";

import { provide, consume, createContext } from "@lit/context";
import { gamebookStore, GamebookStore } from "../context-test";

@customElement("page-node-details")
export class PageNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "quick-connect-node": QuickConnectNode,
      "toggleable-input": ToggleableInput,
      "node-connection-list": NodeConnectionList,
      "sl-divider": SlDivider,
      "sl-icon": SlIcon,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @property({ type: Object }) accessor nodeEditor;

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

  @consume({ context: gamebookStore, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor providedStore = new GamebookStore("Default");

  render() {
    return html` <div class="title-bar">
        <div class="div-icon-page">
          <sl-icon src=${file}></sl-icon>
        </div>
        <div class="div-title">
          <toggleable-input
            .text=${this.providedStore.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Page</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list
            input
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.providedStore.selectedNode}
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
          ></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list
            output
            .nodeEditor=${this.nodeEditor}
            .selectedNode=${this.providedStore.selectedNode}
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
          ></node-connection-list>
        </div>
      </div>

      <div class="page-node-details">
        <div class="preview">
          <div class="page">
            <slot></slot>
          </div>
        </div>
      </div>`;
  }

  /*


  */
  private renameNode(text: String) {
    this.nodeEditor.editor.updateNodeDataFromId(
      this.providedStore.selectedNode.id,
      {
        ...this.providedStore.selectedNode.data,
        title: text,
      }
    );

    this.changeInEditorCallback(
      { ...this.nodeEditor.editor.drawflow },
      "nodeRenamed",
      this.providedStore.selectedNode
    );
  }
}

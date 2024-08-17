import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

import { QuickConnectNode } from "../ui-components/quick-connect-node";

//CSS
import styles from "../../css/page-node-details-css";

@customElement("page-node-details")
export class PageNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "quick-connect-node": QuickConnectNode,
    };
  }

  //import CSS
  static styles = [styles];

  //access nodes in the internal component DOM.
  @property({ type: Object }) nodeEditor;
  @property({ type: Boolean }) isNodeSelected = false;

  //public properties are part of the component's public API
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

  render() {
    return html` <div class="page-node-details">
      <div class="preview">
        <div class="page">
          <slot></slot>
        </div>
      </div>
    </div>`;
  }
}

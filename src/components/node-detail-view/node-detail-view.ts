import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { PageNodeDetailView } from "./page-node-detail-view/page-node-detail-view";
import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider } from "@shoelace-style/shoelace";

//Import Styles
import styles from "./node-detail-view.styles";
import { PopupNodeDetailView } from "./popup-node-detail-view/popup-node-detail-view";
import { ToggleTextInput } from "../toggle-text-input/toggle-text-input";
import { NodeConnectionList } from "../node-connection-list/node-connection-list";

//Tabler Icon Import
import { BranchNodeDetailView } from "./branch-node-detail-view/branch-node-detail-view";

@customElement("node-detail-view")
export class NodeDetailsView extends LitElementWw {
  static get scopedElements() {
    return {
      "page-node-detail-view": PageNodeDetailView,
      "popup-node-detail-view": PopupNodeDetailView,
      "branch-node-detail-view": BranchNodeDetailView,
      "toggle-text-input": ToggleTextInput,
      "node-connection-list": NodeConnectionList,
      "sl-icon": SlIcon,
      "sl-divider": SlDivider,
    };
  }

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  //import CSS
  static styles = [styles];

  render() {
    return html`
      ${this.editorStore.selectedNode.id !== -1
        ? html` <div class="selected-node">
            ${this.editorStore.selectedNode.class == "page" ||
            this.editorStore.selectedNode.class == "origin"
              ? html`
                  <page-node-detail-view>
                    <slot></slot>
                  </page-node-detail-view>
                `
              : this.editorStore.selectedNode.class == "branch"
              ? html` <branch-node-detail-view>
                  <slot></slot>
                </branch-node-detail-view>`
              : this.editorStore.selectedNode.class == "popup"
              ? html`
                  <popup-node-detail-view>
                    <slot></slot>
                  </popup-node-detail-view>
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
    //   this.editorStore.selectedNode.id,
    //   {
    //     ...this.editorStore.selectedNode.data,
    //     title: text,
    //   }
    // );
    // this.changeInEditorCallback(
    //   { ...this.nodeEditor.editor.drawflow },
    //   "nodeRenamed",
    //   this.editorStore.selectedNode
    // );
  }
}

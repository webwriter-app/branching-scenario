import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
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

import file from "@tabler/icons/filled/file.svg";

import { ToggleableInput } from "../ui-components/toggleable-input";
import { NodeConnectionList } from "../ui-components/node-connection-list";

import { provide, consume, createContext } from "@lit/context";
import { editorState, GamebookEditorState } from "../editor-state-context";

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

  @consume({ context: editorState, subscribe: true })
  @property({ type: Object, attribute: true, reflect: false })
  public accessor editorStore = new GamebookEditorState("Default");

  render() {
    return html` <div class="title-bar">
        <div class="div-icon-page">
          <sl-icon src=${file}></sl-icon>
        </div>
        <div class="div-title">
          <toggleable-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggleable-input>
          <p class="subtitle">Page</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list input></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list output></node-connection-list>
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
    const event = new CustomEvent("renameSelectedNode", {
      detail: { newTitle: text },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}

import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property } from "lit/decorators.js";
import { msg, localized } from "@lit/localize";

//Drawflow Imports
import { DrawflowNode } from "drawflow";

//CSS
import styles from "./page-node-detail-view.styles";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlIcon, SlDivider } from "@shoelace-style/shoelace";

//Tabler Icon Import

import file from "@tabler/icons/filled/file.svg";

import { ToggleTextInput } from "../toggle-text-input/toggle-text-input";
import { NodeConnectionList } from "../node-connection-list/node-connection-list";

import { provide, consume, createContext } from "@lit/context";
import {
  editorState,
  GamebookEditorState,
} from "../../utils/gamebook-editor-state-context";

@localized()
export class PageNodeDetailView extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "toggle-text-input": ToggleTextInput,
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
          <toggle-text-input
            .text=${this.editorStore.selectedNode.data.title}
            .saveChanges=${(string) => this.renameNode(string)}
          ></toggle-text-input>
          <p class="subtitle">${msg("Page")}</p>
        </div>
        <div class="inputOutputControls">
          <node-connection-list input></node-connection-list>
          <sl-divider vertical style="height: 100%;"></sl-divider>
          <node-connection-list output></node-connection-list>
        </div>
      </div>

      <div class="page-node-detail-view">
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

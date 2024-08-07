import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state } from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlSelect,
  SlOption,
  SlDivider,
  SlIcon,
} from "@shoelace-style/shoelace";

//Drawflow Imports
import Drawflow, { DrawflowNode } from "drawflow";

import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

const NO_NODE_SELECTED: DrawflowNode = {
  id: -1,
  name: "unselect",
  inputs: {},
  outputs: {},
  pos_x: 0,
  pos_y: 0,
  class: "unselect",
  data: {},
  html: "",
  typenode: false,
};

//TODO: Finish this component,
//TODO: Add Decision Popup Template
//TODO: Finish Analysis
@customElement("output-connection-control")
export class OutputConnectionControl extends LitElementWw {
  @property({ type: Object, attribute: true, reflect: false }) nodeEditor;

  @property({ type: String, attribute: true, reflect: true })
  selectedNode?;
  @property({ type: String, attribute: true, reflect: true })
  outputClass?;

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-divider": SlDivider,
      "sl-icon": SlIcon,
    };
  }

  static get styles() {
    return css`
      .nodeSelect {
        width: 100%;
      }

      sl-select {
        --sl-input-border-width: 0px;
        --sl-input-border-color: transparent;
        --sl-focus-ring: none;
        --sl-input-padding: 0px; // Adjust the padding as needed
      }

      sl-select::part(listbox) {
        width: 250px;
      }

      sl-select::part(display-input) {
        font-weight: 500;
        color: #0084c7;
        font-size: 12px; // Adjust the font size as needed
        width: 70px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: left;
      }

      .icon-header {
        display: flex;
        align-items: center;
        gap: 7px;
      }
    `;
  }

  protected updated(_changedProperties: PropertyValues): void {
    if (_changedProperties.has("selectedNode")) {
      this.updateComplete.then(() => {
        const selectElement = this.shadowRoot.querySelector(
          ".nodeSelect"
        ) as SlSelect;
        if (selectElement) {
          selectElement.value =
            this.selectedNode?.outputs?.[this.outputClass.toString()]
              ?.connections?.[0]?.node ?? "-1";
          selectElement.requestUpdate();
        }
      });
    }
  }

  /*
  
  */
  render() {
    const data = this.nodeEditor.editor.drawflow.drawflow.Home.data;
    const nodeId = this.selectedNode.id;

    const filterAndMapOptions = (nodeClass) =>
      Object.keys(data)
        .filter(
          (key) => data[key].id !== nodeId && data[key].class === nodeClass
        )
        .map(
          (key) => html` <sl-option value="${data[key].id}">
            ${data[key].data.title}
          </sl-option>`
        );

    const hasNodesOfClass = (nodeClass) =>
      Object.keys(data).some(
        (key) => data[key].id !== nodeId && data[key].class === nodeClass
      );

    return html`
      <sl-select
        hoist
        class="nodeSelect"
        size="small"
        placeholder="Not connected"
        clearable
        @sl-input=${this._handleUserInputTargetPage}
        .value=${this.selectedNode?.outputs?.[this.outputClass.toString()]
          ?.connections?.[0]?.node ?? "-1"}
      >
        ${Object.keys(data).length <= 1
          ? html`<small>No nodes found</small>`
          : html`
              ${hasNodesOfClass("page") || hasNodesOfClass("origin")
                ? html`
                    <small class="icon-header"
                      ><sl-icon src="${file}"></sl-icon> Pages</small
                    >
                    ${filterAndMapOptions("page")}
                    ${filterAndMapOptions("origin")}
                    <sl-divider></sl-divider>
                  `
                : ""}
              ${hasNodesOfClass("popup")
                ? html`
                    <small class="icon-header"
                      ><sl-icon src="${squares}" /></sl-icon> Popups</small
                    >
                    ${filterAndMapOptions("popup")}
                    <sl-divider></sl-divider>
                  `
                : ""}
              ${hasNodesOfClass("branch")
                ? html`
                    <small class="icon-header"
                      ><sl-icon src="${arrowsSplit2}" /> </sl-icon>Smart Branch</small
                    >
                    ${filterAndMapOptions("branch")}
                  `
                : ""}
            `}
      </sl-select>
    `;
  }

  /*
  
  */
  private _handleUserInputTargetPage(event) {
    if (
      this.selectedNode?.outputs?.[this.outputClass.toString()] != undefined
    ) {
      //initial set
      if (
        this.selectedNode?.outputs?.[this.outputClass.toString()]
          ?.connections?.[0]?.node == undefined &&
        event.target.value != ""
      ) {
        console.log("new");
        this.nodeEditor.editor.addConnection(
          this.selectedNode.id,
          event.target.value,
          this.outputClass,
          "input_1"
        );
      }
      //change existing selection
      else if (
        this.selectedNode?.outputs?.[this.outputClass.toString()]
          ?.connections?.[0]?.node != undefined &&
        event.target.value != ""
      ) {
        //get the right output using the answers index which corresponds to the output index
        this.nodeEditor.editor.removeSingleConnection(
          this.selectedNode.id,
          this.selectedNode?.outputs?.[this.outputClass.toString()]
            ?.connections?.[0]?.node,
          this.outputClass,
          "input_1"
        );

        this.nodeEditor.editor.addConnection(
          this.selectedNode.id,
          event.target.value,
          this.outputClass,
          "input_1"
        );
      }
      //clear sl-select
      else if (event.target.value == "") {
        console.log("clear");
        this.nodeEditor.editor.removeSingleConnection(
          this.selectedNode.id,
          this.selectedNode?.outputs?.[this.outputClass.toString()]
            ?.connections?.[0]?.node,
          this.outputClass,
          "input_1"
        );
      }
    }
  }
}

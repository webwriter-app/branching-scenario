import { html, css, LitElement, unsafeCSS, PropertyValues } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, state, query } from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlSelect,
  SlOption,
  SlDivider,
  SlIcon,
  SlInput,
} from "@shoelace-style/shoelace";

//Drawflow Imports
import Drawflow, { DrawflowNode } from "drawflow";

import file from "@tabler/icons/outline/file.svg";
import squares from "@tabler/icons/outline/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";
import search from "@tabler/icons/outline/search.svg";

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

@customElement("output-connection-control")
export class OutputConnectionControl extends LitElementWw {
  @property({ type: Object, attribute: true, reflect: false }) nodeEditor;
  @property({ type: Object, attribute: true, reflect: false })
  selectedNode;
  @property({ type: String, attribute: true, reflect: true })
  outputClass?;

  @state() searchTerm = "";

  @query("sl-input")
  searchElement!: SlInput;

  @query("sl-select")
  selectElement!: SlSelect;

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-divider": SlDivider,
      "sl-icon": SlIcon,
      "sl-input": SlInput,
    };
  }

  static get styles() {
    return css`
      .nodeSelect {
        width: 100%;
      }

      sl-select {
        --sl-input-border-width: 0px;
        --sl-input-padding: 0px; // Adjust the padding as needed
      }

      sl-select::part(listbox) {
        width: 250px;
        height: 250px;
      }

      sl-select::part(display-input) {
        border-width: 0px;
        border: none;
        border-color: transparent;
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

      .test {
        --sl-input-border-width: 1px;
      }
    `;
  }

  firstUpdated() {
    // Create a MutationObserver to listen for changes to the 'open' attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "open"
        ) {
          const isOpen = this.selectElement.hasAttribute("open");
          this.onOpenChange(isOpen);
        }
      });
    });

    // Start observing the select element for attribute changes
    observer.observe(this.selectElement, { attributes: true });
  }

  /*
  
  */
  render() {
    const data = this.nodeEditor.editor.drawflow.drawflow.Home.data;
    const nodeId = this.selectedNode.id;

    const filteredNodes = Object.keys(data).filter(
      (key) =>
        data[key].id !== nodeId &&
        data[key].data.title
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
    );

    const filterAndMapOptions = (nodeClass) =>
      filteredNodes
        .filter((key) => data[key].class === nodeClass)
        .map(
          (key) => html`<sl-option
            value="${data[key].id}"
            @mouseenter=${() => this.nodeEditor._highlightNode(data[key].id)}
            @mouseleave=${() => this.nodeEditor._unhighlightNode(data[key].id)}
          >
            ${data[key].data.title}
          </sl-option>`
        );

    const hasNodesOfClass = (nodeClass) =>
      filteredNodes.some((key) => data[key].class === nodeClass);

    return html` <sl-select
      placement="bottom"
      hoist
      class="nodeSelect"
      size="small"
      placeholder="Not connected"
      clearable
      @sl-input=${this._handleUserInputTargetPage}
      .value=${this.selectedNode?.outputs?.[
        this.outputClass.toString()
      ]?.connections?.[0]?.node.toString() ?? "-1"}
      @mouseenter=${() =>
        this.highlightConnectionAndNode(
          this.selectedNode.id,
          this.selectedNode?.outputs?.[
            this.outputClass.toString()
          ]?.connections?.[0]?.node.toString(),
          this.outputClass,
          "input_1",
          this.selectedNode?.outputs?.[
            this.outputClass.toString()
          ]?.connections?.[0]?.node.toString()
        )}
      @mouseleave=${() =>
        this.unhighlightConnectionAndNode(
          this.selectedNode.id,
          this.selectedNode?.outputs?.[
            this.outputClass.toString()
          ]?.connections?.[0]?.node.toString(),
          this.outputClass,
          "input_1",
          this.selectedNode?.outputs?.[
            this.outputClass.toString()
          ]?.connections?.[0]?.node.toString()
        )}
    >
      <div style="padding: 10px">
        <sl-input
          placeholder="Search..."
          @sl-input=${this.handleSearch}
          @click=${() => this.searchElement.focus()}
          @keydown=${this.handleKeydown}
          clearable
          class="test"
        >
          <sl-icon src=${search} slot="prefix"></sl-icon>
        </sl-input>
      </div>
      <sl-divider></sl-divider>
      ${filteredNodes.length === 0
        ? html`<small>No nodes found</small>`
        : html`
            ${hasNodesOfClass("page") || hasNodesOfClass("origin")
              ? html`
                  <small class="icon-header"
                    ><sl-icon src="${file}"></sl-icon> Pages</small
                  >
                  ${filterAndMapOptions("page")}
                  ${filterAndMapOptions("origin")}
                  ${hasNodesOfClass("popup") || hasNodesOfClass("branch")
                    ? html`<sl-divider></sl-divider>`
                    : ""}
                `
              : ""}
            ${hasNodesOfClass("popup")
              ? html`
                  <small class="icon-header"
                    ><sl-icon src="${squares}"></sl-icon> Popup</small
                  >
                  ${filterAndMapOptions("popup")}
                  ${hasNodesOfClass("branch")
                    ? html`<sl-divider></sl-divider>`
                    : ""}
                `
              : ""}
            ${hasNodesOfClass("branch")
              ? html`
                  <small class="icon-header"
                    ><sl-icon src="${arrowsSplit2}"></sl-icon> Smart
                    Branch</small
                  >
                  ${filterAndMapOptions("branch")}
                `
              : ""}
          `}
    </sl-select>`;
  }

  /*
    Prevent space key from closing the dropdown when typing in the input
  */
  private handleKeydown(event: KeyboardEvent) {
    if (event.target instanceof SlInput) {
      this.searchElement.focus();
      event.stopPropagation(); // Prevent event propagation
    }
  }

  /*
  
  */
  private handleSearch = (event) => {
    this.searchTerm = event.target.value;
  };

  /*
  
  */
  private _handleUserInputTargetPage(event) {
    if (event.target instanceof SlSelect) {
      if (
        this.selectedNode?.outputs?.[this.outputClass.toString()] != undefined
      ) {
        //initial set
        if (
          this.selectedNode?.outputs?.[this.outputClass.toString()]
            ?.connections?.[0]?.node == undefined &&
          event.target.value != ""
        ) {
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
          console.log("on clear");
          this.unhighlightConnectionAndNode(
            this.selectedNode.id,
            this.selectedNode?.outputs?.[
              this.outputClass.toString()
            ]?.connections?.[0]?.node.toString(),
            this.outputClass,
            "input_1",
            this.selectedNode?.outputs?.[
              this.outputClass.toString()
            ]?.connections?.[0]?.node.toString()
          );
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

  private highlightConnectionAndNode(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass,
    highlightNodeId
  ) {
    if (!this.selectElement.open) {
      if (inputNodeId) {
        this.nodeEditor.highlightConnectionAndNode(
          outputNodeId,
          inputNodeId,
          outputClass,
          inputClass,
          highlightNodeId
        );
      }
    }
  }

  private unhighlightConnectionAndNode(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass,
    highlightNodeId
  ) {
    if (inputNodeId) {
      this.nodeEditor.unhighlightConnectionAndNode(
        outputNodeId,
        inputNodeId,
        outputClass,
        "input_1",
        highlightNodeId
      );
    }
  }

  private onOpenChange(isOpen: boolean) {
    if (isOpen) {
      this.unhighlightConnectionAndNode(
        this.selectedNode.id,
        this.selectedNode?.outputs?.[
          this.outputClass.toString()
        ]?.connections?.[0]?.node.toString(),
        this.outputClass,
        "input_1",
        this.selectedNode?.outputs?.[
          this.outputClass.toString()
        ]?.connections?.[0]?.node.toString()
      );
      this.nodeEditor._highlightOutput(this.selectedNode.id, this.outputClass);
    } else {
      this.nodeEditor._unhighlightOutput(
        this.selectedNode.id,
        this.outputClass
      );
    }
  }
}

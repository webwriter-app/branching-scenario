import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlDialog from "@shoelace-style/shoelace/dist/components/dialog/dialog.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";

//Bootstrap Icon Import
import FileEarmarkPlus from "bootstrap-icons/icons/file-earmark-plus.svg";
import FileEarmark from "bootstrap-icons/icons/file-earmark.svg";
import ZoomIn from "bootstrap-icons/icons/zoom-in.svg";
import ZoomOut from "bootstrap-icons/icons/zoom-out.svg";
import ArrowRightCircleFill from "bootstrap-icons/icons/arrow-right-circle-fill.svg";
import StopFill from "bootstrap-icons/icons/stop-fill.svg";
import PlayFill from "bootstrap-icons/icons/play-fill.svg";

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

//Import Styles
import styles from "../css/webwriter-branching-scenario-css";
import customDrawflowStyles from "../css/custom-drawflow-css";

//Import Sub Components
import { PageNodeDetails } from "./page-node-details";
import { QuizBranchNodeDetails } from "./quiz-branch-node-details";
import { GamebookPreview } from "./gamebook-preview";

// Declare global variable of type DrawflowNode
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

//TODO: Main Order (Does a gamebook have an always continue button? Does one define a Flow?) and Links as additional component?
//TODO: does it have a cover screen? an end screen?
//TODO: how to let the area be webwriter editable?
//TODO: write this decision making down... work visually with node inputs? have a link component?
@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  //access nodes in the internal component DOM.
  @query("#drawflowEditorDiv")
  drawflowEditorDiv;

  //internal reactive state, not part of the component's API
  @state() editor?: Drawflow;
  @state() inPreviewMode = false;

  @property({ type: Object, attribute: false }) selectedNode: DrawflowNode =
    NO_NODE_SELECTED;

  @property({ type: Object, attribute: false }) nodesInEditor = {};

  @property({ type: Object, attribute: false }) cacheEditorData = null;

  @property({ type: Object, attribute: false })
  gamebook: Gamebook = new Gamebook();

  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon-button": SlIconButton,
      "page-node-details": PageNodeDetails,
      "quiz-branch-node-details": QuizBranchNodeDetails,
      "gamebook-preview": GamebookPreview,
    };
  }

  //import CSS
  static styles = [style, styles, customDrawflowStyles];

  //Called after the component's DOM has been updated the first time
  protected firstUpdated(_changedProperties: any): void {
    this.editor = new Drawflow(this.drawflowEditorDiv);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;
    this.editor.zoom = 0.75;
    this.editor.start();
    this.editor.zoom_refresh();
    this._registerEditorEventHandlers();
  }

  updated(changedProperties) {
    if (changedProperties.has("inPreviewMode")) {
      //is entered on init
      if (!this.inPreviewMode) {
        //On Component Init
        if (this.cacheEditorData == null) {
          this._addOriginToGraph();
        }
        //Entering Edit Mode from Preview Mode
        else {
          this.editor = new Drawflow(this.drawflowEditorDiv);
          this.editor.reroute = true;
          this.editor.reroute_fix_curvature = true;
          this.editor.zoom = 0.75;
          this.editor.start();
          this.editor.zoom_refresh();
          this.editor.import(this.cacheEditorData);
          this._registerEditorEventHandlers();
        }
      }
    }
  }

  render() {
    return html` <div id="widget">
      <div class="controls">
        ${this.inPreviewMode
          ? html`
              <div class="first-item">
                <sl-icon-button
                  src=${StopFill}
                  class="iconButton"
                  @click=${() => this._switchMode()}
                  >Cancel</sl-icon-button
                >
              </div>
            `
          : html` <div class="first-item">
                <sl-icon-button
                  src=${PlayFill}
                  class="iconButton"
                  @click=${this._switchMode}
                  >Preview</sl-icon-button
                >
                <sl-divider vertical style="height: 30px;"></sl-divider>
                <sl-textarea
                  id="gamebookTitle"
                  rows="1"
                  resize="none"
                  placeholder="Gamebook Name"
                  @input="${this._handleGamebookTitle}"
                  .value="${this.gamebook.title}"
                ></sl-textarea>
              </div>
              <sl-icon-button
                src=${FileEarmarkPlus}
                class="iconButton"
                @click=${() => this._addPageNode("Untitled Page")}
              ></sl-icon-button>
              <sl-divider vertical style="height: 30px;"></sl-divider>
              <sl-button
                @click=${() =>
                  (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
                >Clear</sl-button
              >`}
      </div>
      ${this.inPreviewMode
        ? html`<gamebook-preview
            .gamebook="${this.gamebook}"
            .currentPage="${this.gamebook.startGamebook()}"
          ></gamebook-preview>`
        : html`<div id="drawflowEditorDiv">
              <div class="bar-zoom">
                <sl-icon-button
                  id="zoomInBtn"
                  src=${ZoomIn}
                  style="font-size: auto;"
                  @click=${() => this.editor.zoom_in()}
                ></sl-icon-button>
                <sl-icon-button
                  id="zoomOutBtn"
                  src=${ZoomOut}
                  style="font-size: auto;"
                  @click=${() => this.editor.zoom_out()}
                ></sl-icon-button>
              </div>
            </div>

            <div id="selected-node-details">
              ${this.selectedNode.class == "page" ||
              this.selectedNode.class == "origin"
                ? html`
                    <page-node-details
                      .editor="${this.editor}"
                      .nodesInEditor="${this.nodesInEditor}"
                      .selectedNode="${this.selectedNode}"
                      .gamebook="${this.gamebook}"
                    ></page-node-details>
                  `
                : this.selectedNode.class == "quiz-branch"
                ? html`<quiz-branch-node-details
                    .editor="${this.editor}"
                    .nodesInEditor="${this.nodesInEditor}"
                    .selectedNode="${this.selectedNode}"
                    .gamebook="${this.gamebook}"
                  ></quiz-branch-node-details>`
                : html` <p>Select a node to edit its content</p> `}
            </div>

            <sl-dialog label="Clear graph" class="dialog" id="dialog">
              Do you want to clear the graph? All your progress will be lost.
              <sl-button
                slot="footer"
                variant="primary"
                outline
                @click=${() =>
                  (this.shadowRoot.getElementById("dialog") as SlDialog).hide()}
                >Cancel</sl-button
              >
              <sl-button
                slot="footer"
                variant="danger"
                outline
                @click=${() => this._clearEditor()}
                >Clear</sl-button
              >
            </sl-dialog>`}
    </div>`;
  }

  private _addOriginToGraph() {
    const pageContent = {
      title: "First Page",
      content: `<div><p>Testing HTML Editing</p></div>`,
    };

    this.editor.addNode(
      "First Worksheet",
      0,
      0,
      0,
      0,
      "origin",
      pageContent,
      `
      <div>
        <div class="title-box">
          <svg id="svg">${FileEarmark}</svg>
          <p class="title">Page</p>
          <div class="badge">
            <div class="div-svg">
               <svg>${ArrowRightCircleFill}</svg>
            </div>
            <p>Start Page</p>
          </div>
        </div>
        <div class="content">
          <p class="input-label">Name</p>
          <input
            type="text"
            id="test-textarea"
            placeholder="Enter name"
            df-title
          ></input>
        </div>
      </div>`,
      false
    );
  }

  private _addPageNode(title) {
    const pageContent = {
      title: title,
      content: `<div><p>Testing HTML Editing</p></div>`,
    };

    this.editor.addNode(
      title,
      0,
      0,
      0,
      0,
      "page",
      pageContent,
      `
      <div>
        <div class="title-box">
          <svg id="svg">${FileEarmark}</svg>
          <p class="title">Page</p>
        </div>
        <div class="content">
          <p class="input-label">Name</p>
          <input
            type="text"
            id="test-textarea"
            placeholder="Enter name"
            df-title
          ></input>
        </div>
      </div>`,
      false
    );
  }

  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.editor.clear();
    this.gamebook.clearPages();

    this.selectedNode = NO_NODE_SELECTED;

    this._addOriginToGraph();
  }

  private _switchMode() {
    if (!this.inPreviewMode) {
      this.cacheEditorData = this.editor.export();
      this.selectedNode = NO_NODE_SELECTED;
    }

    this.inPreviewMode = !this.inPreviewMode;
  }

  private _registerEditorEventHandlers() {
    this.editor.on("nodeDataChanged", (id) => {
      //Event only picks up data changes from marked df-* objects in the node
      //In this project, this only picks up name changes from on the node
      const updatedNode = this.editor.getNodeFromId(id);
      this.selectedNode = updatedNode;

      this.gamebook.saveChangesToPageTitle(id, updatedNode.data.title);
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      const node = this.editor.getNodeFromId(id);
      this.selectedNode = node;
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.selectedNode = NO_NODE_SELECTED;
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.nodesInEditor = this.editor.drawflow.drawflow.Home.data;
      let createdNode = this.editor.getNodeFromId(id);

      //Add the page to the gamebook
      const createdPage: Page = {
        id: id,
        title: createdNode.data.title,
        content: createdNode.data.content,
        links: [],
      };

      this.gamebook.addPage(createdPage);
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this.nodesInEditor = this.editor.drawflow.drawflow.Home.data;
      this.gamebook.removePage(id);
    });

    // this.editor.on(
    //   "connectionCreated",
    //   ({ output_id, input_id, output_class, input_class }) => {
    //     console.log("connection Created");
    //   }
    // );

    // // Event listener for connection click
    // this.editor.on(
    //   "connectionSelected",
    //   (output_id, input_id, output_class, input_class) => {
    //     console.log("connection selected");
    //   }
    // );
  }

  private _handleGamebookTitle(event) {
    this.gamebook.title = event.target.value;
  }
}

customElements.define(
  "webwriter-branching-scenario",
  WebWriterBranchingScenario
);

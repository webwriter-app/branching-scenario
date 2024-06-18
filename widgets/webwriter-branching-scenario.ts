import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAll,
  queryAssignedElements,
} from "lit/decorators.js";
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
import ThreeDotsVertical from "bootstrap-icons/icons/three-dots-vertical.svg";

//Drawflow Imports
import Drawflow, { DrawflowConnection } from "drawflow";
import { DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

//Import Styles
import styles from "../css/webwriter-branching-scenario-css";
import customDrawflowStyles from "../css/custom-drawflow-css";

//Import Sub Components
import { PageNodeDetails } from "./page-node-details";
import { QuizBranchNodeDetails } from "./quiz-branch-node-details";
import { GamebookPreview } from "./gamebook-preview";
import { PageContainer } from "./page-container";
import { LinkButton } from "./link-button";

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
  //

  //access nodes in the internal component DOM.
  @query("#drawflowEditorDiv")
  drawflowEditorDiv;

  //internal reactive state, not part of the component's API
  @property({ type: Object, attribute: true }) editor?: Drawflow;

  @property({ type: Object, attribute: true, reflect: true }) editorContent;

  //
  @property({ type: Number, attribute: true, reflect: true }) editorZoom = -1;
  @property({ type: String }) editorZoomString = "";

  @property({ type: Object, attribute: true }) selectedNode: DrawflowNode =
    NO_NODE_SELECTED;

  //
  @property({ type: Object, attribute: true })
  gamebook: Gamebook = new Gamebook();
  //
  @queryAssignedElements({ flatten: true, selector: "page-container" })
  pageContainers;

  //
  @state() inPreviewMode = false;
  //
  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

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
      "page-container": PageContainer,
      "link-button": LinkButton,
    };
  }

  //import CSS
  static styles = [style, styles, customDrawflowStyles];

  //Called after the component's DOM has been updated the first time
  protected firstUpdated(_changedProperties: any): void {
    this.pageContainers.forEach((pageContainer) => {
      (pageContainer as PageContainer).hide();
    });

    this.editor = new Drawflow(this.drawflowEditorDiv);
    this.editor.reroute = true;
    this.editor.reroute_fix_curvature = true;

    if (this.editorZoom == -1) {
      this.editor.zoom = 0.7;
    } else {
      this.editor.zoom = this.editorZoom;
    }

    this.editor.start();
    this.editor.zoom_refresh();
    this._registerEditorEventHandlers();

    if (this.editorContent == null) {
      this._addOriginToGraph();
    } else {
      this.editor.import(this.editorContent);
    }
  }

  updated(changedProperties) {
    // if (changedProperties.has("inPreviewMode")) {
    //   //is entered on init
    //   if (!this.inPreviewMode) {
    //     //On Component Init
    //     if (this.cacheEditorData == null) {
    //       //this._addOriginToGraph();
    //     }
    //     //Entering Edit Mode from Preview Mode
    //     else {
    //       this.editor = new Drawflow(this.drawflowEditorDiv);
    //       this.editor.reroute = true;
    //       this.editor.reroute_fix_curvature = true;
    //       this.editor.zoom = 0.75;
    //       this.editor.start();
    //       this.editor.zoom_refresh();
    //       this.editor.import(this.cacheEditorData);
    //       this._registerEditorEventHandlers();
    //       //todo: cache view settings such that it is exactly the same way when you come back
    //     }
    //   }
    // }
  }

  render() {
    return html`
      ${this.isContentEditable
        ? html` 
          <div id="widget">
            <div class="controls">
              ${
                this.inPreviewMode
                  ? html` <div class="first-item">
                      <sl-icon-button
                        src=${StopFill}
                        class="iconButton"
                        @click=${() => this._switchMode()}
                      >
                        Cancel
                      </sl-icon-button>
                    </div>`
                  : html` <div class="first-item">
                        <sl-icon-button
                          src=${PlayFill}
                          class="iconButton"
                          @click=${this._switchMode}
                        >
                          Preview
                        </sl-icon-button>
                        <sl-divider vertical style="height: 30px;"></sl-divider>
                        <sl-textarea
                          id="gamebookTitle"
                          rows="1"
                          resize="none"
                          placeholder="Gamebook Name"
                          @input="${this._handleGamebookTitle}"
                          .value="${this.gamebook.title}"
                        >
                        </sl-textarea>
                      </div>
                      <sl-icon-button
                        src=${FileEarmarkPlus}
                        class="iconButton"
                        @click=${() => this._addPageNode("Untitled Page")}
                      >
                      </sl-icon-button>
                      <sl-divider vertical style="height: 30px;"> </sl-divider>
                      <sl-button
                        @click=${() =>
                          (
                            this.shadowRoot.getElementById("dialog") as SlDialog
                          ).show()}
                      >
                        Clear
                      </sl-button>`
              }
              </div>
            ${
              this.inPreviewMode
                ? html` <gamebook-preview .gamebook="${this.gamebook}">
                    <slot></slot>
                  </gamebook-preview>`
                : html` <div id="drawflowEditorDiv">
                      <div class="zoomControls">
                        <sl-icon-button
                          id="zoomInBtn"
                          src=${ZoomIn}
                          style="font-size: auto;"
                          @click=${() => this.editor.zoom_in()}
                        >
                        </sl-icon-button>
                        <sl-icon-button
                          id="zoomOutBtn"
                          src=${ZoomOut}
                          style="font-size: auto;"
                          @click=${() => this.editor.zoom_out()}
                        >
                        </sl-icon-button>
                      </div>
                      <div class="zoomValue">
                        <p>${this.editorZoomString}</p>
                      </div>
                    </div>
                    ${this.selectedNode.class == "page" ||
                    this.selectedNode.class == "origin"
                      ? html` <div id="selected-node-details">
                          <page-node-details
                            .editor="${this.editor}"
                            .nodesInEditor="${this.editorContent.drawflow.Home
                              .data}"
                            .selectedNode="${this.selectedNode}"
                            .selectedNodeId="${this.selectedNode.id}"
                            .gamebook="${this.gamebook}"
                          >
                            <slot></slot>
                          </page-node-details>
                        </div>`
                      : this.selectedNode.class == "quiz-branch"
                      ? html` <div id="selected-node-details">
                          <quiz-branch-node-details
                            .editor="${this.editor}"
                            .nodesInEditor="${this.editorContent.drawflow.Home
                              .data}"
                            .selectedNode="${this.selectedNode}"
                            .gamebook="${this.gamebook}"
                          >
                            <slot></slot
                          ></quiz-branch-node-details>
                        </div>`
                      : html` <div id="no-node-selected">
                          <p>Select a node</p>
                          <slot></slot>
                        </div>`}

                    <sl-dialog label="Clear graph" class="dialog" id="dialog">
                      Do you want to clear the graph? All your progress will be
                      lost.
                      <sl-button
                        slot="footer"
                        variant="primary"
                        outline
                        @click=${() =>
                          (
                            this.shadowRoot.getElementById("dialog") as SlDialog
                          ).hide()}
                        >Cancel</sl-button
                      >
                      <sl-button
                        slot="footer"
                        variant="danger"
                        outline
                        @click=${() => this._clearEditor()}
                        >Clear</sl-button
                      >
                    </sl-dialog>`
            }
              </div>
              </div>`
        : html`<gamebook-preview .gamebook="${this.gamebook}"
            ><slot></slot
          ></gamebook-preview>`}
    `;
  }

  private _addOriginToGraph() {
    const pageContent = {
      title: "First Page",
      content: `<p>Testing HTML Editing</p>`,
    };

    // Create the container div
    const containerDiv = document.createElement("div");

    // Create the icon div
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("div-page-icon");
    iconDiv.innerHTML = FileEarmark;
    const svgElement = iconDiv.querySelector("svg");
    if (svgElement) {
      svgElement.classList.add("page-svg");
    }
    iconDiv.appendChild(svgElement);
    containerDiv.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const badge = document.createElement("div");
    badge.classList.add("badge");

    let svgContent = ArrowRightCircleFill.split(",")[1];
    badge.innerHTML = svgContent;
    const arrowSVG = badge.querySelector("svg");
    if (arrowSVG) {
      arrowSVG.classList.add("arrow-svg");
    }
    badge.appendChild(arrowSVG);

    const nameLabel = document.createElement("p");
    nameLabel.textContent = "Start Page";
    badge.appendChild(nameLabel);

    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.id = "test-textarea";
    inputElement.placeholder = "Enter name";
    inputElement.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(badge);
    contentDiv.appendChild(inputElement);

    containerDiv.appendChild(contentDiv);

    // Create the icon div
    const threeDotsDiv = document.createElement("div");
    threeDotsDiv.classList.add("div-threedots-icon");
    threeDotsDiv.innerHTML = ThreeDotsVertical;
    const threeDots = threeDotsDiv.querySelector("svg");
    if (threeDots) {
      threeDots.classList.add("threedots-svg");
    }
    threeDotsDiv.appendChild(threeDots);
    containerDiv.appendChild(threeDotsDiv);

    containerDiv.classList.add("container");

    const containerHtml = containerDiv.outerHTML;

    this.editor.addNode(
      "First Worksheet",
      0,
      0,
      0,
      0,
      "origin",
      pageContent,
      containerHtml,
      false
    );
  }

  private _addPageNode(title) {
    const pageContent = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    // Create the container div
    const containerDiv = document.createElement("div");

    // Create the icon div
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("div-page-icon");
    iconDiv.innerHTML = FileEarmark;
    const svgElement = iconDiv.querySelector("svg");
    if (svgElement) {
      svgElement.classList.add("page-svg");
    }
    iconDiv.appendChild(svgElement);
    containerDiv.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    const nameLabel = document.createElement("p");
    nameLabel.classList.add("input-label");
    nameLabel.textContent = "Page"; // Set the text content of the label
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.id = "test-textarea";
    inputElement.placeholder = "Enter name";
    inputElement.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(nameLabel);
    contentDiv.appendChild(inputElement);
    containerDiv.appendChild(contentDiv);

    // Create the icon div
    const threeDotsDiv = document.createElement("div");
    threeDotsDiv.classList.add("div-threedots-icon");
    threeDotsDiv.innerHTML = ThreeDotsVertical;
    const threeDots = threeDotsDiv.querySelector("svg");
    if (threeDots) {
      threeDots.classList.add("threedots-svg");
    }
    threeDotsDiv.appendChild(threeDots);
    containerDiv.appendChild(threeDotsDiv);

    containerDiv.classList.add("container");

    const containerHtml = containerDiv.outerHTML;

    this.editor.addNode(
      title,
      0,
      0,
      0,
      0,
      "page",
      pageContent,
      containerHtml,
      false
    );
  }

  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.selectedNode = NO_NODE_SELECTED;
    this.editor.clear();
    this.gamebook.clearPages();
    //clear all the slotted PageContainers
    this.pageContainers.forEach((pageContainer) => {
      pageContainer.remove();
    });

    this._addOriginToGraph();
  }

  private _switchMode() {
    if (!this.inPreviewMode) {
      this.selectedNode = NO_NODE_SELECTED;
    }

    this.inPreviewMode = !this.inPreviewMode;

    this.pageContainers.forEach((pageContainer) => {
      (pageContainer as PageContainer).show();
    });
  }

  private _registerEditorEventHandlers() {
    this.editor.on("nodeDataChanged", (id) => {
      //Event only picks up data changes from marked df-* objects in the node
      //In this project, this only picks up name changes from on the node
      //TODO: make this more secure!
      const updatedNode = this.editor.getNodeFromId(id);
      this.selectedNode = updatedNode;

      this.gamebook.saveChangesToPageTitle(id, updatedNode.data.title);
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      const node = this.editor.getNodeFromId(id);
      this.selectedNode = node;

      //TODO: is this the right approach to show and hide pageContainers?
      this.pageContainers.forEach((pageContainer) => {
        if (
          (pageContainer as PageContainer).drawflowNodeId ==
          this.selectedNode.id
        ) {
          (pageContainer as PageContainer).show();
        } else {
          (pageContainer as PageContainer).hide();
        }
      });
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      console.log("nodeUnselected");
      this.selectedNode = NO_NODE_SELECTED;

      this.pageContainers.forEach((pageContainer) => {
        (pageContainer as PageContainer).hide();
      });
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      let createdNode = this.editor.getNodeFromId(id);
      this.editorContent = { ...this.editor.drawflow };

      if (createdNode.class == "page" || createdNode.class == "origin") {
        // Create a new instance of PageContainer using the constructor, append to slot
        //use setAttribute to workaround reflective attributes
        const pageContainer = document.createElement(
          "page-container"
        ) as PageContainer;
        pageContainer.setAttribute("drawflowNodeId", id.toString());

        const parser = new DOMParser();
        const doc = parser.parseFromString(
          createdNode.data.content,
          "text/html"
        );
        // Loop through the child nodes of the body of the parsed document
        doc.body.childNodes.forEach((node) => {
          pageContainer.appendChild(node);
        });

        //TODO: either try callback method or global storage OR event propagation
        //to let it access editor
        pageContainer.hide();
        this.appendChild(pageContainer);

        //Add the page to the gamebook
        const createdPage: Page = {
          drawflowNodeId: id,
          title: createdNode.data.title,
          links: [],
        };
        this.gamebook.addPage(createdPage);
      }
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      for (let i = 0; i < this.pageContainers.length; i++) {
        const pageContainer = this.pageContainers[i] as PageContainer;
        if (pageContainer.drawflowNodeId == id) {
          pageContainer.remove();
          break;
        }
      }
      //since we only add pages to the gamebook this is secure for removing other nodes than pages
      //TODO: make secure
      this.gamebook.removePage(id);

      this.editorContent = { ...this.editor.drawflow };
    });

    this.editor.on("nodeMoved", (id) => {
      this.editorContent = { ...this.editor.drawflow };
    });

    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        this.selectedNode = this.editor.getNodeFromId(output_id);
        console.log(this.selectedNode);

        const node = this.shadowRoot?.getElementById(`node-${output_id}`);
        if (node) {
          node.classList.add("selected");
        }

        this.pageContainers.forEach((pageContainer) => {
          if (
            (pageContainer as PageContainer).drawflowNodeId ==
            this.selectedNode.id
          ) {
            (pageContainer as PageContainer).show();
          } else {
            (pageContainer as PageContainer).hide();
          }
        });
      }
    );

    this.editor.on("connectionUnselected", (boolean) => {
      const node = this.shadowRoot?.getElementById(
        `node-${this.selectedNode.id}`
      );
      if (node) {
        node.classList.remove("selected");
      }

      this.selectedNode = NO_NODE_SELECTED;

      this.pageContainers.forEach((pageContainer) => {
        (pageContainer as PageContainer).hide();
      });
    });

    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.editorContent = { ...this.editor.drawflow };
        this._addLinkButtonToPageContainer(
          output_id,
          output_class,
          input_id,
          input_class
        );
      }
    );

    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        const identifier = `${output_id}-${output_class}-${input_id}-${input_class}`;
        const linkButton =
          this.shadowRoot?.querySelector(
            `link-button[identifier="${identifier}"]`
          ) || this.querySelector(`link-button[identifier="${identifier}"]`);

        if (linkButton) {
          linkButton.remove();
        }
      }
    );

    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      this.selectedNode = this.editor.getNodeFromId(output_id);

      const node = this.shadowRoot?.getElementById(`node-${output_id}`);
      if (node) {
        node.classList.add("selected");
      }

      this.pageContainers.forEach((pageContainer) => {
        if (
          (pageContainer as PageContainer).drawflowNodeId ==
          this.selectedNode.id
        ) {
          (pageContainer as PageContainer).show();
        } else {
          (pageContainer as PageContainer).hide();
        }
      });
    });

    this.editor.on("zoom", (zoom_level) => {
      // Convert zoom level to percentage
      this.editorZoom = zoom_level;

      let normalizedZoom =
        (zoom_level - this.editor.zoom_min) /
        (this.editor.zoom_max - this.editor.zoom_min);
      let percentage = (normalizedZoom * 100).toFixed(0) + "%";
      this.editorZoomString = percentage;

      const zoomValue = this.shadowRoot.querySelector(
        ".zoomValue"
      ) as HTMLElement;
      if (zoomValue) {
        zoomValue.classList.remove("fade-in-out");
        // Trigger reflow to restart the animation
        void zoomValue.offsetWidth;
        zoomValue.classList.add("fade-in-out");
      }
    });
  }

  private _handleGamebookTitle(event) {
    this.gamebook.title = event.target.value;
  }

  private _addLinkButtonToPageContainer(
    originNodeId: string,
    output_class: string,
    sinkNodeId: string,
    input_class: string
  ) {
    const sinkNodeTitle = this.editor.getNodeFromId(sinkNodeId).data.title;

    const pageContainer = this.pageContainers.find(
      (pageContainer) =>
        pageContainer.getAttribute("drawflowNodeId") == originNodeId
    );

    const button = document.createElement("link-button") as LinkButton;
    button.setAttribute("name", sinkNodeTitle);
    button.setAttribute("dataTargetId", sinkNodeId.toString());
    // Ensure uniqueness by adding a unique identifier
    button.setAttribute(
      "identifier",
      `${originNodeId}-${output_class}-${sinkNodeId}-${input_class}`
    );
    pageContainer.appendChild(button);

    //TODO: Remove this once frederic fixed this
    const par = document.createElement("p");
    par.textContent = "";
    pageContainer.appendChild(par);

    // this.gamebook.addLinkToPage(
    //   parseInt(originNodeId, 10),
    //   parseInt(sinkNodeId, 10)
    // );
  }
}

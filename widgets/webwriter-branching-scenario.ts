import { html, css, LitElement } from "lit";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlButton,
  SlDialog,
  SlIconButton,
  SlDivider,
  SlTextarea,
  SlMenu,
  SlMenuItem,
  SlDropdown,
  SlIcon,
} from "@shoelace-style/shoelace";

//@tabler icons
import file from "@tabler/icons/outline/file.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/dots-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import helpSquareRounded from "@tabler/icons/outline/help-square-rounded.svg";

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

//Import Styles
import styles from "../css/webwriter-branching-scenario-css";
import customDrawflowStyles from "../css/custom-drawflow-css";

//Import Sub Components
import { SelectedNodeDetails } from "./selected-node-details";
import { GamebookViewer } from "./gamebook-components/gamebook-viewer";
import { PageContainer } from "./gamebook-components/page-container";
import { QuizContainer } from "./gamebook-components/quiz-container";
import { LinkButton } from "./gamebook-components/link-button";
import { BranchingControls } from "./branching-controls";

//import Examples
import { gamebookExamples } from "./gamebookExamples";
import { GamebookContainerManager } from "./gamebook-components/gamebook-container-manager";

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
//TODO: write this decision making down... work visually with node inputs? have a link component?
@customElement("webwriter-branching-scenario")
export class WebWriterBranchingScenario extends LitElementWw {
  //access nodes in the internal component DOM.
  @query("#drawflowEditorDiv")
  drawflowEditorDiv;

  //internal reactive state, not part of the component's API
  @property({ type: Object, attribute: true }) editor?: Drawflow;

  @property({ type: Object, attribute: true, reflect: true }) editorContent;

  @property({ type: Number, attribute: true, reflect: true }) editorZoom = -1;
  @property({ type: String }) editorZoomString = "";

  @property({ type: Object, attribute: true }) selectedNode: DrawflowNode =
    NO_NODE_SELECTED;

  @property({ type: String, attribute: true, reflect: true })
  gamebookTitle = "";

  @queryAssignedElements({
    flatten: true,
    selector: "page-container, quiz-container",
  })
  gamebookContainers;

  @query("gamebook-container-manager")
  gamebookContainerManager;

  @state() inPreviewMode = false;

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
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
      "selected-node-details": SelectedNodeDetails,
      "gamebook-viewer": GamebookViewer,
      "page-container": PageContainer,
      "link-button": LinkButton,
      "quiz-container": QuizContainer,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-dropdown": SlDropdown,
      "gamebook-container-manager": GamebookContainerManager,
      "branching-controls": BranchingControls,
    };
  }

  //import CSS
  static styles = [style, styles, customDrawflowStyles];

  /*
  
  */
  protected firstUpdated(_changedProperties: any): void {
    this.gamebookContainers.forEach((container) => {
      container.hide();
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
      this._addPageNode("First Page", true);
    } else {
      this.editor.import(this.editorContent);
    }
  }

  /*
  
  */
  render() {
    return html`
      <div id="widget">
        ${this.isContentEditable
          ? html` 
            <branching-controls 
            .inPreviewMode=${this.inPreviewMode}
            .gamebookTitle=${this.gamebookTitle} 
            ._togglePreviewMode=${() => this._togglePreviewMode()} 
            ._importExample=${(number) => this._importExample(number)} 
            ._addPageNode=${(string, boolean) =>
              this._addPageNode(string, boolean)} 
            ._addQuestionNode=${() => this._addQuestionNode()}
            ._handleGamebookTitle=${(event) => this._handleGamebookTitle(event)}
            ._showDialog=${() =>
              (this.shadowRoot.getElementById("dialog") as SlDialog).show()}>
          </branching-controls>
          <!-- TODO: Delete this once contentEditable works perfectly -->
              ${
                this.inPreviewMode
                  ? html` <gamebook-viewer
                      gamebookTitle=${this.gamebookTitle != ""
                        ? this.gamebookTitle
                        : "No Name"}
                    >
                      <slot></slot>
                    </gamebook-viewer>`
                  : null
              }
              <div id="test">
                <div id="background"></div>
                <div
                  id="drawflowEditorDiv"
                  style=${
                    this.inPreviewMode ? "display: none;" : "display: block;"
                  }
                >
                  <div class="zoomControls">
                    <sl-icon-button
                      id="zoomInBtn"
                      src=${zoomIn}
                      style="font-size: auto;"
                      @click=${() => this.editor.zoom_in()}
                    >
                    </sl-icon-button>
                    <sl-icon-button
                      id="zoomOutBtn"
                      src=${zoomOut}
                      style="font-size: auto;"
                      @click=${() => this.editor.zoom_out()}
                    >
                    </sl-icon-button>
                  </div>
                  <div class="zoomValue">
                    <p>${this.editorZoomString}</p>
                  </div>

                  <!-- <sl-button class="exportButton" @click=${() =>
                    this.testOutput()}>Export</sl-button> -->
                  </div>
              </div>
                ${
                  !this.inPreviewMode
                    ? html`<selected-node-details
                        .selectedNode=${this.selectedNode}
                        .editor=${this.editor}
                        .editorContent=${this.editorContent}
                      >
                        <gamebook-container-manager
                          .appendToShadowDom=${(container) =>
                            this._addContainerCallback(container)}
                        >
                          <slot></slot>
                        </gamebook-container-manager>
                      </selected-node-details>`
                    : null
                }

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
                </sl-dialog>
              </div>
            `
          : html`<gamebook-viewer
              gamebookTitle=${this.gamebookTitle != ""
                ? this.gamebookTitle
                : "No Name"}
              ><slot></slot
            ></gamebook-viewer>`}
      </div>
    `;
  }

  /*


  */
  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.selectedNode = NO_NODE_SELECTED;
    this.gamebookTitle = "";
    this.editor.clear();
    //clear all the slotted PageContainers
    this.gamebookContainers.forEach((container) => {
      container.remove();
    });

    this._addPageNode("First Page", true);
  }

  /*


  */
  private _togglePreviewMode() {
    if (this.inPreviewMode == true) {
      this.inPreviewMode = false;
      this.gamebookContainers.forEach((container) => {
        container.hide();
      });

      const node = this.shadowRoot?.getElementById(
        `node-${this.selectedNode.id}`
      );
      if (node) {
        node.classList.remove("selected");
      }

      this.selectedNode = NO_NODE_SELECTED;
    }
    //
    else if (this.inPreviewMode == false) {
      this.inPreviewMode = true;

      this.gamebookContainers.forEach((container) => {
        container.hide();
      });
    }
  }

  /*


  */
  private _registerEditorEventHandlers() {
    //This event only picks up data changes from elements marked with df-* in the node
    //Currently only "page" nodes have such elements
    this.editor.on("nodeDataChanged", (id) => {
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(id);

      this.gamebookContainerManager._renameContainer(
        id.toString(),
        this.selectedNode.data.title
      );
    });

    //custom event that indicates data is changed
    this.addEventListener("nodeDataUpdated", (event) => {
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(
        (event as CustomEvent).detail.nodeId
      );

      if (this.selectedNode.class == "question-branch") {
        const container =
          this.gamebookContainerManager._getContainerByDrawflowNodeId(
            this.selectedNode.id.toString()
          );
        container.updateFromQuestionNode(this.selectedNode);
      }
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      this.selectedNode = this.editor.getNodeFromId(id);

      if (
        this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin"
      ) {
        this.gamebookContainerManager._showGamebookContainerById(
          this.selectedNode.id
        );
      } else if (this.selectedNode.class == "question-branch") {
        this.gamebookContainerManager._hideAllGamebookContainers();
      }
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.selectedNode = NO_NODE_SELECTED;
      this.gamebookContainerManager._hideAllGamebookContainers();
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.editorContent = { ...this.editor.drawflow };

      let createdNode = this.editor.getNodeFromId(id);

      if (createdNode.class == "page" || createdNode.class == "origin") {
        this.gamebookContainerManager._createPageContainerFromPageNode(
          createdNode
        );
      } else if (createdNode.class == "question-branch") {
        this.gamebookContainerManager._createQuestionContainerFromQuestionNode(
          createdNode
        );
      }
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this.gamebookContainerManager._deleteGamebookContainersById(id);
      this.editorContent = { ...this.editor.drawflow };
    });

    //Event listener for when a node got moved
    this.editor.on("nodeMoved", (id) => {
      this.editorContent = { ...this.editor.drawflow };
    });

    //Event listener for when a connection is selected
    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        //
        this.selectedNode = this.editor.getNodeFromId(output_id);
        const selectedNodeInShadowRoot = this.shadowRoot?.getElementById(
          `node-${output_id}`
        );
        if (selectedNodeInShadowRoot) {
          selectedNodeInShadowRoot.classList.add("selected");
        }

        if (
          this.selectedNode.class == "page" ||
          this.selectedNode.class == "origin"
        ) {
          this.gamebookContainerManager._showGamebookContainerById(
            this.selectedNode.id
          );
        } else if (this.selectedNode.class == "question-branch") {
          this.gamebookContainerManager._hideAllGamebookContainers();
        }

        //
      }
    );

    //event listener for when a connection is unselected
    this.editor.on("connectionUnselected", (boolean) => {
      //
      const node = this.shadowRoot?.getElementById(
        `node-${this.selectedNode.id}`
      );
      if (node) {
        node.classList.remove("selected");
      }

      this.selectedNode = NO_NODE_SELECTED;

      this.gamebookContainerManager._hideAllGamebookContainers();
    });

    //Event for created connections done e.g. via drag and drop
    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.editorContent = { ...this.editor.drawflow };
        this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        if (outputNode.class == "page" || outputNode.class == "origin") {
          const pageContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              output_id
            );
          pageContainer.addLinkButtonToPageContainer(
            outputNode,
            inputNode,
            output_class,
            input_class
          );
        } else if (outputNode.class == "question-branch") {
          this._updateQuestionNodeAnswerTarget(
            outputNode,
            output_class,
            input_id
          );
        }
        //
      }
    );

    //Event listener for when a connection is removed, e.g. by click in editor
    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        this.editorContent = { ...this.editor.drawflow };
        this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
        const outputNode = this.editor.getNodeFromId(output_id);

        if (outputNode.class == "page" || outputNode.class == "origin") {
          const pageContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              output_id
            );
          const identifier = `${output_id}-${output_class}-${input_id}-${input_class}`;
          pageContainer.removeLinkButtonFromPageContainer(identifier);
        } else if (outputNode.class == "question-branch") {
          this._updateQuestionNodeAnswerTarget(
            outputNode,
            output_class,
            "undefined"
          );
        }
      }
    );

    //Event listener for when a connection creation started via drag and drop
    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      this.selectedNode = this.editor.getNodeFromId(output_id);

      const node = this.shadowRoot?.getElementById(`node-${output_id}`);
      if (node) {
        node.classList.add("selected");
      }

      if (
        this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin"
      ) {
        this.gamebookContainerManager._showGamebookContainerById(
          this.selectedNode.id
        );
      } else if (this.selectedNode.class == "question-branch") {
        this.gamebookContainerManager._hideAllGamebookContainers();
      }
    });

    //event listener for when the user zoomed into the editor
    this.editor.on("zoom", (zoom_level) => {
      // Convert zoom level to percentage
      this.editorZoom = zoom_level;

      let normalizedZoom =
        (zoom_level - this.editor.zoom_min) /
        (this.editor.zoom_max - this.editor.zoom_min);

      let percentage = (normalizedZoom * 100).toFixed(0);

      // // Step 2: Increase the width and height by 3px
      let newWidth = 139 * (parseFloat(percentage) / 100);
      let newHeight = 139 * (parseFloat(percentage) / 100);

      console.log(newWidth);
      (
        this.shadowRoot.querySelector("#background") as HTMLElement
      ).style.backgroundSize = `${newWidth}px ${newHeight}px`;

      this.editorZoomString = percentage + "%";

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

    //event for when an input on a node was created
    this.addEventListener("inputCreated", (event) => {
      const nodeId = (event as CustomEvent).detail.nodeId;
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(nodeId);
    });

    //event for when an input of a node was deleted
    this.addEventListener("inputDeleted", (event) => {
      const nodeId = (event as CustomEvent).detail.nodeId;
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(nodeId);
    });

    //event for when an output on a node was created
    this.addEventListener("outputCreated", (event) => {
      const nodeId = (event as CustomEvent).detail.nodeId;
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(nodeId);
    });

    //event for when an output of a node was deleted
    this.addEventListener("outputDeleted", (event) => {
      const nodeId = (event as CustomEvent).detail.nodeId;
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(nodeId);
    });

    this.addEventListener("linkButtonDeleted", (event) => {
      const identifier = (event as CustomEvent).detail.identifier as string;
      const parts = identifier.split("-");
      const parsed = {
        outputNodeId: parseInt(parts[0]),
        outputClass: parts[1],
        inputNodeId: parseInt(parts[2]),
        inputClass: parts[3],
      };

      this.editor.removeSingleConnection(
        parsed.outputNodeId,
        parsed.inputNodeId,
        parsed.outputClass,
        parsed.inputClass
      );
    });

    //event listener for when the user zoomed into the editor
    this.editor.on("translate", ({ x, y }) => {
      (
        this.shadowRoot.querySelector("#background") as HTMLElement
      ).style.backgroundPosition = `${x} ${y}`;
    });

    //TODO: event for programmatic node selection
  }

  /*


  */
  private _handleGamebookTitle(event) {
    this.gamebookTitle = event.target.value;
  }

  /*


  */
  private _addPageNode(title: string, isOrigin: boolean) {
    const pageContent = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create page sl-icon
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", file);
    icon.classList.add("pageIcon");
    containerDiv.appendChild(icon);

    //
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    if (isOrigin) {
      //Add Origin Page Marker
      const badge = document.createElement("div");
      badge.classList.add("badge");

      const arrowIcon = document.createElement("sl-icon") as SlIcon;
      arrowIcon.setAttribute("src", circleArrowRight);
      badge.appendChild(arrowIcon);

      const nameLabel = document.createElement("p");
      nameLabel.textContent = "Start Page";
      badge.appendChild(nameLabel);

      contentDiv.appendChild(badge);
    } else {
      //Add label to the input for the nodes name
      const nameLabel = document.createElement("p");
      nameLabel.classList.add("input-label");
      nameLabel.textContent = "Page"; // Set the text content of the label
      contentDiv.appendChild(nameLabel);
    }

    //Add input for node name
    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.id = "test-textarea";
    inputElement.placeholder = "Enter name";
    inputElement.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(inputElement);

    containerDiv.appendChild(contentDiv);

    // Add three dots iccon
    const threeDotsIcon = document.createElement("sl-icon") as SlIcon;
    threeDotsIcon.setAttribute("src", dotsVertical);
    threeDotsIcon.classList.add("threeDots");
    containerDiv.appendChild(threeDotsIcon);

    const containerHtml = containerDiv.outerHTML;

    //get current center of drawflow div
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;

    //center of canvas - translation of canvas / zoom - node dimension center
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom - 302 / 2;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom - 90 / 2;

    this.editor.addNode(
      title,
      0,
      0,
      centerX,
      centerY,
      isOrigin ? "origin" : "page",
      pageContent,
      containerHtml,
      false
    );
  }

  /*


  */
  private _addQuestionNode() {
    const data = {
      title: "Question Branch",
      question: "",
      answers: [],
    };

    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create the icon div
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", helpSquareRounded);
    icon.style.fontSize = "48px";
    containerDiv.appendChild(icon);

    //
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");
    const nameLabel = document.createElement("p");
    nameLabel.textContent = "Question";
    contentDiv.appendChild(nameLabel);

    // Create the icon div
    const dotsIcon = document.createElement("sl-icon") as SlIcon;
    dotsIcon.setAttribute("src", dotsVertical);
    dotsIcon.classList.add("dotsIcon");
    contentDiv.appendChild(dotsIcon);

    containerDiv.appendChild(contentDiv);

    const containerHtml = containerDiv.outerHTML;

    //get current center of drawflow div
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;

    //center of canvas - translation of canvas / zoom - node dimension center
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom - 110 / 2;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom - 110 / 2;

    this.editor.addNode(
      "Question Branch",
      0,
      0,
      centerX,
      centerY,
      "question-branch",
      data,
      containerHtml,
      false
    );
  }

  /*


  */
  private _updateQuestionNodeAnswerTarget(
    quizNode: DrawflowNode,
    answer_output_class: string,
    target_node_id: string
  ) {
    const index = Object.keys(quizNode.outputs).indexOf(answer_output_class);

    if (index != -1) {
      const answerArray = quizNode.data.answers;
      answerArray[index].targetPageId = target_node_id;

      this.editor.updateNodeDataFromId(quizNode.id, {
        title: quizNode.data.title,
        question: quizNode.data.question,
        answers: answerArray,
      });

      const dispatchEvent = new CustomEvent("nodeDataUpdated", {
        detail: { nodeId: quizNode.id },
        bubbles: true, // Allows the event to bubble up through the DOM
        composed: true, // Allows the event to pass through shadow DOM boundaries
      });
      this.dispatchEvent(dispatchEvent);
    }
  }

  /*


  */
  private testOutput() {
    //console.log(this.gamebookContainers);

    this.gamebookContainers.forEach((container) => {
      if (container instanceof PageContainer) {
        // Assuming PageContainer has a method or property to access its child elements
        const childElements = container.childNodes; // Adjust this to how you get child elements in your PageContainer

        childElements.forEach((child) => {
          if ((child as HTMLElement).tagName.toLowerCase() === "picture") {
            const dataUrl = (child as HTMLElement).getAttribute("dataURl"); // Assuming dataURl is an attribute
            //console.log(dataUrl);
          }
        });
      }
    });
  }

  /*


  */ //TODO: remove, just keep this for making a string for examples
  private domElementReplacer(key, value) {
    if (value instanceof HTMLElement) {
      return {
        tagName: value.tagName,
        attributes: [...value.attributes].map((attr) => ({
          name: attr.name,
          value: attr.value,
        })),
        innerHTML: value.innerHTML,
      };
    }
    return value;
  }

  private createElementFromInfo(info) {
    let element = document.createElement(info.tagName);
    info.attributes.forEach((attr) => {
      element.setAttribute(attr.name, attr.value);
    });
    element.innerHTML = info.innerHTML;
    return element;
  }

  /*

  */
  private _importExample(index: Number) {
    this.editor.clear();
    this.editor.import(gamebookExamples.gamebookExamples[0].drawflow);

    this.selectedNode = NO_NODE_SELECTED;
    this.gamebookTitle = "";

    //clear all the slotted PageContainers
    this.gamebookContainers.forEach((container) => {
      container.remove();
    });

    let containers = gamebookExamples.gamebookExamples[0].containers.map(
      (info) => this.createElementFromInfo(info)
    );

    containers.forEach((container) => {
      this.appendChild(container);
    });

    this.editorContent = { ...this.editor.drawflow };
  }

  private _addContainerCallback(container: Node) {
    //console.log(container);
    this.appendChild(container);
  }
}

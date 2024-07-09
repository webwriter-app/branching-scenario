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
import plus from "@tabler/icons/outline/plus.svg";
import playerStop from "@tabler/icons/filled/player-stop.svg";
import playerPlay from "@tabler/icons/filled/player-play.svg";
import file from "@tabler/icons/outline/file.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/dots-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import helpSquareRounded from "@tabler/icons/outline/help-square-rounded.svg";

//Drawflow Imports
import Drawflow, { DrawflowConnection } from "drawflow";
import { DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

//Import Styles
import styles from "../css/webwriter-branching-scenario-css";
import customDrawflowStyles from "../css/custom-drawflow-css";

//Import Sub Components
import { SelectedNodeDetails } from "./selected-node-details";
import { GamebookViewer } from "./gamebook-viewer";
import { PageContainer } from "./gamebook-components/page-container";
import { QuizContainer } from "./gamebook-components/quiz-container";
import { LinkButton } from "./gamebook-components/link-button";

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

  @state() inPreviewMode = false;

  // focus(options: FocusOptions) {
  //   console.log("test");
  //   //this.classList.add("ww-selected");
  // }

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

    // Adding the click event listener to set focus on the component
    // this.addEventListener("click", () => {
    //   console.log("test");
    //   this.focus();
    //   focus;
    // });
  }

  /*
  
  */
  render() {
    return html`
      <div>
        ${this.isContentEditable
          ? html` 
          <div id="widget">
            <div class="controls">
              <div class="first-item">
                <sl-icon-button
                  src=${this.inPreviewMode ? playerStop : playerPlay}
                  class="iconButton"
                  @click=${() => this._togglePreviewMode()}
                >
                  ${this.inPreviewMode ? "Cancel" : "Preview"}
                </sl-icon-button>
                  <sl-divider vertical style=${
                    this.inPreviewMode
                      ? "display: none;"
                      : "display: block; height: 30px;"
                  }></sl-divider>
                  <sl-textarea
                    id="gamebookTitle"
                    rows="1"
                    resize="none"
                    placeholder="Gamebook Name"
                    @input="${this._handleGamebookTitle}"
                    .value="${this.gamebookTitle}"
                    style=${
                      this.inPreviewMode ? "display: none;" : "display: block;"
                    }
                    >
                  </sl-textarea>
              </div>
            
        <sl-dropdown style=${
          this.inPreviewMode ? "display: none;" : "display: block;"
        }>
          <sl-button slot="trigger">
            Add Node
            <sl-icon src=${plus} slot="prefix" ></sl-icon>
          </sl-button>
          <sl-menu style="width: 180px;">
            <sl-menu-item @click=${() =>
              this._addPageNode("Untitled Page", false)}><sl-icon
                slot="prefix"
                src=${file}
              ></sl-icon>
              Page
            </sl-menu-item>
            <sl-menu-item
              @click=${() => this._addQuestionNode()}
            >
              <sl-icon
                slot="prefix"
                src=${helpSquareRounded}
              ></sl-icon>
              Question
            </sl-menu-item>
          
          </sl-menu>
        </sl-dropdown>
                      <sl-divider vertical style=${
                        this.inPreviewMode
                          ? "display: none;"
                          : "display: block; height: 30px;"
                      }> </sl-divider>
                      <sl-button
                      style=${
                        this.inPreviewMode
                          ? "display: none;"
                          : "display: block;"
                      }
                        @click=${() =>
                          (
                            this.shadowRoot.getElementById("dialog") as SlDialog
                          ).show()}
                      >
                        Clear
                      </sl-button>
              
            </div>
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
               <div id="drawflowEditorDiv" style=${
                 this.inPreviewMode ? "display: none;" : "display: block;"
               }>
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
                    </div>

                    ${
                      !this.inPreviewMode
                        ? html`<selected-node-details
                            .selectedNode=${this.selectedNode}
                            .editor=${this.editor}
                            .editorContent=${this.editorContent}
                          >
                            <slot></slot>
                          </selected-node-details>`
                        : null
                    }
                    
                  <slot></slot>
                  </selected-node-details>

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
            </div>`
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
  private _deleteGamebookContainersById(drawflowNodeId: Number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == drawflowNodeId) {
        container.remove();
      }
    });
  }

  /*


  */
  private _getContainerByDrawflowNodeId(id: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    return container;
  }

  /*


  */
  private _showGamebookContainerById(nodeId: Number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == nodeId) {
        container.show();
      } else {
        container.hide();
      }
    });
  }

  /*


  */
  private _hideAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.hide();
    });
  }

  /*
  TODO: Figure out how to put this into a constructor
  Also remove the node data adding 
  */
  private _createPageContainerFromPageNode(pageNode: DrawflowNode) {
    const pageContainer = document.createElement(
      "page-container"
    ) as PageContainer;
    pageContainer.setAttribute("drawflowNodeId", pageNode.id.toString());
    pageContainer.setAttribute("pageTitle", pageNode.data.title);

    if (pageNode.class == "origin") {
      pageContainer.setAttribute("originPage", "1");
    } else {
      pageContainer.setAttribute("originPage", "0");
    }

    const parser = new DOMParser();
    const contentFromNode = parser.parseFromString(
      pageNode.data.content,
      "text/html"
    );

    // Loop through the child nodes of the body of the parsed document
    contentFromNode.body.childNodes.forEach((node) => {
      pageContainer.appendChild(node);
    });

    //to let it access editor
    pageContainer.hide();
    this.appendChild(pageContainer);
  }

  /* 
  
  
  */
  private _createQuestionContainerFromQuestionNode(questionNode: DrawflowNode) {
    const quizContainer = document.createElement(
      "quiz-container"
    ) as QuizContainer;
    quizContainer.setAttribute("drawflowNodeId", questionNode.id.toString());
    quizContainer.style.position = "unset";

    quizContainer.setAttribute("quiz", JSON.stringify(questionNode.data));

    //to let it access editor
    quizContainer.hide();
    this.appendChild(quizContainer);
  }

  /*


  */
  private _registerEditorEventHandlers() {
    //This event only picks up data changes from elements marked with df-* in the node
    //Currently only "page" nodes have such elements
    this.editor.on("nodeDataChanged", (id) => {
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(id);
      const container = this._getContainerByDrawflowNodeId(id.toString());
      (container as PageContainer).pageTitle = this.selectedNode.data.title;
    });

    //custom event that indicates data is changed
    this.addEventListener("nodeDataUpdated", (event) => {
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(
        (event as CustomEvent).detail.nodeId
      );

      if (this.selectedNode.class == "question-branch") {
        const container = this._getContainerByDrawflowNodeId(
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
        this._showGamebookContainerById(this.selectedNode.id);
      } else if (this.selectedNode.class == "question-branch") {
        this._hideAllGamebookContainers();
      }
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.selectedNode = NO_NODE_SELECTED;
      this._hideAllGamebookContainers();
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      this.editorContent = { ...this.editor.drawflow };

      let createdNode = this.editor.getNodeFromId(id);

      if (createdNode.class == "page" || createdNode.class == "origin") {
        this._createPageContainerFromPageNode(createdNode);
      } else if (createdNode.class == "question-branch") {
        this._createQuestionContainerFromQuestionNode(createdNode);
      }
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this._deleteGamebookContainersById(id);
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
          this._showGamebookContainerById(this.selectedNode.id);
        } else if (this.selectedNode.class == "question-branch") {
          this._hideAllGamebookContainers();
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

      this._hideAllGamebookContainers();
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
          const pageContainer = this._getContainerByDrawflowNodeId(output_id);
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
          const pageContainer = this._getContainerByDrawflowNodeId(output_id);
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
        this._showGamebookContainerById(this.selectedNode.id);
      } else if (this.selectedNode.class == "question-branch") {
        this._hideAllGamebookContainers();
      }
    });

    //event listener for when the user zoomed into the editor
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

    this.editor.addNode(
      title,
      0,
      0,
      0,
      0,
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

    this.editor.addNode(
      "Question Branch",
      0,
      0,
      0,
      0,
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
}

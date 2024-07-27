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
  SlResizeObserver,
} from "@shoelace-style/shoelace";

//@tabler icons
import file from "@tabler/icons/filled/file.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/dots-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import helpSquareRounded from "@tabler/icons/outline/help-square-rounded.svg";

//Drawflow Imports
import Drawflow, { DrawflowConnection, DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

//Import Styles
import styles from "../css/webwriter-branching-scenario-css";
import customDrawflowStyles from "../css/custom-drawflow-css";

//Import Sub Components
import { SelectedNodeViewRenderer } from "./selected-node-view-renderer";
import { WebWriterGamebook } from "./gamebook";
import { WebWriterGamebookPageContainer } from "./webwriter-gamebook-page-container";
import { QuizContainer } from "./quiz-container";
import { NodeEditorControlsBar } from "./node-editor-control-bar";
import { gamebookExamples } from "./gamebook-examples";
import { GamebookContainerManager } from "./gamebook-container-manager";
import { DrawflowHelpPopUpControls } from "./node-editor-help-popup-controls";
import { DrawflowBackground } from "./node-editor-background";
import { WebWriterConnectionButton } from "./webwriter-connection-button";

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

//
const NO_CONNECTION_SELECTED = "output_id-output_class-input_id-input_class";

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
  @property({ type: String })
  selectedConnection = NO_CONNECTION_SELECTED;

  @property({ type: String, attribute: true, reflect: true })
  gamebookTitle = "";

  @property({ type: Boolean }) stopPropagation = false;

  @queryAssignedElements({
    flatten: true,
    selector: "webwriter-gamebook-page-container, quiz-container",
  })
  gamebookContainers;

  @query("gamebook-container-manager")
  gamebookContainerManager;

  static shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    //delegatesFocus: true,
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
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-dropdown": SlDropdown,
      "sl-resize-observer": SlResizeObserver,
      //
      "webwriter-gamebook": WebWriterGamebook,
      "webwriter-connection-button": WebWriterConnectionButton,
      "webwriter-gamebook-page-container": WebWriterGamebookPageContainer,
      "quiz-container": QuizContainer,
      "node-editor-controls-bar": NodeEditorControlsBar,
      "gamebook-container-manager": GamebookContainerManager,
      "drawflow-help-popup-controls": DrawflowHelpPopUpControls,
      "drawflow-background": DrawflowBackground,
      "selected-node-view-renderer": SelectedNodeViewRenderer,
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
    this.editor.reroute = false;
    this.editor.reroute_fix_curvature = false;

    //max scale
    this.editor.zoom_max = 0.8;
    //min scale
    this.editor.zoom_min = 0.25;
    //scale factor
    this.editor.zoom_value = 0.05;

    if (this.editorZoom == -1) {
      this.editor.zoom = 0.45;
    } else {
      this.editor.zoom = this.editorZoom;
    }

    this.editor.start();
    this.editor.zoom_refresh();

    this._registerEditorEventHandlers();

    this._registerBackground();

    if (this.editorContent == null) {
      this.addPageNode("First Page", true);
    } else {
      this.editor.import(this.editorContent);
    }

    // this.addEventListener("click", () => {
    //   console.log("click");
    //   this.focus();
    // });

    // //this.tabIndex = -1;
    // this.setAttribute("tabIndex", "-1");
  }

  /*
  
  */
  render() {
    return html`
      <div id="widget">
        ${this.isContentEditable
          ? html`
           <node-editor-controls-bar
                .gamebookTitle=${this.gamebookTitle}
                .importExample=${(number) => this.importExample(number)}
                .addPageNode=${(string, boolean) =>
                  this.addPageNode(string, boolean)}
                .addQuestionNode=${() => this.addQuestionNode()}
                .handleGamebookTitle=${(event) =>
                  this.handleGamebookTitle(event)}
                .showDialog=${() =>
                  (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
              >
              </node-editor-controls-bar>    
              <div id="nodeEditor">
                <sl-resize-observer>
               
                <drawflow-background .nodeSelected=${
                  this.selectedNode != NO_NODE_SELECTED
                }></drawflow-background>
                <div
                  id="drawflowEditorDiv"
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
                  <drawflow-help-popup-controls></drawflow-help-popup-controls>
                    <!-- <sl-button class="exportButton" @click=${() =>
                      this.testOutput()}>Export</sl-button> -->
                  </div>
                  </sl-resize-observer>
                </div>
                      <selected-node-view-renderer
                        .selectedNode=${this.selectedNode}
                        .editor=${this.editor}
                        .editorContent=${this.editorContent}
                        ._hoverConnection=${(identifier) =>
                          this._hoverConnection(identifier)}
                        ._unhoverConnection=${(identifier) =>
                          this._unhoverConnection(identifier)}
                      >
                        <gamebook-container-manager
                          .appendToShadowDom=${(container) =>
                            this._addContainerCallback(container)}
                        >
                          <slot></slot>
                        </gamebook-container-manager>
                      </selected-node-view-renderer>
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
          : html`<webwriter-gamebook
              gamebookTitle=${this.gamebookTitle != ""
                ? this.gamebookTitle
                : "No Name"}
              ><slot></slot
            ></webwriter-gamebook>`}
      </div>
    `;
  }

  /*

TODO: On clear editor, the slot gets fucked
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

    this.addPageNode("First Page", true);
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
        this.gamebookContainerManager
          ._getContainerByDrawflowNodeId(this.selectedNode.id.toString())
          .updateFromQuestionNode(this.selectedNode);
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

    //Event listener for when a connection creation started via drag and drop
    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      this.selectedNode = this.editor.getNodeFromId(output_id);

      this.shadowRoot
        ?.getElementById(`node-${output_id}`)
        ?.classList.add("selected");

      this.shadowRoot
        .querySelector('svg[class="connection"]')
        ?.querySelector("path")
        ?.classList.add("creating");

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
      // }
    });

    //Event listener for when a connection is selected
    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        this.selectedConnection = `${output_id}-${output_class}-${input_id}-${input_class}`;
        this._selectConnection(this.selectedConnection);
      }
    );

    //event listener for when a connection is unselected
    this.editor.on("connectionUnselected", (boolean) => {
      this._unselectConnection(this.selectedConnection);
      this.selectedConnection = NO_CONNECTION_SELECTED;
    });

    //Event for created connections done e.g. via drag and drop
    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.editorContent = { ...this.editor.drawflow };
        this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.shadowRoot
          .querySelector(
            `svg[class="connection node_in_node-${input_id} node_out_node-${output_id} ${output_class} ${input_class}"]`
          )
          ?.querySelector("path")
          ?.classList.remove("creating");

        if (outputNode.class == "page" || outputNode.class == "origin") {
          const pageContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              output_id
            );
          pageContainer.addConnectionButtonToPageContainer(
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
      }
    );

    //Event listener for when a connection is removed, e.g. by click in editor
    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        this.editorContent = { ...this.editor.drawflow };
        //this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);

        this._unselectConnection(this.selectedConnection);
        this.selectedConnection = NO_CONNECTION_SELECTED;

        const outputNode = this.editor.getNodeFromId(output_id);

        if (
          (outputNode.class == "page" || outputNode.class == "origin") &&
          !this.stopPropagation
        ) {
          const pageContainer =
            this.gamebookContainerManager._getContainerByDrawflowNodeId(
              output_id
            );
          const identifier = `${output_id}-${output_class}-${input_id}-input_1`;
          // console.log(
          //   "connection removed, remove link button with identifier: ",
          //   identifier
          // );

          pageContainer.removeConnectionButtonFromPageContainer(identifier);
        }
        //
        else if (outputNode.class == "question-branch") {
          this._updateQuestionNodeAnswerTarget(
            outputNode,
            output_class,
            "undefined"
          );
        }
        this.stopPropagation = false;
      }
    );

    //
    this.addEventListener("userDeleteConnectionButton", (event) => {
      this.stopPropagation = true;
      const { outputNodeId, outputClass, inputNodeId, inputClass } =
        this.parseConnectionIdentifier(
          (event as CustomEvent).detail.identifier
        );

      this.editor.removeNodeOutput(outputNodeId, outputClass);
      const pageContainer =
        this.gamebookContainerManager._getContainerByDrawflowNodeId(
          outputNodeId
        );
      pageContainer.updateConnectionButtonIds(outputClass);

      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
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

      // const div = this.shadowRoot.querySelector(`#node-${nodeId}`);
      // console.log(div);

      // const output = div.querySelector(".output.output_1");
      // console.log(output);

      // const par = document.createElement("p");

      // par.textContent = "1";
      // output.appendChild(par);
    });

    //event for when an output of a node was deleted
    this.addEventListener("outputDeleted", (event) => {
      const nodeId = (event as CustomEvent).detail.nodeId;
      this.editorContent = { ...this.editor.drawflow };
      this.selectedNode = this.editor.getNodeFromId(nodeId);
    });

    //event listener for when the user zoomed into the editor
    this.editor.on("zoom", (zoom_level) => {
      //NOTE: Usually this.editor.zoom_min should have been supplied here, however drawflow has an error in which the minimum gets undercut.
      //This results in faulty calculation for zooming into the background, so we hardcode it here.
      //Issue report drawflow: https://github.com/jerosoler/Drawflow/issues/883#issuecomment-2238986045
      (
        this.shadowRoot.querySelector(
          "drawflow-background"
        ) as DrawflowBackground
      ).onZoom(zoom_level, 0.2, this.editor.zoom_max);

      //Attention: Due to floating errors in the drawflow framework, we hardcoded the actual zoom_min of 0.1.
      //Although it is set to 0.2 in the firstUpdated() method, values of 0.1 are produced
      const range = this.editor.zoom_max - 0.2;
      const percentage = (((zoom_level - 0.2) / range) * 100).toFixed(0);

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

    //TODO: event for programmatic node selection
  }

  /*


  */
  private handleGamebookTitle(event) {
    this.gamebookTitle = event.target.value;
  }

  /*


  */
  private addPageNode(title: string, isOrigin: boolean) {
    const pageContent = {
      title: title,
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create page sl-icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("iconDiv");
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", file);
    icon.classList.add("pageIcon");

    iconDiv.appendChild(icon);
    containerDiv.appendChild(iconDiv);

    //
    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const input = document.createElement("input");
    input.id = "title";
    input.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(input);

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
      1,
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
  private addQuestionNode() {
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
    nameLabel.classList.add("input-label");
    contentDiv.appendChild(nameLabel);

    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.id = "test-textarea";
    inputElement.placeholder = "Enter name";
    inputElement.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(inputElement);

    containerDiv.appendChild(contentDiv);

    // Create the icon div
    const threeDotsIcon = document.createElement("sl-icon") as SlIcon;
    threeDotsIcon.setAttribute("src", dotsVertical);
    threeDotsIcon.classList.add("threeDots");
    containerDiv.appendChild(threeDotsIcon);

    const containerHtml = containerDiv.outerHTML;

    //get current center of drawflow div
    const rect = this.drawflowEditorDiv.getBoundingClientRect();
    const zoom = this.editor.zoom;

    //center of canvas - translation of canvas / zoom - node dimension center
    const centerX = rect.width / 2 - this.editor.canvas_x / zoom - 110 / 2;
    const centerY = rect.height / 2 - this.editor.canvas_y / zoom - 110 / 2;

    this.editor.addNode(
      "Question Branch",
      1,
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

    if (index !== -1) {
      quizNode.data.answers[index].targetPageId = target_node_id;

      this.editor.updateNodeDataFromId(quizNode.id, {
        ...quizNode.data,
        answers: quizNode.data.answers,
      });

      this.dispatchEvent(
        new CustomEvent("nodeDataUpdated", {
          detail: { nodeId: quizNode.id },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  /*


  */
  private testOutput() {
    this.gamebookContainers.forEach((container) => {
      if (container instanceof WebWriterGamebookPageContainer) {
        // Assuming PageContainer has a method or property to access its child elements
        const childElements = container.childNodes; // Adjust this to how you get child elements in your PageContainer

        childElements.forEach((child) => {
          if ((child as HTMLElement).tagName.toLowerCase() === "picture") {
            const dataUrl = (child as HTMLElement).getAttribute("dataURl"); // Assuming dataURl is an attribute
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

  /*

  */
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
  private parseConnectionIdentifier(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      outputClass: parts[1],
      inputNodeId: parseInt(parts[2]),
      inputClass: parts[3],
    };

    return parsed;
  }
  /*

  */
  private _hoverConnection(identifier) {
    const { inputNodeId, outputNodeId, outputClass, inputClass } =
      this.parseConnectionIdentifier(identifier);

    const svg = this.shadowRoot.querySelector(
      `svg.connection.node_in_node-${inputNodeId}.node_out_node-${outputNodeId}.${outputClass}.${inputClass}`
    );
    svg.querySelector("path").classList.add("creating");

    [
      this.shadowRoot?.getElementById(`node-${outputNodeId}`),
      this.shadowRoot?.getElementById(`node-${inputNodeId}`),
    ].forEach((nodeDiv, i) => {
      if (nodeDiv) {
        const type = i === 0 ? "output" : "input";
        nodeDiv
          .querySelector(`.${type}.${i === 0 ? outputClass : inputClass}`)
          .classList.add("selected");
      }
    });
  }

  /*

  */
  private _unhoverConnection(identifier) {
    const { inputNodeId, outputNodeId, outputClass, inputClass } =
      this.parseConnectionIdentifier(identifier);

    const svg = this.shadowRoot.querySelector(
      `svg.connection.node_in_node-${inputNodeId}.node_out_node-${outputNodeId}.${outputClass}.${inputClass}`
    );
    svg.querySelector("path").classList.remove("creating");

    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv.querySelector(`.${type}.${cls}`).classList.remove("selected");
      }
    });
  }

  /*

  */
  private _selectConnection(identifier) {
    const { outputNodeId, outputClass, inputNodeId, inputClass } =
      this.parseConnectionIdentifier(identifier);

    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv.querySelector(`.${type}.${cls}`).classList.add("selected");
      }
    });
  }

  /*

  */
  private _unselectConnection(identifier) {
    const { outputNodeId, outputClass, inputNodeId, inputClass } =
      this.parseConnectionIdentifier(identifier);

    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv.querySelector(`.${type}.${cls}`).classList.remove("selected");
      }
    });
  }

  /*

  */
  private importExample(index: number) {
    this.editor.clear();
    this.editor.import(gamebookExamples.gamebookExamples[index].drawflow);

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

  /*

  */
  private _addContainerCallback(container: Node) {
    this.appendChild(container);
  }

  /*

  */
  private _registerBackground() {
    // Select the elements
    const drawflowEditorDiv =
      this.shadowRoot.querySelector("#drawflowEditorDiv");
    const drawflowBackground = this.shadowRoot.querySelector(
      "drawflow-background"
    );

    // List of events to propagate and controls to check
    const eventsToPropagate = [
      "mousemove",
      "mousedown",
      "mouseup",
      "mouseleave",
    ];
    const insideEditorControls = [
      "#zoomInBtn",
      "#zoomOutBtn",
      "help-editor-controls",
      ".input",
    ];

    // Check if the event target is inside specified controls
    const isEventInsideControls = (event) =>
      insideEditorControls.some((selector) => {
        const element = this.shadowRoot.querySelector(selector);
        return element && element.contains(event.target);
      });

    // Propagate event to drawflow-background if not inside controls
    const propagateEvent = (event) => {
      if (isEventInsideControls(event)) return;

      const eventInit = {
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        composed: event.composed,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey,
      };

      const newEvent =
        event.type === "wheel"
          ? new WheelEvent(event.type, {
              ...eventInit,
              deltaX: event.deltaX,
              deltaY: event.deltaY,
              deltaZ: event.deltaZ,
              deltaMode: event.deltaMode,
            })
          : new MouseEvent(event.type, {
              ...eventInit,
              button: event.button,
              buttons: event.buttons,
              movementX: event.movementX,
              movementY: event.movementY,
            });

      drawflowBackground.dispatchEvent(newEvent);
    };

    // Add event listeners to propagate events
    eventsToPropagate.forEach((eventType) => {
      drawflowEditorDiv.addEventListener(eventType, propagateEvent);
    });
  }
}

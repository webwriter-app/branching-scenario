import { html } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query } from "lit/decorators.js";

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
  SlMenuLabel,
  SlDropdown,
  SlIcon,
} from "@shoelace-style/shoelace";

//@tabler icons
import file from "@tabler/icons/filled/file.svg";
import helpSquareRounded from "@tabler/icons/outline/help-square-rounded.svg";
import circleArrowRight from "@tabler/icons/filled/circle-arrow-right.svg";
import dotsVertical from "@tabler/icons/outline/dots-vertical.svg";
import zoomIn from "@tabler/icons/outline/zoom-in.svg";
import zoomOut from "@tabler/icons/outline/zoom-out.svg";
import squares from "@tabler/icons/filled/squares.svg";
import arrowsSplit2 from "@tabler/icons/outline/arrows-split-2.svg";

//Drawflow Imports
import Drawflow, { DrawflowConnection, DrawflowNode } from "drawflow";
import { style } from "drawflow/dist/drawflow.style.js";

import customDrawflowStyles from "../css/custom-drawflow-css";
import styles from "../css/webwriter-branching-scenario-css";

import { DrawflowBackground } from "./node-editor-background";
import { NodeEditorControlsBar } from "./node-editor-control-bar";
import { DrawflowHelpPopUpControls } from "./node-editor-help-popup-controls";

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
const NO_CONNECTION_SELECTED = "output_id-input_id-output_class-input_class";

@customElement("node-editor")
export class NodeEditor extends LitElementWw {
  //registering custom elements used in the Web component
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
      "sl-menu-label": SlMenuLabel,
      "drawflow-background": DrawflowBackground,
      "node-editor-controls-bar": NodeEditorControlsBar,
      "drawflow-help-popup-controls": DrawflowHelpPopUpControls,
    };
  }

  // Import CSS
  static styles = [style, styles, customDrawflowStyles];

  //internal reactive state, not part of the component's API
  @property({ type: Object, attribute: true, reflect: true }) editor?: Drawflow;
  @property({ type: Object, attribute: true, reflect: true }) editorContent;
  @property({ type: Number, attribute: true, reflect: true }) editorZoom = -1;
  @property({ type: String }) editorZoomString = "";
  @property({ type: Object, attribute: true }) selectedNode;
  @property({ type: String }) gamebookTitle;
  @property({ type: String })
  selectedConnection = NO_CONNECTION_SELECTED;
  @property({ type: Boolean, attribute: true }) programmticallySelectedNode =
    false;

  //access nodes in the internal component DOM.
  @property({ attribute: false }) handleGamebookTitle = (event) => {};

  //access nodes in the internal component DOM.
  @property({ attribute: false }) changeInEditorCallback = (
    drawflow,
    updateType,
    node?,
    removedNodeId?,
    inputNode?,
    outputNode?,
    inputClass?,
    outputClass?,
    outputHadConnections?
  ) => {};

  @property({ attribute: false }) updateSelectedNodeCallback = (id) => {};

  @query("#drawflowEditorDiv")
  drawflowEditorDiv;

  /*

  */
  protected firstUpdated(_changedProperties: any): void {
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
  }

  /*

  */
  render() {
    return html`
      <div id="nodeEditor">
        <node-editor-controls-bar
          .gamebookTitle=${this.gamebookTitle}
          .handleGamebookTitle=${(event) => this.handleGamebookTitle(event)}
          .addPageNode=${(string, boolean) => this.addPageNode(string, boolean)}
          .addPopUpNode=${(string) => this.addPopUpNode(string)}
          .addQuestionNode=${() => this.addQuestionNode()}
          .addBranchNode=${() => this.addBranchNode()}
          .showDialog=${() =>
            (this.shadowRoot.getElementById("dialog") as SlDialog).show()}
        >
        </node-editor-controls-bar>
        <drawflow-background
          .nodeSelected=${this.selectedNode.id.toString() != "-1"}
        ></drawflow-background>
        <div id="drawflowEditorDiv">
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
        </div>
      </div>
      <!-- Dialog for clearing editor-->
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
      </sl-dialog>
    `;
  }

  /*
  TODO: on clear editor, there are some problems with the slot
  */
  private _clearEditor() {
    const dialog = this.shadowRoot.getElementById("dialog") as SlDialog;
    dialog.hide();

    this.editor.clear();

    this.changeInEditorCallback({ ...this.editor.drawflow }, "editorCleared");
    this.addPageNode("First Page", true);
  }

  /*


  */
  private _registerEditorEventHandlers() {
    this.editor.on("nodeDataChanged", (id) => {
      //This event only picks up data changes from elements marked with df-* in the node
      //Currently only title inputs on nodes have such elements
      let changedNode = this.editor.getNodeFromId(id);
      this.changeInEditorCallback(
        { ...this.editor.drawflow },
        "nodeRenamed",
        changedNode
      );
    });

    // Event listener for node click
    this.editor.on("nodeSelected", (id) => {
      this.updateSelectedNodeCallback(id);
    });

    // Event listener for node unselected
    this.editor.on("nodeUnselected", (boolean) => {
      this.updateSelectedNodeCallback("-1");
    });

    //Event listerner for creation of a node
    this.editor.on("nodeCreated", (id) => {
      //console.log("nodeCreated", id);
      let createdNode = this.editor.getNodeFromId(id);
      this.changeInEditorCallback(
        { ...this.editor.drawflow },
        "nodeCreated",
        createdNode
      );
    });

    //Event listener for deletion of a node
    this.editor.on("nodeRemoved", (id) => {
      this.changeInEditorCallback(
        { ...this.editor.drawflow },
        "nodeRemoved",
        null,
        id
      );
    });

    //Event listener for when a node got moved
    this.editor.on("nodeMoved", (id) => {
      let movedNode = this.editor.getNodeFromId(id);
      this.changeInEditorCallback(
        { ...this.editor.drawflow },
        "nodeMoved",
        movedNode
      );
    });

    //Event listener for when a connection creation started via drag and drop
    this.editor.on("connectionStart", ({ output_id, output_class }) => {
      //   this.updateSelectedNodeCallback(output_id);
      //   this.shadowRoot
      //     ?.getElementById(`node-${output_id}`)
      //     ?.classList.add("selected");
      this.shadowRoot
        .querySelector('svg[class="connection"]')
        ?.querySelector("path")
        ?.classList.add("creating");
      //   this.programmticallySelectedNode = true;
    });

    //Event listener for when a connection is selected
    this.editor.on(
      "connectionSelected",
      ({ output_id, input_id, output_class, input_class }) => {
        this.selectedConnection = `${output_id}-${input_id}-${output_class}-${input_class}`;
        this._highlightConnection(
          output_id,
          input_id,
          output_class,
          input_class
        );
      }
    );

    //event listener for when a connection is unselected
    this.editor.on("connectionUnselected", (boolean) => {
      this._unhighlightConnection(this.selectedConnection);
      this.selectedConnection = NO_CONNECTION_SELECTED;
    });

    //Event for created connections done e.g. via drag and drop
    this.editor.on(
      "connectionCreated",
      ({ output_id, input_id, output_class, input_class }) => {
        this.updateSelectedNodeCallback(this.selectedNode.id);
        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.shadowRoot
          .querySelector(
            `svg[class="connection node_in_node-${input_id} node_out_node-${output_id} ${output_class} ${input_class}"]`
          )
          ?.querySelector("path")
          ?.classList.remove("creating");

        this.changeInEditorCallback(
          { ...this.editor.drawflow },
          "connectionCreated",
          null,
          null,
          inputNode,
          outputNode,
          input_class,
          output_class
        );
      }
    );

    //Event listener for when a connection is removed, e.g. by click in editor
    this.editor.on(
      "connectionRemoved",
      ({ output_id, input_id, output_class, input_class }) => {
        //console.log("this nodeeditor callback");
        this.updateSelectedNodeCallback(this.selectedNode.id);

        if (this.selectedConnection != NO_CONNECTION_SELECTED) {
          this._unhighlightConnection(this.selectedConnection);
          this.selectedConnection = NO_CONNECTION_SELECTED;
        }

        const outputNode = this.editor.getNodeFromId(output_id);
        const inputNode = this.editor.getNodeFromId(input_id);

        this.changeInEditorCallback(
          { ...this.editor.drawflow },
          "connectionRemoved",
          null,
          null,
          inputNode,
          outputNode,
          input_class,
          output_class
        );
      }
    );

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
  private addPopUpNode(title: string) {
    const popupContent = {
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
    icon.setAttribute("src", squares);
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

    //Add label to the input for the nodes name
    const nameLabel = document.createElement("p");
    nameLabel.classList.add("input-label");
    nameLabel.textContent = "Popup"; // Set the text content of the label
    contentDiv.appendChild(nameLabel);

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
      "popup",
      popupContent,
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
  /*


  */
  private addBranchNode() {
    const branchNodeContent = {
      title: "Untitled Branch",
      content: `<p>Testing Slots HTML Editing</p>`,
    };

    // Create the container div
    const containerDiv = document.createElement("div");
    containerDiv.classList.add("container");

    // Create page sl-icon
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("iconDiv");
    const icon = document.createElement("sl-icon") as SlIcon;
    icon.setAttribute("src", arrowsSplit2);
    icon.classList.add("pageIcon");

    iconDiv.appendChild(icon);
    containerDiv.appendChild(iconDiv);

    const contentDiv = document.createElement("div");
    contentDiv.classList.add("content");

    const input = document.createElement("input");
    input.id = "title";
    input.setAttribute("df-title", ""); // Adding df-title attribute
    contentDiv.appendChild(input);

    //Add label to the input for the nodes name
    const nameLabel = document.createElement("p");
    nameLabel.classList.add("input-label");
    nameLabel.textContent = "Smart Branch"; // Set the text content of the label
    contentDiv.appendChild(nameLabel);

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
      "Branch Node",
      1,
      0,
      centerX,
      centerY,
      "branch",
      branchNodeContent,
      containerHtml,
      false
    );
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

  /*

  */
  public _highlightConnection(
    outputNodeId,
    inputNodeId,
    outputClass,
    inputClass
  ) {
    [
      ["output", outputNodeId, outputClass],
      ["input", inputNodeId, inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv.querySelector(`.${type}.${cls}`).classList.add("selected");
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${inputNodeId} node_out_node-${outputNodeId} ${outputClass} ${inputClass}"]`
      )
      ?.querySelector("path")
      ?.classList.add("creating");
  }

  /*

  */
  public _unhighlightConnection(identifier) {
    const parts = identifier.split("-");
    const parsed = {
      outputNodeId: parseInt(parts[0]),
      inputNodeId: parseInt(parts[1]),
      outputClass: parts[2],
      inputClass: parts[3],
    };

    [
      ["output", parsed.outputNodeId, parsed.outputClass],
      ["input", parsed.inputNodeId, parsed.inputClass],
    ].forEach(([type, nodeId, cls]) => {
      const nodeDiv = this.shadowRoot?.getElementById(`node-${nodeId}`);
      if (nodeDiv) {
        nodeDiv.querySelector(`.${type}.${cls}`).classList.remove("selected");
      }
    });

    this.shadowRoot
      .querySelector(
        `svg[class="connection node_in_node-${parsed.inputNodeId} node_out_node-${parsed.outputNodeId} ${parsed.outputClass} ${parsed.inputClass}"]`
      )
      ?.querySelector("path")
      ?.classList.remove("creating");
  }
}

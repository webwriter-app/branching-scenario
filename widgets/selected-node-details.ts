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

//
import Drawflow, { DrawflowNode } from "drawflow";

//Import Sub Components
import { PageNodeDetails } from "./page-node-details";
import { QuizBranchNodeDetails } from "./quiz-branch-node-details";
import { PageContainer } from "./gamebook-components/page-container";
import { QuizContainer } from "./gamebook-components/quiz-container";

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

@customElement("selected-node-details")
export class SelectedNodeDetails extends LitElementWw {
  @property({ type: Object, attribute: true }) selectedNode: DrawflowNode =
    NO_NODE_SELECTED;

  //internal reactive state, not part of the component's API
  @state()
  editor?: Drawflow;

  @property({ type: Object, attribute: false }) editorContent;

  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-dialog": SlDialog,
      "sl-icon": SlIcon,
      "sl-icon-button": SlIconButton,
      "page-node-details": PageNodeDetails,
      "quiz-branch-node-details": QuizBranchNodeDetails,
      "page-container": PageContainer,
      "quiz-container": QuizContainer,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-dropdown": SlDropdown,
    };
  }

  render() {
    return html`
      <div>
        ${this.selectedNode.class == "page" ||
        this.selectedNode.class == "origin"
          ? html` <div id="selected-node-details">
              <page-node-details
                .editor="${this.editor}"
                .nodesInEditor="${this.editorContent.drawflow.Home.data}"
                .selectedNode="${this.selectedNode}"
                .selectedNodeId="${this.selectedNode.id}"
              >
                <slot></slot>
              </page-node-details>
            </div>`
          : this.selectedNode.class == "question-branch"
          ? html` <div id="selected-node-details">
              <quiz-branch-node-details
                .editor="${this.editor}"
                .nodesInEditor="${this.editorContent.drawflow.Home.data}"
                .selectedNode="${this.selectedNode}"
              >
                <slot></slot
              ></quiz-branch-node-details>
            </div>`
          : html` <div>
              <p>Select a node</p>
              <slot></slot>
            </div>`}
      </div>
    `;
  }
}

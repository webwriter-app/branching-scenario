import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea.component.js";
import SlDivider from "@shoelace-style/shoelace/dist/components/divider/divider.component.js";
import SlIconButton from "@shoelace-style/shoelace/dist/components/icon-button/icon-button.component.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.component.js";
import SlOption from "@shoelace-style/shoelace/dist/components/option/option.component.js";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.component.js";

//Bootstrap Icon Import
import Trash from "bootstrap-icons/icons/trash.svg";
import Plus from "bootstrap-icons/icons/plus.svg";

//CSS
import styles from "../css/quiz-branch-node-details-css";

//TODO: selected node should fill itself on open
//TODO: actually insert a multiple choice dialog to the gamebook page
@customElement("quiz-branch-node-details")
export class QuizBranchNodeDetails extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "sl-checkbox": SlCheckbox,
    };
  }

  //import CSS
  static styles = [styles];

  //internal reactive state, not part of the component's API
  @state()
  editor?: Drawflow;

  //properties
  @property({ type: Object, attribute: false }) selectedNode: DrawflowNode = {
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

  @property({ type: Object, attribute: false }) nodesInEditor = {};
  @property({ type: Object, attribute: false }) gamebook: Gamebook =
    new Gamebook();

  answerIdGenerator = 0;

  protected firstUpdated(_changedProperties: any): void {
    this.answerIdGenerator = this.selectedNode.data.answers.length;
  }

  render() {
    return html` <div>
      <div class="controls">
        <sl-icon-button src=${Plus} @click=${this._addAnswerToQuizBranchNode}
          >Add Answer
        </sl-icon-button>
      </div>
      <p>Selected Quiz Branch: ${this.selectedNode.data.title}</p>
      <sl-textarea
        resize="none"
        placeholder="Type in a question here"
        size="large"
        .value="${this.selectedNode.data.question}"
        @input="${this._handleUserInputQuestion}"
      ></sl-textarea>
      <sl-divider horizontal></sl-divider>
      <div>
        ${this.selectedNode.data.answers.map(
          (answer) =>
            html`<div class="answer">
              <sl-textarea
                resize="none"
                placeholder="Answer"
                answerId="${answer.id}"
                .value="${answer.text}"
                @input="${this._handleUserInputAnswer}"
              ></sl-textarea
              ><sl-select
                class="nodeSelect"
                answerId="${answer.id}"
                placeholder="Select Page"
                @sl-input=${this._handleUserInputTargetPage}
                .value="${answer.targetPageId}"
              >
                ${Object.keys(this.nodesInEditor).map(
                  (key) =>
                    html`<sl-option value=${this.nodesInEditor[key].id}
                      >${this.nodesInEditor[key].data.title}</sl-option
                    >`
                )} </sl-select
              ><sl-checkbox
                answerId="${answer.id}"
                ?checked=${answer.isCorrect}
                @click="${this._handleUserInputCorrectness}"
                >Correct</sl-checkbox
              >
              <sl-icon-button
                src=${Trash}
                @click=${() => this._removeAnswerFromQuizBranchNode(answer.id)}
              ></sl-icon-button>
            </div>`
        )}
      </div>
    </div>`;
  }

  private _addAnswerToQuizBranchNode() {
    const answerArray = this.selectedNode.data.answers as [Answer];

    answerArray.push({
      id: this.answerIdGenerator,
      text: "",
      targetPageId: "undefined",
      isCorrect: null,
    });

    this.answerIdGenerator += 1;

    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: "Quiz Branch",
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _removeAnswerFromQuizBranchNode(answerId: number) {
    const answerArray = this.selectedNode.data.answers;
    const index = answerArray.findIndex((answer) => answer.id == answerId);

    if (index !== -1) {
      // Remove the element at the found index
      answerArray.splice(index, 1);
    }

    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _handleUserInputAnswer(event) {
    const answerId = event.target.getAttribute("answerId");
    const answerArray = this.selectedNode.data.answers;

    const index = answerArray.findIndex((answer) => answer.id == answerId);

    // If the answer is found (index is not -1), update its text
    if (index !== -1) {
      // Update the text of the answer at the found index
      answerArray[index].text = event.target.value;
    }

    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _handleUserInputQuestion(event) {
    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: event.target.value,
      answers: this.selectedNode.data.answers,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _handleUserInputCorrectness(event) {
    const answerId = event.target.getAttribute("answerId");
    const answerArray = this.selectedNode.data.answers;

    const index = this.selectedNode.data.answers.findIndex(
      (answer) => answer.id == answerId
    );

    if (index !== -1) {
      answerArray[index].isCorrect = event.target.checked;
    }

    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);
  }

  private _handleUserInputTargetPage(event) {
    const answerId = event.target.getAttribute("answerId");
    const answerArray = this.selectedNode.data.answers;

    const index = this.selectedNode.data.answers.findIndex(
      (answer) => answer.id == answerId
    );

    if (index !== -1) {
      answerArray[index].targetPageId = String(event.target.value);
    }

    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //refresh the node such that component renders again
    this.selectedNode = this.editor.getNodeFromId(this.selectedNode.id);

    console.log(this.selectedNode.data.answers);
  }
}

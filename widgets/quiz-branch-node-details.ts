import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./gamebook-model";

//Drawflow Imports
import Drawflow from "drawflow";
import { DrawflowNode } from "drawflow";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlCheckbox,
  SlButton,
  SlIcon,
  SlIconButton,
  SlDivider,
  SlTextarea,
} from "@shoelace-style/shoelace";

//Bootstrap Icon Import
import Trash from "bootstrap-icons/icons/trash.svg";
import Plus from "bootstrap-icons/icons/plus.svg";
import Dash from "bootstrap-icons/icons/dash.svg";
import PatchQuestion from "bootstrap-icons/icons/patch-question.svg";

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
      "sl-button": SlButton,
      "sl-icon": SlIcon,
    };
  }

  //import CSS
  static styles = [styles];

  //internal reactive state, not part of the component's API
  @state()
  editor?: Drawflow;

  //properties
  @property({ type: Object, attribute: true, reflect: true })
  selectedNode?: DrawflowNode;
  //  = {
  //   id: -1,
  //   name: "unselect",
  //   inputs: {},
  //   outputs: {},
  //   pos_x: 0,
  //   pos_y: 0,
  //   class: "unselect",
  //   data: {},
  //   html: "",
  //   typenode: false,
  // };

  @property({ type: Object, attribute: false }) nodesInEditor = {};

  /*
  //TODO: if you drag and drop a connection from a quiz branch to a page, it will not find a pagecontainer as a quiz branch does not create a page container
  //TODO: rethink logic of how to save answers and stuff
  //TODO: work on visualization of quiz branch node in slot system
   */
  render() {
    return html` <div>
      <div class="title-bar">
        <div class="div-icon">
          <object
            type="image/svg+xml"
            data=${PatchQuestion}
            class="svg"
          ></object>
        </div>
        <div class="div-title">
          <p class="title">${this.selectedNode.data.title}</p>
          <p class="subtitle">Gamebook Quiz</p>
        </div>

        <div class="last-item">
          <div class="number-input">
            <p class="subtitle">Inputs</p>
            <div class="horizontal">
              <sl-icon-button
                src=${Dash}
                @click=${this._deleteInputOfSelectedNode}
              >
              </sl-icon-button>
              <p class="number">
                ${Object.keys(this.selectedNode.inputs).length.toString()}
              </p>
              <sl-icon-button
                src=${Plus}
                @click=${this._addInputToSelectedNode}
              >
              </sl-icon-button>
            </div>
          </div>
        </div>
      </div>

      <div class="question">
        <sl-textarea
          resize="none"
          placeholder="Type in a question here"
          size="medium"
          .value="${this.selectedNode.data.question}"
          @input="${this._handleUserInputQuestion}"
          style="width: 100%"
        ></sl-textarea>
      </div>

      <div class="controls">
        <p class="number">
          ${Object.keys(this.selectedNode.outputs).length.toString()}
        </p>
        <sl-button @click=${this._addAnswerToQuizBranchNode}>
          <object slot="prefix" type="image/svg+xml" data=${Plus}></object>
          Add Answer
        </sl-button>
      </div>

      <div class="answersContainer">
        ${this.selectedNode.data.answers.map(
          (answer) =>
            html`
              <div class="answer">
                <sl-textarea
                  resize="none"
                  placeholder="Answer"
                  answerId="${answer.id}"
                  .value="${answer.text}"
                  @input="${this._handleUserInputAnswer}"
                ></sl-textarea>
                <sl-select
                  class="nodeSelect"
                  answerId="${answer.id}"
                  placeholder="Select Page"
                  @sl-input=${this._handleUserInputTargetPage}
                  .value="${answer.targetPageId}"
                >
                  ${Object.keys(this.nodesInEditor)
                    .filter(
                      (key) =>
                        this.nodesInEditor[key].id !== this.selectedNode.id &&
                        this.nodesInEditor[key].class != "quiz-branch"
                    )
                    .map(
                      (key) =>
                        html`<sl-option value="${this.nodesInEditor[key].id}"
                          >${this.nodesInEditor[key].data.title}</sl-option
                        >`
                    )}
                </sl-select>
                <sl-checkbox
                  answerId="${answer.id}"
                  ?checked=${answer.isCorrect}
                  @click="${this._handleUserInputCorrectness}"
                  >Correct</sl-checkbox
                >
                <sl-icon-button
                  src=${Trash}
                  @click=${() => this._removeAnswerFromQuizBranchNode(answer)}
                ></sl-icon-button>
              </div>
            `
        )}
      </div>
    </div>`;
  }

  /*


  */
  private _addInputToSelectedNode() {
    this.editor.addNodeInput(this.selectedNode.id);

    const event = new CustomEvent("inputCreated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });

    this.dispatchEvent(event);
  }

  /*


  */
  private _deleteInputOfSelectedNode() {
    const node = this.editor.getNodeFromId(this.selectedNode.id);
    const noOfInputs = Object.keys(node.inputs).length;
    if (noOfInputs != 0) {
      this.editor.removeNodeInput(this.selectedNode.id, `input_${noOfInputs}`);
    }

    const event = new CustomEvent("inputDeleted", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });

    this.dispatchEvent(event);
  }

  /*
  

  */
  private _addAnswerToQuizBranchNode() {
    //add an output to the node
    this.editor.addNodeOutput(this.selectedNode.id);

    //get the current answers existing in the node
    const answers = this.selectedNode.data.answers;
    const answerId = answers.length > 0 ? answers.length : 0;

    //add a new answer
    answers.push({
      id: answerId,
      text: "",
      targetPageId: "undefined",
      isCorrect: null,
    });

    //update the nodes data, specifically the new answer in the array
    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: "Quiz Branch",
      question: this.selectedNode.data.question,
      answers: answers,
    });

    const event = new CustomEvent("outputCreated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  /*
  

  */
  private _removeAnswerFromQuizBranchNode(answer: Answer) {
    const answers = this.selectedNode.data.answers;

    //Find the index of the answer in the answer array
    const index = answers.findIndex(
      (answer_in_array) => answer_in_array.id == answer.id
    );

    //Use Index to split and merge answers array at given index
    if (index != -1) {
      answers.splice(index, 1);
    }

    //Use the index of the answers array to remove the corresponding output
    const output_class = Object.keys(this.selectedNode.outputs)[index];
    this.editor.removeNodeOutput(this.selectedNode.id, output_class);

    //Update the quiz branch node with the new answers array
    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answers,
    });

    const event = new CustomEvent("outputDeleted", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(event);
  }

  /*


  */
  private _handleUserInputQuestion(event) {
    const currentData = this.selectedNode.data;
    const updatedData = {
      ...currentData,
      question: event.target.value,
    };
    this.editor.updateNodeDataFromId(this.selectedNode.id, updatedData);

    const dispatchEvent = new CustomEvent("nodeDataUpdated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(dispatchEvent);
  }

  /*


  */
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

    const dispatchEvent = new CustomEvent("nodeDataUpdated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(dispatchEvent);
  }

  /*


  */
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

    const dispatchEvent = new CustomEvent("nodeDataUpdated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(dispatchEvent);
  }

  /*


  */
  private _handleUserInputTargetPage(event) {
    //TODO: sl-select does not reflect the selection
    //TODO: if a connection is already exisiting, inputs and outputs should be updated and further connections should be deleted and newly added
    //get the id of the answer from the sl-select
    //TODO: somehow i have to update this here although i update at every other call
    //TODO: Updates inside dont update the rerender and get overriden from webwriter branching scenario i believe. maybe i should react to the events from the outside through the custom events
    //rewrite outside such that it uses display block instead of conditional shadow tree updates.

    const answerId = event.target.getAttribute("answerId");
    const answerArray = this.selectedNode.data.answers;

    //find the index of the answer in the answers array and update its target page
    const index = answerArray.findIndex((answer) => answer.id == answerId);

    if (index !== -1) {
      answerArray[index].targetPageId = String(event.target.value);
    }

    //update the quiz branch nodes data
    this.editor.updateNodeDataFromId(this.selectedNode.id, {
      title: this.selectedNode.data.title,
      question: this.selectedNode.data.question,
      answers: answerArray,
    });

    //create a connection between the quizbranchnode and the selected target page id
    this.editor.addNodeInput(event.target.value);
    const inputNode = this.editor.getNodeFromId(event.target.value);
    const inputIndex = Object.keys(inputNode.inputs).length - 1;
    const input_class = Object.keys(inputNode.inputs)[inputIndex];

    const output_class = Object.keys(this.selectedNode.outputs)[index];

    this.editor.addConnection(
      this.selectedNode.id,
      event.target.value,
      output_class,
      input_class
    );

    const dispatchEvent = new CustomEvent("nodeDataUpdated", {
      detail: { nodeId: this.selectedNode.id },
      bubbles: true, // Allows the event to bubble up through the DOM
      composed: true, // Allows the event to pass through shadow DOM boundaries
    });
    this.dispatchEvent(dispatchEvent);
  }
}

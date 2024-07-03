import { html, css, LitElement, unsafeCSS } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { Gamebook, Page, Answer } from "./model";

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

//Tabler Icon Import
import plus from "@tabler/icons/outline/plus.svg";
import file from "@tabler/icons/outline/file.svg";
import minus from "@tabler/icons/outline/minus.svg";
import helpSquareRounded from "@tabler/icons/outline/help-square-rounded.svg";

//CSS
import styles from "../css/quiz-branch-node-details-css";

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
          <sl-icon src=${helpSquareRounded}></sl-icon>
        </div>
        <div class="div-title">
          <p class="title">${this.selectedNode.data.title}</p>
          <p class="subtitle">Gamebook Quiz</p>
        </div>

        <div class="last-item">
          <div class="control-node">
            <div class="horizontal">
              <p class="subtitle">
                Inputs
                (${Object.keys(this.selectedNode.inputs).length.toString()})
              </p>
              <sl-icon-button
                class="last-item"
                src=${plus}
                @click=${this._addInputToSelectedNode}
              ></sl-icon-button>
            </div>
            <div class="horizontalStack">
              ${Object.entries(this.selectedNode.inputs).map(
                ([input_class, drawflowConnection], index) => html` <div
                  class="horizontal"
                >
                  <p>${index + 1}</p>
                  <p
                    style="${drawflowConnection.connections.length > 0
                      ? "color: black;"
                      : "color: lightgray;"}"
                  >
                    ${drawflowConnection.connections.length > 0
                      ? this.editor.getNodeFromId(
                          drawflowConnection.connections[0].node
                        ).data.title
                      : "No connection"}
                  </p>
                  <sl-icon-button
                    src=${minus}
                    @click=${() => this._deleteInputOfSelectedNode(input_class)}
                  >
                  </sl-icon-button>
                </div>`
              )}
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
          <sl-icon slot="prefix" src=${plus}></sl-icon>
          Add Answer
        </sl-button>
      </div>

      <div class="answersContainer">
        ${this.selectedNode.data.answers.map(
          (answer, index) =>
            html`
              <div class="answer">
                <sl-textarea
                  resize="none"
                  placeholder="Answer"
                  answerId="${answer.id}"
                  @input="${this._handleUserInputAnswer}"
                  .value="${answer.text}"
                ></sl-textarea>
                <sl-select
                  class="nodeSelect"
                  answerId="${answer.id}"
                  placeholder="Select Page"
                  clearable
                  @sl-input=${this._handleUserInputTargetPage}
                  .value="${Object.entries(this.selectedNode.outputs)[index][1]
                    ?.connections[0]?.node ?? "undefined"}"
                >
                  ${Object.keys(this.nodesInEditor)
                    .filter(
                      (key) =>
                        this.nodesInEditor[key].id !== this.selectedNode.id
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
                  src=${minus}
                  @click=${() => this._removeAnswerFromQuizBranchNode(answer)}
                ></sl-icon-button>
              </div>
            `
        )}
      </div>
      <slot></slot>
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
      targetPageInputClass: "undefined",
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
    if (index != -1) {
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
    //TODO: if a connection is already exisiting, inputs and outputs should be updated and further connections should be deleted and newly added
    const answerId = event.target.getAttribute("answerId");
    const answerArray = this.selectedNode.data.answers;
    const index = answerArray.findIndex((answer) => answer.id == answerId);

    if (index != -1) {
      //set initial selection
      if (
        Object.entries(this.selectedNode.outputs)[index][1]?.connections[0]
          ?.node == undefined &&
        event.target.value != ""
      ) {
        //create a connection between the quizbranchnode and the selected target page id
        this.editor.addNodeInput(event.target.value);
        const inputNode = this.editor.getNodeFromId(event.target.value);
        const inputIndex = Object.keys(inputNode.inputs).length - 1;
        const input_class = Object.keys(inputNode.inputs)[inputIndex];

        //   //get the right output using the answers index which corresponds to the output index
        const output_class = Object.keys(this.selectedNode.outputs)[index];

        this.editor.addConnection(
          this.selectedNode.id,
          event.target.value,
          output_class,
          input_class
        );
      }
      //change existing selection
      else if (
        Object.entries(this.selectedNode.outputs)[index][1]?.connections[0]
          ?.node != undefined &&
        event.target.value != ""
      ) {
        const old_input_class = Object.entries(this.selectedNode.outputs)[
          index
        ][1].connections[0].output;

        //get the right output using the answers index which corresponds to the output index
        const output_class = Object.keys(this.selectedNode.outputs)[index];

        this.editor.removeSingleConnection(
          this.selectedNode.id,
          Object.entries(this.selectedNode.outputs)[index][1]?.connections[0]
            ?.node,
          output_class,
          old_input_class
        );

        this.editor.addNodeInput(event.target.value);
        const inputNode = this.editor.getNodeFromId(event.target.value);
        const inputIndex = Object.keys(inputNode.inputs).length - 1;
        const new_input_class = Object.keys(inputNode.inputs)[inputIndex];

        this.editor.addConnection(
          this.selectedNode.id,
          event.target.value,
          output_class,
          new_input_class
        );
      }
      //clear sl-select
      else if (event.target.value == "") {
        const current_input_class = Object.entries(this.selectedNode.outputs)[
          index
        ][1].connections[0].output;

        //get the right output using the answers index which corresponds to the output index
        const output_class = Object.keys(this.selectedNode.outputs)[index];

        this.editor.removeSingleConnection(
          this.selectedNode.id,
          Object.entries(this.selectedNode.outputs)[index][1]?.connections[0]
            ?.node,
          output_class,
          current_input_class
        );
      }
    }
  }
}

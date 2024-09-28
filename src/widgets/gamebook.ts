import { html, css, LitElement, unsafeCSS } from "lit";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { LitElementWw } from "@webwriter/lit";
import {
  customElement,
  property,
  query,
  queryAll,
  state,
  queryAssignedElements,
} from "lit/decorators.js";

//Shoelace Imports
import "@shoelace-style/shoelace/dist/themes/light.css";
import {
  SlOption,
  SlSelect,
  SlButton,
  SlTextarea,
  SlDivider,
  SlDropdown,
  SlMenu,
  SlMenuItem,
  SlIconButton,
} from "@shoelace-style/shoelace";

//Import Styles
import styles from "../css/gamebook-preview-css";

import { WebWriterConnectionButton } from "./gamebook-components/webwriter-connection-button";
import { WebWriterGamebookPageContainer } from "./gamebook-components/webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./gamebook-components/webwriter-gamebook-popup-container";
import { WebWriterGamebookBranchContainer } from "./gamebook-components/webwriter-gamebook-branch-container";
import { WebWriterSmartBranchButton } from "./gamebook-components/webwriter-smart-branch-button";

@customElement("webwriter-gamebook")
export class WebWriterGamebook extends LitElementWw {
  //registering custom elements used in the widget
  static get scopedElements() {
    return {
      "sl-button": SlButton,
      "sl-textarea": SlTextarea,
      "sl-divider": SlDivider,
      "sl-icon-button": SlIconButton,
      "sl-dropdown": SlDropdown,
      "sl-menu": SlMenu,
      "sl-menu-item": SlMenuItem,
      "sl-select": SlSelect,
      "sl-option": SlOption,
      "webwriter-connection-button": WebWriterConnectionButton,
    };
  }

  //import CSS
  static styles = [styles];

  @state() accessor currentContainerId: Number;
  @property({ type: String }) accessor gamebookTitle;
  @property({ type: String }) accessor pageTitle;
  @property({ type: Number }) accessor startPage;

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, webwriter-gamebook-branch-container",
  })
  accessor gamebookContainers;

  /*


  */
  protected firstUpdated(_changedProperties: any): void {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => this._handleSlotChange());
    }

    this.addEventListener("submit", this._handleSubmit.bind(this));
  }

  /*


   */
  _handleSlotChange() {
    this.currentContainerId = this._resetGamebookToOrigin();
    this._initializeButtons(this.currentContainerId);
    //console.log("setting this", this.currentContainerId);
  }

  /*

  TODO: Handle Reset of Quiz and Tasks
   */
  private _handleSubmit(event: Event) {
    event.preventDefault(); // Prevent the default form submission
    // console.log(event);

    const currentContainer = this.gamebookContainers.find((container) => {
      return container.drawflowNodeId === this.currentContainerId;
    });

    const containersSlot = currentContainer.shadowRoot.querySelector("slot");
    const assignedElements = containersSlot.assignedElements();

    const smartBranchButtons = assignedElements.find((element) => {
      return element instanceof WebWriterSmartBranchButton;
    });

    smartBranchButtons.forEach((smartBranchButton) => {
      const branchContainer = this.gamebookContainers.find((container) => {
        return container.drawflowNodeId === smartBranchButton.dataTargetId;
      });

      let submitElements = smartBranchButton.submitElements;

      let submitterIndex = -1;

      if (
        (event.target as HTMLElement).parentElement.tagName.toLowerCase() ==
        "webwriter-quiz"
      ) {
        submitterIndex = submitElements.indexOf(
          (event.target as HTMLElement).parentElement.id
        );
      }
      //
      else {
        submitterIndex = submitElements.indexOf(
          (event.target as HTMLElement).id
        );
      }

      if (submitterIndex !== -1) {
        smartBranchButton.elementSubmitted[submitterIndex] = true;
      }

      //everything that needs to be submitted was submitted && at least one rule is satisfied
      if (
        smartBranchButton.elementSubmitted.every(
          (element) => element === true
        ) &&
        this._getTargetFromRules(branchContainer) !== undefined
      ) {
        smartBranchButton.disabled = false;
      }
    });

    //console.log(submitElements, smartBranchButton.elementSubmitted);
    this.requestUpdate();
  }

  /*


  */
  render() {
    return html`
      <div class="gamebook">
        <div class="gamebookTitle">${this.gamebookTitle}</div>
        <div class="pageTitle">${this.pageTitle}</div>
        <div class="page">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /*

  */
  private _navigateTo(targetId: number) {
    //
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == targetId) {
        if (container instanceof WebWriterGamebookPageContainer) {
          this._navigateToPage(targetId);
          this._initializeButtons(targetId);
        }
        //
        else if (container instanceof WebWriterGamebookPopupContainer) {
          this._showPopupContainerDialog(targetId);
          this._initializeButtons(targetId);
        }

        //
        else if (container instanceof WebWriterGamebookBranchContainer) {
          const nextId = this._getTargetFromRules(container);
          //console.log(nextId);
          this._navigateTo(Number(nextId));
        }
      }
    });
  }

  /*


  */
  private _navigateToPage(pageId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == pageId) {
        container.show();
        this.pageTitle = container.pageTitle;
      } else {
        if (container instanceof WebWriterGamebookPopupContainer) {
          container.hideDialog();
        }
        //
        else {
          container.hide();
        }
      }
    });

    this.currentContainerId = pageId;
  }

  /*


  */
  private _showPopupContainerDialog(popupId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == popupId) {
        (container as WebWriterGamebookPopupContainer).showDialog();
        const previousContainerId = this.currentContainerId;

        container.addEventListener("sl-request-close", (event) => {
          this._initializeButtons(previousContainerId);
          this.currentContainerId = previousContainerId;
        });
      }
      //
      else if (container.drawflowNodeId != popupId) {
        if (container instanceof WebWriterGamebookPopupContainer) {
          container.hideDialog();
          container.hide();
        }
      }
    });

    this.currentContainerId = popupId;
  }

  /*


  */
  private _getTargetFromRules(
    branchContainer: WebWriterGamebookBranchContainer
  ): Number {
    const currentContainer = this.gamebookContainers.find((container) => {
      return container.drawflowNodeId === this.currentContainerId;
    });

    if (currentContainer) {
      const containersSlot = currentContainer.shadowRoot.querySelector("slot");
      const assignedElements = containersSlot.assignedElements();

      for (const rule of branchContainer.rules) {
        if (rule.target !== "") {
          //console.log(rule);

          //Case: Element Id

          const element = assignedElements.find((element) => {
            return element.id === rule.elementId;
          });

          const smartBranchButton = assignedElements.find((element) => {
            return element instanceof WebWriterSmartBranchButton;
          });

          let submitElements = smartBranchButton.submitElements;

          if (element) {
            //Case: Quiz on Page
            if (element.tagName.toLowerCase() == "webwriter-quiz") {
              //this is specific to quiz:
              const submitterIndex = submitElements.indexOf(element.id);

              if (smartBranchButton.elementSubmitted[submitterIndex] == true) {
                const quiz = element;

                let relevantTasks = quiz.querySelectorAll("webwriter-task");

                relevantTasks = [...relevantTasks].filter((element) => {
                  if (element.tagName.toLowerCase() == "webwriter-task") {
                    if (rule.quizTasks.includes(element.id)) {
                      return element;
                    }
                  }
                });

                let amountFalseTasks = 0;

                relevantTasks.forEach((task) => {
                  //Task is Choice
                  if (task.answer.tagName.toLowerCase() == "webwriter-choice") {
                    const children = task.answer.children;

                    //iterate through choice items
                    const taskHasWrongChoiceItem = [...children].some(
                      (element) => {
                        if (element.active != element.valid) {
                          return true;
                        }
                      }
                    );

                    if (taskHasWrongChoiceItem) {
                      //console.log(task, "is false");
                      amountFalseTasks++;
                    }
                  }
                  //
                  else if (
                    task.answer.tagName.toLowerCase() == "webwriter-order"
                  ) {
                    const children = task.answer.children;

                    //iterate through choice items
                    const taskHasWrongOrder = [...children].some((element) => {
                      if (element.validOrder != element.elementIndex) {
                        return true;
                      }
                    });

                    if (taskHasWrongOrder) {
                      //console.log(task, "is false");
                      amountFalseTasks++;
                    }
                  }
                  //
                  else if (
                    task.answer.tagName.toLowerCase() == "webwriter-text"
                  ) {
                    if (task.answer.solution !== task.answer.value) {
                      amountFalseTasks++;
                    }
                  }
                  //
                  else if (
                    task.answer.tagName.toLowerCase() == "webwriter-mark"
                  ) {
                    let userHighlightMatches = false;

                    for (const solution_highlight of task.answer.solution) {
                      userHighlightMatches = task.answer.value.some(
                        (user_highlight) => {
                          if (
                            solution_highlight.startOffset ==
                              user_highlight.startOffset &&
                            solution_highlight.endOffset ==
                              user_highlight.endOffset
                          ) {
                            return true;
                          }
                        }
                      );

                      if (!userHighlightMatches) {
                        amountFalseTasks++;
                        break;
                      }
                    }
                  }
                });

                let percentageCorrect =
                  (relevantTasks.length - amountFalseTasks) /
                  relevantTasks.length;

                let match = Number(rule.match) / 100;

                //console.log("correct", percentageCorrect);

                if (rule.condition.toLowerCase() == "correct") {
                  if (percentageCorrect >= match) {
                    return Number(rule.target);
                  }
                }
                //not contains
                else if (rule.condition.toLowerCase() == "uncorrect") {
                  if (1 - percentageCorrect >= match) {
                    return Number(rule.target);
                  }
                }
              }
            }
            //
            else if (element.tagName.toLowerCase() == "webwriter-task") {
              if (element.answer.tagName.toLowerCase() == "webwriter-choice") {
                const children = element.answer.children;

                //iterate through choice items
                const choiceIsWrong = [...children].some((element) => {
                  if (element.active != element.valid) {
                    return true;
                  }
                });

                if (
                  rule.condition.toLowerCase() == "correct" &&
                  !choiceIsWrong
                ) {
                  return Number(rule.target);
                }
                //
                else if (
                  rule.condition.toLowerCase() == "uncorrect" &&
                  choiceIsWrong
                ) {
                  return Number(rule.target);
                }
              }
              //
              else if (
                element.answer.tagName.toLowerCase() == "webwriter-order"
              ) {
                const children = element.answer.children;

                //iterate through choice items
                const orderIsWrong = [...children].some((element) => {
                  if (element.validOrder != element.elementIndex) {
                    return true;
                  }
                });

                if (
                  rule.condition.toLowerCase() == "correct" &&
                  !orderIsWrong
                ) {
                  return Number(rule.target);
                }
                //
                else if (
                  rule.condition.toLowerCase() == "uncorrect" &&
                  orderIsWrong
                ) {
                  return Number(rule.target);
                }
              }
              //
              else if (
                element.answer.tagName.toLowerCase() == "webwriter-text"
              ) {
                const textIsWrong =
                  element.answer.solution !== element.answer.value;

                if (rule.condition.toLowerCase() == "correct" && !textIsWrong) {
                  return Number(rule.target);
                }
                //
                else if (
                  rule.condition.toLowerCase() == "uncorrect" &&
                  textIsWrong
                ) {
                  return Number(rule.target);
                }
              }
              //
              else if (
                element.answer.tagName.toLowerCase() == "webwriter-mark"
              ) {
                let userHighlightMatches = false;

                for (const solution_highlight of element.answer.solution) {
                  userHighlightMatches = element.answer.value.some(
                    (user_highlight) => {
                      if (
                        solution_highlight.startOffset ==
                          user_highlight.startOffset &&
                        solution_highlight.endOffset == user_highlight.endOffset
                      ) {
                        return true;
                      }
                    }
                  );

                  if (
                    rule.condition.toLowerCase() == "uncorrect" &&
                    !userHighlightMatches
                  ) {
                    return Number(rule.target);
                  }
                }

                if (
                  rule.condition.toLowerCase() == "correct" &&
                  userHighlightMatches
                ) {
                  return Number(rule.target);
                }
                //
              }
            }
          }
        }
      }
    }

    //Case: No rule was satisfied
    //console.log(branchContainer.elseRule.target);
    return Number(branchContainer.elseRule.target);
  }

  /*


  */
  private _resetGamebookToOrigin() {
    const originPageContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("originPage") == 1
    );

    // console.log(originPageContainer);

    this.pageTitle = originPageContainer.pageTitle;

    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == originPageContainer.drawflowNodeId) {
        container.show();
      } else {
        container.hide();
      }
    });

    return originPageContainer.drawflowNodeId;
  }

  /*


  */
  private _initializeButtons(containerId: Number) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //initialise the elements on the origin page
    container.buttons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("dataTargetId"), 10);
      button.addEventListener("click", () => this._navigateTo(targetId));

      if (button instanceof WebWriterSmartBranchButton) {
        //In case the button already has an existing submitElements and elementSubmitted (navigated back to a page from a popup)
        if (
          button.submitElements.length === 0 &&
          button.elementSubmitted.length === 0
        ) {
          let submitElements = [];
          let elementSubmitted = [];
          const containersSlot = container.shadowRoot.querySelector("slot");
          const assignedElements = containersSlot.assignedElements();

          const branchContainer = this.gamebookContainers.find((container) => {
            return container.drawflowNodeId === targetId;
          });

          branchContainer.rules.forEach((rule) => {
            const element = assignedElements.find((element) => {
              return element.id === rule.elementId;
            });

            if (!submitElements.includes(element.id)) {
              if (
                element.tagName.toLowerCase() == "webwriter-quiz" ||
                element.tagName.toLowerCase() == "webwriter-task"
              ) {
                //console.log("element added", element);
                submitElements = [...submitElements, element.id];
                elementSubmitted = [...elementSubmitted, false];
              }
            }
          });

          button.submitElements = submitElements;
          button.elementSubmitted = elementSubmitted;
          if (submitElements.length !== 0) {
            button.disabled = true;
          }
        }
      }
    });

    this.requestUpdate();

    //TODO: make fields required, include header in sl-select for children element that they belong to certian page
    //TODO: include hint: no elements found
  }
}

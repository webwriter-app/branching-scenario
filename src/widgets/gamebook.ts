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


   */
  private _handleSubmit(event: Event) {
    event.preventDefault(); // Prevent the default form submission
    // console.log(event);

    const currentContainer = this.gamebookContainers.find((container) => {
      return container.drawflowNodeId === this.currentContainerId;
    });

    const containersSlot = currentContainer.shadowRoot.querySelector("slot");
    const assignedElements = containersSlot.assignedElements();

    const smartBranchButton = assignedElements.find((element) => {
      return element instanceof WebWriterSmartBranchButton;
    });

    const branchContainer = this.gamebookContainers.find((container) => {
      return container.drawflowNodeId === smartBranchButton.dataTargetId;
    });

    //TODO: make compatible for multiple smartBranchButtons

    let submitElements = smartBranchButton.submitElements;

    //this is specific to quiz:
    const submitterIndex = submitElements.indexOf(
      (event.target as HTMLElement).parentElement.id
    );

    if (submitterIndex !== -1) {
      smartBranchButton.elementSubmitted[submitterIndex] = true;
    }

    //everything that needs to be submitted was submitted && at least one rule is satisfied
    if (
      smartBranchButton.elementSubmitted.every((element) => element === true) &&
      this._getTargetFromRules(branchContainer) !== undefined
    ) {
      smartBranchButton.disabled = false;
    }

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
    //TODO: Introduction of closeable popups needs to listen to dismissed popups
    //TODO: set currentPageContainer back to underlying page then
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
        //console.log(rule);
        //Case: Text on Page
        if (rule.elementId.toLowerCase() == "text") {
          // Filter only paragraph elements
          const paragraphElements = assignedElements.filter(
            (el) => el.tagName.toLowerCase() === "p"
          );

          let contains = false;

          // Iterate through the filtered paragraph elements
          paragraphElements.forEach((paragraph) => {
            if (paragraph.textContent?.includes(rule.match)) {
              contains = true;
            }
          });

          console.log("text", contains);

          //contains
          if (contains && rule.condition.toLowerCase() == "contains") {
            return Number(rule.target);
          }
          //not contains
          else if (
            !contains &&
            rule.condition.toLowerCase() == "not_contains"
          ) {
            return Number(rule.target);
          }
        }
        //Case: Element Id
        else {
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
                  //TODO: other kinds of tasks need to be respected
                });

                let percentageCorrect =
                  (relevantTasks.length - amountFalseTasks) /
                  relevantTasks.length;

                let match = Number(rule.match) / 100;

                console.log("correct", percentageCorrect);

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
          }
        }

        //TODO: let every node spwan with 1 output, and smart branching with 2 and 2 rules
        //TODO: make match optional
      }
    }

    console.log("No rule satisfied");
    return undefined;
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
            if (element.tagName.toLowerCase() == "webwriter-quiz") {
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
    });

    this.requestUpdate();

    //TODO: smart branch button disabled
    //TODO: make fields required, include header in sl-select for children element that they belong to certian page
  }
}

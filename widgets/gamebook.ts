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

import { WebWriterConnectionButton } from "./webwriter-connection-button";
import { QuizContainer } from "./quiz-container";
import { WebWriterGamebookPageContainer } from "./webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./webwriter-gamebook-popup-container";

//Define Component
//TODO: Fix Gamebook Errors. Check other modules for proper updating. I commented out a lot for restructure!
//TODO: employ structure such that users cannot simply change css in browser to see next slide
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

  @state() currentPageId?: Number;

  @property({ type: String }) gamebookTitle;
  @property({ type: String }) pageTitle;

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, quiz-container",
  })
  gamebookContainers;

  /*


   */
  protected firstUpdated(_changedProperties: any): void {
    const slot = this.shadowRoot.querySelector("slot");
    if (slot) {
      slot.addEventListener("slotchange", () => this._handleSlotChange());
    }
  }

  /*


   */
  _handleSlotChange() {
    this.currentPageId = this._resetGamebookToOrigin();
    this._initializeConnectionButtons(this.currentPageId);
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
  //TODO: this seems to be laggy. consider saving the pagecontainer content directly into gamebook structure or drawflownode structure.
  //This would also fix the editability issue. However, I would then need to rebuild the webwriter preview view as well
  */
  private _navigateTo(targetId: number) {
    //
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == targetId) {
        if (container instanceof WebWriterGamebookPageContainer) {
          this._navigateToPage(targetId);
          this._initializeConnectionButtons(targetId);
        }
        //
        else if (container instanceof WebWriterGamebookPopupContainer) {
          this._showPopupContainerDialog(targetId);
          this._initializeConnectionButtons(targetId);
        }
        //
        else if (container instanceof QuizContainer) {
          this._showQuizBranchDialog(targetId);
          this._initializeQuizButtons(targetId);
        }
        // Add more conditions as needed
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

    this.currentPageId = pageId;
  }

  /*


  */
  private _showPopupContainerDialog(containerId: number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == containerId) {
        (container as WebWriterGamebookPopupContainer).showDialog();
      } else if (container.drawflowNodeId != containerId) {
        if (container instanceof WebWriterGamebookPopupContainer) {
          container.hideDialog();
          container.hide();
        }
      }
    });
  }

  /*


  */
  private _showQuizBranchDialog(quizId: number) {
    this.gamebookContainers.forEach((quiz) => {
      if (quiz.drawflowNodeId == quizId) {
        (quiz as QuizContainer).show();
      }
    });
  }

  /*


  */
  private _resetGamebookToOrigin() {
    const originPageContainer = this.gamebookContainers.find(
      (container) => container.getAttribute("originPage") == 1
    );

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
  private _initializeConnectionButtons(containerId: Number) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //initialise the elements on the origin page
    container.connectionButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("dataTargetId"), 10);
      button.addEventListener("click", () => this._navigateTo(targetId));
    });
  }

  /*


  */
  private _initializeQuizButtons(containerId: Number) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == containerId
    );

    //initialise the elements on the origin page
    container.answerButtons.forEach((button) => {
      const targetId = parseInt(button.getAttribute("pageTargetId"), 10);
      button.addEventListener("click", () => this._navigateTo(targetId));
    });
  }
}

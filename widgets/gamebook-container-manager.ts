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

//Drawflow Imports
import Drawflow, { DrawflowConnection, DrawflowNode } from "drawflow";
import { WebWriterGamebookPageContainer } from "./webwriter-gamebook-page-container";
import { WebWriterGamebookPopupContainer } from "./webwriter-gamebook-popup-container";
import { QuizContainer } from "./quiz-container";

@customElement("gamebook-container-manager")
export class GamebookContainerManager extends LitElementWw {
  //
  @property({ attribute: false }) appendToShadowDom = (
    element: HTMLElement
  ) => {};

  @queryAssignedElements({
    flatten: true,
    selector:
      "webwriter-gamebook-page-container, webwriter-gamebook-popup-container, quiz-container",
  })
  gamebookContainers;

  static get scopedElements() {
    return {
      "webwriter-gamebook-page-container": WebWriterGamebookPageContainer,
      "webwriter-gamebook-popup-container": WebWriterGamebookPopupContainer,
      "quiz-container": QuizContainer,
    };
  }

  protected firstUpdated(_changedProperties: any): void {
    //console.log("container manager update");
  }

  handleSlotChange() {
    //console.log("slot change");
  }

  render() {
    return html` <slot @slotchange=${this.handleSlotChange}></slot> `;
  }

  /* 
  
  
  */
  public _deleteGamebookContainersById(drawflowNodeId: Number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == drawflowNodeId) {
        container.remove();
      }
    });
  }

  /* 
  
  
  */
  public _deleteAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.remove();
    });
  }

  /*


  */
  public _getContainerByDrawflowNodeId(id: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    return container;
  }

  /*

  */
  public _renameContainer(id: string, title: string) {
    const container = this.gamebookContainers.find(
      (container) => container.getAttribute("drawflowNodeId") == id
    );

    (container as WebWriterGamebookPageContainer).pageTitle = title;
  }

  /*


  */
  public _showGamebookContainerById(nodeId: Number) {
    //console.log("iteration");
    this.gamebookContainers.forEach((container) => {
      //console.log("iteration");
      if (container.drawflowNodeId == nodeId) {
        //console.log("enter");
        container.show();
        //console.log(container);
      } else {
        container.hide();
      }
    });
  }

  /*


  */
  public _hideAllGamebookContainers() {
    this.gamebookContainers.forEach((container) => {
      container.hide();
    });
  }

  /*
  TODO: Figure out how to put this into a constructor
  Also remove the node data adding 
  */
  public _createPageContainerFromPageNode(pageNode: DrawflowNode) {
    //console.log(this.gamebookContainers);
    const pageContainer = document.createElement(
      "webwriter-gamebook-page-container"
    ) as WebWriterGamebookPageContainer;
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

    //
    this.appendToShadowDom(pageContainer);
  }

  /*


  */
  public _createPopupContainerFromPopupNode(popupNode: DrawflowNode) {
    //console.log(this.gamebookContainers);
    const popupContainer = document.createElement(
      "webwriter-gamebook-popup-container"
    ) as WebWriterGamebookPageContainer;
    popupContainer.setAttribute("drawflowNodeId", popupNode.id.toString());
    popupContainer.setAttribute("pageTitle", popupNode.data.title);

    const parser = new DOMParser();
    const contentFromNode = parser.parseFromString(
      popupNode.data.content,
      "text/html"
    );

    // Loop through the child nodes of the body of the parsed document
    contentFromNode.body.childNodes.forEach((node) => {
      popupContainer.appendChild(node);
    });

    //to let it access editor
    popupContainer.hide();

    //
    this.appendToShadowDom(popupContainer);
  }

  /* 
  
  
  */
  public _createQuestionContainerFromQuestionNode(questionNode: DrawflowNode) {
    const quizContainer = document.createElement(
      "quiz-container"
    ) as QuizContainer;
    quizContainer.setAttribute("drawflowNodeId", questionNode.id.toString());
    quizContainer.style.position = "unset";

    quizContainer.setAttribute("quiz", JSON.stringify(questionNode.data));

    //to let it access editor
    quizContainer.hide();
    this.appendToShadowDom(quizContainer);
  }
}

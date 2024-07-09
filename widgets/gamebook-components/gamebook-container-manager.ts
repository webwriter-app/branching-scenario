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
import { PageContainer } from "../gamebook-components/page-container";
import { QuizContainer } from "../gamebook-components/quiz-container";

@customElement("gamebook-container-manager")
export class GamebookContainerManager extends LitElementWw {
  //
  @property({ type: Function }) appendToShadowDom = (
    element: HTMLElement
  ) => {};

  @property({ type: Object, attribute: true })
  gamebookContainers = [];

  static get scopedElements() {
    return {
      "page-container": PageContainer,
      "quiz-container": QuizContainer,
    };
  }

  protected firstUpdated(_changedProperties: any): void {
    // console.log("test");
    // console.log(this.gamebookContainers);
  }

  render() {
    return html` <slot></slot> `;
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
  public _showGamebookContainerById(nodeId: Number) {
    this.gamebookContainers.forEach((container) => {
      if (container.drawflowNodeId == nodeId) {
        container.show();
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
    console.log(this.gamebookContainers);
    const pageContainer = document.createElement(
      "page-container"
    ) as PageContainer;
    pageContainer.setAttribute("drawflowNodeId", pageNode.id.toString());

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
    //this.appendChild(pageContainer);
    this.appendToShadowDom(pageContainer);

    // console.log(this.childNodes);
    // console.log(this);
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
    //this.appendChild(quizContainer);
    this.appendToShadowDom(quizContainer);
  }
}

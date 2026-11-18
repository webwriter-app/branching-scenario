import { html, nothing } from "lit";
import { LitElementWw } from "@webwriter/lit";
import { property, query, state } from "lit/decorators.js";
import SlAlert from "@shoelace-style/shoelace/dist/components/alert/alert.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";
import alertOctagon from "@tabler/icons/outline/alert-octagon.svg";
import styles from "./webwriter-gamebook-viewer.styles";
import type { WebwriterBranchingScenario } from "../widgets/webwriter-branching-scenario";
import type { WebwriterGamebookPage } from "../widgets/webwriter-gamebook-page";
import type { WebwriterGamebookPopup } from "../widgets/webwriter-gamebook-popup";
import type { WebwriterGamebookBranch } from "../widgets/webwriter-gamebook-branch";
import type { WebwriterGamebookBranchButton } from "../widgets/webwriter-gamebook-branch-button";
import { isBranch, isPage, isPopup, type GamebookContainerElement } from "./gamebook-container";
import type { WebwriterGamebookButton } from "../widgets/webwriter-gamebook-button";

const containerSelector = "webwriter-gamebook-page, webwriter-gamebook-popup, webwriter-gamebook-branch";
const buttonSelector = "webwriter-gamebook-button, webwriter-gamebook-branch-button";

type Container = GamebookContainerElement;
type Choice = WebwriterGamebookButton | WebwriterGamebookBranchButton;

/** The parts of the quiz widget's elements that branching rules read. */
interface ChoiceItem extends HTMLElement { active: boolean; valid: boolean }
interface OrderItem extends HTMLElement { validOrder: number; elementIndex: number }
interface Highlight { startOffset: number; endOffset: number }
interface QuizAnswer extends HTMLElement { solution: string | Highlight[]; value: string | Highlight[] }
interface QuizTask extends HTMLElement { answer: QuizAnswer }

function isBranchButton(button: Choice): button is WebwriterGamebookBranchButton {
  return button.localName === "webwriter-gamebook-branch-button";
}

export class WebWriterGamebookViewer extends LitElementWw {
  static scopedElements = { "sl-alert": SlAlert, "sl-icon": SlIcon };
  static styles = [styles];

  @property({ type: String }) accessor gamebookTitle: string;
  @state() private accessor page: WebwriterGamebookPage | undefined;
  @state() private accessor popup: WebwriterGamebookPopup | undefined;
  @state() private accessor error: WebwriterGamebookBranch | undefined;

  @query(".page") private accessor pageViewer: HTMLElement;
  @property({ attribute: false }) accessor scenario: WebwriterBranchingScenario;

  private get gamebookContainers(): Container[] {
    return Array.from(this.scenario.children).filter(
      (element): element is Container => element.matches(containerSelector)
    );
  }

  private get currentContainer() {
    return this.popup ?? this.page;
  }

  protected updated() {
    if (!this.isConnected) return;
    const page = this.page;
    const ended = !!page && !this.popup && !page.querySelector(`:scope > ${buttonSelector}`);
    this.scenario?.setReaderState(page?.getAttribute("pagetitle") ?? "", ended);
  }

  disconnectedCallback() {
    this.scenario?.setReaderState("", false);
    this.closePopup();
    super.disconnectedCallback();
  }

  private readonly awaitingDefinition = new Set<string>();

  private syncContainers() {
    const containers = this.gamebookContainers;
    for (const container of containers) {
      if (container.matches(":defined") || this.awaitingDefinition.has(container.localName)) continue;
      const tag = container.localName;
      this.awaitingDefinition.add(tag);
      this.ownerDocument.defaultView?.customElements.whenDefined(tag).then(() => {
        this.awaitingDefinition.delete(tag);
        if (this.isConnected) this.syncContainers();
      });
    }
    if (this.popup && !containers.includes(this.popup)) this.closePopup();
    if (!this.page || !containers.includes(this.page)) {
      this.page = containers.find(
        (container): container is WebwriterGamebookPage =>
          isPage(container) && container.getAttribute("originpage") === "1"
      );
    }
    for (const container of containers) {
      if (container === this.page) container.show?.();
      else if (container !== this.popup) container.hide?.();
    }
    this.error = containers.find(
      (container): container is WebwriterGamebookBranch =>
        isBranch(container) && container.elseRule?.target === ""
    );
    this.syncBranchButtons();
  }

  private handleClick(event: MouseEvent) {
    const path = event.composedPath();
    const owner = path.find(node => node instanceof Element && node.matches(containerSelector));
    if (owner !== this.currentContainer) return;

    const button = path.find((node): node is Choice =>
      node instanceof HTMLElement && node.matches(buttonSelector)
    );
    if (!button || button.parentElement !== owner || !path.includes(button.button)) return;
    if (isBranchButton(button) && button.disabled) return;

    this.navigateTo(button.dataTargetId, isBranchButton(button) ? button : undefined);
  }

  private navigateTo(targetId: number, button?: WebwriterGamebookBranchButton) {
    const containers = this.gamebookContainers;
    let target = containers.find(container => container.drawflowNodeId === targetId);
    if (target && isBranch(target)) {
      const children = Array.from(this.currentContainer?.children ?? []);
      const visited = new Set<Container>();
      do {
        if (visited.has(target)) return;
        visited.add(target);
        const nextId = this.ruleTarget(target, children, button);
        target = containers.find(container => container.drawflowNodeId === nextId);
      } while (target && isBranch(target));
    }
    if (!target || target === this.popup || typeof target.show !== "function") return;

    this.closePopup();
    if (isPopup(target)) {
      this.popup = target;
      void target.showDialog();
    } else if (isPage(target)) {
      if (this.page !== target) this.page?.hide();
      this.page = target;
      target.show();
    }
    this.pageViewer.scrollTop = 0;
    this.syncBranchButtons();
  }

  private closePopup() {
    const popup = this.popup;
    if (!popup) return;
    this.popup = undefined;
    popup.hideDialog?.();
  }

  private handlePopupHide(event: Event) {
    if (!this.popup?.dialog || !event.composedPath().includes(this.popup.dialog)) return;
    this.popup = undefined;
    this.syncBranchButtons();
  }

  private syncBranchButtons(submitterId?: string) {
    const container = this.currentContainer;
    if (!container) return;

    const branchButtons = container.querySelectorAll<WebwriterGamebookBranchButton>(
      ":scope > webwriter-gamebook-branch-button"
    );
    if (!branchButtons.length) return;
    const children = Array.from(container.children);
    const containers = this.gamebookContainers;
    for (const button of branchButtons) {
      const branch = containers.find(node => node.drawflowNodeId === button.dataTargetId);
      const submitElements = new Set<string>();
      if (branch && isBranch(branch) && branch.rules) {
        for (const rule of branch.rules) {
          const element = children.find(child => child.id === rule.elementId);
          if (element?.matches("webwriter-quiz, webwriter-task")) submitElements.add(element.id);
        }
      }
      const previous = button.submitElements;
      if (!previous) continue;
      const pending = [...submitElements];
      if (previous.length !== pending.length || pending.some((id, i) => id !== previous[i])) {
        button.elementSubmitted = pending.map(id => button.elementSubmitted[previous.indexOf(id)] ?? false);
        button.submitElements = pending;
      }
      const submitted = submitterId === undefined ? -1 : pending.indexOf(submitterId);
      if (submitted !== -1) button.elementSubmitted[submitted] = true;
      button.disabled = !branch || !isBranch(branch) ||
        !button.elementSubmitted.every(Boolean) || this.ruleTarget(branch, children, button) === undefined;
    }
  }

  private handleSubmit(event: Event) {
    const target = event.composedPath().find(
      (node): node is HTMLElement => node instanceof HTMLElement && Boolean(node.closest(containerSelector))
    );
    if (!target || target.closest(containerSelector) !== this.currentContainer) return;

    const submitter = target.parentElement?.matches("webwriter-quiz")
      ? target.parentElement : target;
    event.preventDefault();
    this.syncBranchButtons(submitter.id);
  }

  render() {
    return html`
      <header class="titlebar">
        <p class="gamebookTitle" part="title">${this.gamebookTitle}</p>
        <p class="pageTitle" part="page-title">${this.page?.getAttribute("pagetitle")}</p>
      </header>
      <div class="surrounding">
        <div class="page" part="page" ?data-popup-open=${this.popup}
          @click=${this.handleClick} @submit=${this.handleSubmit} @sl-hide=${this.handlePopupHide}>
          <slot @slotchange=${this.syncContainers}></slot>
        </div>
      </div>
      ${this.error ? html`
        <div class="overlay">
          <sl-alert variant="danger" open>
            <sl-icon slot="icon" src=${alertOctagon} style="font-size: 28px"></sl-icon>
            <strong>Gamebook Error</strong><br />
            The branching rule set in node <em>${this.error.pageTitle}</em> is incomplete.
          </sl-alert>
        </div>
      ` : nothing}
    `;
  }

  private ruleTarget(
    branchContainer: WebwriterGamebookBranch,
    children: Element[],
    button?: WebwriterGamebookBranchButton
  ): number | undefined {
    for (const rule of branchContainer.rules ?? []) {
      if (rule.target !== "" && rule.target != null) {
        //Case: Element Id

        const element = children.find(element => element.id === rule.elementId) as HTMLElement | undefined;

        if (element) {
          //Case: Quiz on Page
          if (element.tagName.toLowerCase() == "webwriter-quiz") {
            //this is specific to quiz:
            const submitterIndex = button?.submitElements.indexOf(element.id) ?? -1;

            if (button?.elementSubmitted[submitterIndex] == true) {
              const relevantTasks = [...element.querySelectorAll<QuizTask>("webwriter-task")].filter(
                (task) => rule.quizTasks.includes(task.id)
              );

              let amountFalseTasks = 0;

              relevantTasks.forEach((task) => {
                //Task is Choice
                if (task.answer.tagName.toLowerCase() == "webwriter-choice") {
                  const children = [...task.answer.children] as ChoiceItem[];

                  //iterate through choice items
                  const taskHasWrongChoiceItem = children.some(
                    (element) => {
                      if (element.active != element.valid) {
                        return true;
                      }
                    }
                  );

                  if (taskHasWrongChoiceItem) {
                    amountFalseTasks++;
                  }
                }
                else if (
                  task.answer.tagName.toLowerCase() == "webwriter-order"
                ) {
                  const children = [...task.answer.children] as OrderItem[];

                  //iterate through choice items
                  const taskHasWrongOrder = children.some((element) => {
                    if (element.validOrder != element.elementIndex) {
                      return true;
                    }
                  });

                  if (taskHasWrongOrder) {
                    amountFalseTasks++;
                  }
                }
                else if (
                  task.answer.tagName.toLowerCase() == "webwriter-text"
                ) {
                  if (task.answer.solution !== task.answer.value) {
                    amountFalseTasks++;
                  }
                }
                else if (
                  task.answer.tagName.toLowerCase() == "webwriter-mark"
                ) {
                  let userHighlightMatches = false;

                  for (const solution_highlight of task.answer.solution as Highlight[]) {
                    userHighlightMatches = (task.answer.value as Highlight[]).some(
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

              if (rule.condition.toLowerCase() == "correct") {
                if (percentageCorrect >= match) {
                  return Number(rule.target);
                }
              }
              //not contains
              else if (rule.condition.toLowerCase() == "incorrect") {
                if (1 - percentageCorrect >= match) {
                  return Number(rule.target);
                }
              }
            }
          }
          else if (element.tagName.toLowerCase() == "webwriter-task") {
            const answer = (element as QuizTask).answer;
            if (answer.tagName.toLowerCase() == "webwriter-choice") {
              const children = [...answer.children] as ChoiceItem[];

              //iterate through choice items
              const choiceIsWrong = children.some((element) => {
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
              else if (
                rule.condition.toLowerCase() == "incorrect" &&
                choiceIsWrong
              ) {
                return Number(rule.target);
              }
            }
            else if (
              answer.tagName.toLowerCase() == "webwriter-order"
            ) {
              const children = [...answer.children] as OrderItem[];

              //iterate through choice items
              const orderIsWrong = children.some((element) => {
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
              else if (
                rule.condition.toLowerCase() == "incorrect" &&
                orderIsWrong
              ) {
                return Number(rule.target);
              }
            }
            else if (
              answer.tagName.toLowerCase() == "webwriter-text"
            ) {
              const textIsWrong =
                answer.solution !== answer.value;

              if (rule.condition.toLowerCase() == "correct" && !textIsWrong) {
                return Number(rule.target);
              }
              else if (
                rule.condition.toLowerCase() == "incorrect" &&
                textIsWrong
              ) {
                return Number(rule.target);
              }
            }
            else if (
              answer.tagName.toLowerCase() == "webwriter-mark"
            ) {
              let userHighlightMatches = false;

              for (const solution_highlight of answer.solution as Highlight[]) {
                userHighlightMatches = (answer.value as Highlight[]).some(
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
                  rule.condition.toLowerCase() == "incorrect" &&
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
            }
          }
        }
      }
    }

    const fallback = branchContainer.elseRule?.target;
    return fallback == null || fallback === "" ? undefined : Number(fallback);
  }
}

import { css, type CSSResult, type CSSResultGroup } from "lit";
import { LitElementWw } from "@webwriter/lit";
import type { WebwriterGamebookBranch } from "../widgets/webwriter-gamebook-branch";
import type { WebwriterGamebookPage } from "../widgets/webwriter-gamebook-page";
import type { WebwriterGamebookPopup } from "../widgets/webwriter-gamebook-popup";

/** The authored element that belongs to a node of the editor. */
export type GamebookContainerElement =
  | WebwriterGamebookPage
  | WebwriterGamebookPopup
  | WebwriterGamebookBranch;

export function isPage(container: GamebookContainerElement): container is WebwriterGamebookPage {
  return container.localName === "webwriter-gamebook-page";
}

export function isPopup(container: GamebookContainerElement): container is WebwriterGamebookPopup {
  return container.localName === "webwriter-gamebook-popup";
}

export function isBranch(container: GamebookContainerElement): container is WebwriterGamebookBranch {
  return container.localName === "webwriter-gamebook-branch";
}

const hidden = css`:host { display: none !important; }`;
const visible = css`:host { display: block !important; }`;

/** Page visibility is local to the current view, including for saved pages with inline display styles. */
export class GamebookContainer extends LitElementWw {
  static styles: CSSResultGroup = css`
    :host(:state(gamebook-hidden)) { display: none !important; }
    :host(:state(gamebook-visible)) { display: block !important; }
  `;

  private readonly states = this.attachInternals?.().states;
  private displayStyle?: CSSResult;

  protected get authoring() {
    return this.closest<HTMLElement>("webwriter-branching-scenario")?.isContentEditable ?? this.isContentEditable;
  }

  protected createRenderRoot() {
    const root = super.createRenderRoot() as ShadowRoot;
    const sheet = this.displayStyle?.styleSheet;
    if (!this.states && sheet) root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    return root;
  }

  private setDisplay(style: CSSResult) {
    if (this.displayStyle === style) return false;
    const old = this.displayStyle;
    this.displayStyle = style;
    if (this.states) {
      this.states.delete(style === visible ? "gamebook-hidden" : "gamebook-visible");
      this.states.add(style === visible ? "gamebook-visible" : "gamebook-hidden");
    } else if (this.shadowRoot && style.styleSheet) {
      this.shadowRoot.adoptedStyleSheets = [
        ...this.shadowRoot.adoptedStyleSheets.filter(sheet => sheet !== old?.styleSheet),
        style.styleSheet,
      ];
    }
    return true;
  }

  public hide() {
    if (!this.setDisplay(hidden)) return;
    for (const child of this.children) {
      if (child instanceof HTMLMediaElement) {
        child.pause();
        child.currentTime = 0;
      }
    }
  }

  public show() {
    this.setDisplay(visible);
  }
}

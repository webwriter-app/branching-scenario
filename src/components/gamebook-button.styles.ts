import { css } from "lit";

/** Shared by the two choice buttons of a page. */
export default css`
  sl-button {
    min-width: min(100%, 10rem);
    max-width: 100%;
  }

  sl-button::part(base) {
    height: auto;
    min-height: var(--sl-input-height-small);
    white-space: normal;
  }

  @media (pointer: coarse) {
    sl-button::part(base) {
      min-height: 44px;
    }
  }

  @media print {
    :host {
      break-inside: avoid;
    }

    /* A choice on paper is a boxed line of text. */
    sl-button::part(base) {
      background: none;
      color: #000;
      border: 1px solid #000;
      box-shadow: none;
    }
  }
`;

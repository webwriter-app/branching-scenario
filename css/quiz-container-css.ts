import { css } from "lit";

export default css`
  .test {
    width: 100%;
    height: auto;
    position: unset;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }
`;

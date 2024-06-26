import { css } from "lit";

export default css`
  .test {
    width: 100%;
    height: 500px;
  }

  sl-dialog::part(base) {
    position: absolute;
  }

  sl-dialog::part(overlay) {
    position: absolute;
  }
`;

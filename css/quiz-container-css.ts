import { css } from "lit";

export default css`
  .quiz {
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

  .content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
`;

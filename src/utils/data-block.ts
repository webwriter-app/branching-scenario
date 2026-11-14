export const dataBlockSelector = ':scope > script[type="application/json"][slot="data"]:not([src])';

export function parseData<T>(text: string | null | undefined): Partial<T> {
  if (!text) return {};
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

export function writeData<T extends object>(host: HTMLElement, value: T) {
  const text = JSON.stringify(value).replace(/</g, "\\u003c");
  const current = host.querySelector(dataBlockSelector);
  if (current?.textContent === text) return;
  const block = current ?? host.ownerDocument.createElement("script");
  if (!current) {
    block.setAttribute("type", "application/json");
    block.setAttribute("slot", "data");
  }
  block.textContent = text;
  if (!current) host.append(block);
}

/** Watch direct data blocks without subscribing to edits inside authored pages. */
export class DataBlockObserver {
  private readonly blocks = new MutationObserver(() => this.onChange());
  private readonly children = new MutationObserver(records => {
    for (const record of records) {
      if ([...record.addedNodes, ...record.removedNodes].some(node => node instanceof HTMLScriptElement)) {
        this.observeBlocks();
        this.onChange();
        break;
      }
    }
  });

  constructor(private readonly host: HTMLElement, private readonly onChange: () => void) {}

  connect() {
    this.children.observe(this.host, { childList: true });
    this.observeBlocks();
  }

  disconnect() {
    this.children.disconnect();
    this.blocks.disconnect();
  }

  private observeBlocks() {
    this.blocks.disconnect();
    for (const child of this.host.children) {
      if (child instanceof HTMLScriptElement) {
        this.blocks.observe(child, {
          attributes: true, attributeFilter: ["type", "slot", "src", "data-branching-labels"],
          childList: true, subtree: true, characterData: true,
        });
      }
    }
  }
}

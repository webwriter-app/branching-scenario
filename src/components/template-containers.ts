import type { ContainerTemplate } from "../model/editor-content";

/**
 * Gives the containers of a template the ids their nodes got when the template
 * was inserted: the node ids, the incoming container, the targets of buttons
 * and the targets of branch rules.
 */
export function remapContainers(containers: ContainerTemplate[], ids: Map<number, number>): ContainerTemplate[] {
  const mapped = (old: string | number) => ids.get(Number(old));
  const parser = new DOMParser();

  return structuredClone(containers).map((container) => {
    for (const attribute of container.attributes) {
      if (attribute.name === "drawflownodeid" || attribute.name === "incomingcontainerid") {
        attribute.value = String(mapped(attribute.value) ?? attribute.value);
      }
    }

    const doc = parser.parseFromString(container.innerHTML, "text/html");
    if (container.tagName === "webwriter-gamebook-branch") {
      const block =
        doc.body.querySelector(':scope > script[type="application/json"][slot="data"]') ??
        doc.head.querySelector(':scope > script[type="application/json"][slot="data"]');
      if (block) {
        const data = JSON.parse(block.textContent ?? "{}");
        for (const rule of [...(data.rules ?? []), data.elseRule].filter(Boolean)) {
          const target = mapped(rule.target);
          if (target !== undefined) rule.target = target;
        }
        block.textContent = JSON.stringify(data).replace(/</g, "\\u003c");
        doc.body.append(block);
      }
    }

    for (const button of doc.querySelectorAll("webwriter-gamebook-button, webwriter-gamebook-branch-button")) {
      const target = button.getAttribute("datatargetid");
      if (target) button.setAttribute("datatargetid", String(mapped(target) ?? target));
      const parts = button.getAttribute("identifier")?.split("-");
      if (parts?.length === 4) {
        const from = mapped(parts[0]);
        const to = mapped(parts[2]);
        button.setAttribute("identifier", `${from}-${parts[1]}-${to}-input_1`);
      }
    }
    container.innerHTML = doc.body.innerHTML;
    return container;
  });
}

import type { StoredNode } from "../model/editor-content";
import type { TweePassage } from "../model/twee";
import { containerTag } from "../model/scenario-file";

export const containerSelector = "webwriter-gamebook-page, webwriter-gamebook-popup, webwriter-gamebook-branch";
const buttonSelector = "webwriter-gamebook-button, webwriter-gamebook-branch-button";

export const containersOf = (scenario: Element) =>
  Array.from(scenario.children).filter(child => child.matches(containerSelector));

const nodeIdOf = (container: Element) => Number(container.getAttribute("drawflownodeid"));

/** Editor and view state that must not end up in a file. */
function clean(clone: Element) {
  for (const element of [clone, ...clone.querySelectorAll("*")]) {
    element.removeAttribute("contenteditable");
    for (const name of [...element.classList]) {
      if (name.startsWith("ProseMirror") || name === "highlighted") element.classList.remove(name);
    }
    if (element.hasAttribute("class") && !element.classList.length) element.removeAttribute("class");
  }
  return clone;
}

/** The markup of every container, as a file stores it. */
export function serializeContainers(scenario: Element) {
  return containersOf(scenario).map(container => clean(container.cloneNode(true) as Element).outerHTML);
}

/** Browsers ignore tabs, newlines and control characters inside a scheme, so they are removed before the test. */
function isSafeUrl(value: string) {
  const url = value.replace(/[\u0000-\u0020\u007f-\u009f]/g, "").toLowerCase();
  return !/^(javascript|vbscript):/.test(url) && !(url.startsWith("data:") && !url.startsWith("data:image/"));
}

/** Parses the containers of a file into detached elements and drops what could run code. */
export function parseContainers(doc: Document, markup: string[]) {
  const containers: Element[] = [];
  for (const source of markup) {
    const template = doc.createElement("template");
    template.innerHTML = source;
    const elements = Array.from(template.content.children);
    if (elements.length !== 1 || !elements[0].matches(containerSelector)) return null;
    const [container] = elements;
    for (const element of [container, ...container.querySelectorAll("*")]) {
      const data = element.matches('script[type="application/json"][slot="data"]');
      if ((element.localName === "script" && !data) || element.localName === "object" || element.localName === "embed") { element.remove(); continue; }
      for (const attribute of [...element.attributes]) {
        if (attribute.name.startsWith("on") || attribute.name === "srcdoc"
          || (/^(href|src|action|formaction|xlink:href)$/.test(attribute.name) && !isSafeUrl(attribute.value))) {
          element.removeAttribute(attribute.name);
        }
      }
    }
    containers.push(container);
  }
  return containers;
}

/** Whether every node has exactly one container of its kind and no container is left over. */
export function containersMatch(nodes: StoredNode[], containers: Element[]) {
  const seen = new Set<number>();
  for (const container of containers) {
    const id = nodeIdOf(container);
    const node = nodes.find(candidate => candidate.id === id);
    if (!node || seen.has(id) || container.localName !== containerTag(node.class)) return false;
    seen.add(id);
  }
  return seen.size === nodes.length;
}

/** The choices of a container as `[label, target node id]`, keyed by the connection they belong to. */
function choicesOf(container: Element | undefined) {
  const choices = new Map<string, string>();
  for (const button of container?.querySelectorAll(`:scope > ${buttonSelector}`) ?? []) {
    const identifier = button.getAttribute("identifier");
    if (identifier) choices.set(identifier, button.getAttribute("name") ?? "");
  }
  return choices;
}

/** The text of a container without its choices and data. */
function textOf(container: Element | undefined) {
  if (!container) return "";
  return Array.from(container.children)
    .filter(child => !child.matches(`${buttonSelector}, script`))
    .map(child => (child.textContent ?? "").replace(/[ \t\r\f\v ]+/g, " ").replace(/\n\s*/g, "\n").trim())
    .filter(Boolean)
    .join("\n\n");
}

/** One passage per node, with the choices that lead out of it. */
export function passagesOf(scenario: Element, nodes: StoredNode[]): TweePassage[] {
  const containers = containersOf(scenario);
  return nodes.map(node => {
    const container = containers.find(candidate => nodeIdOf(candidate) === node.id);
    const choices = choicesOf(container);
    const links = Object.entries(node.outputs).flatMap(([outputClass, port]) =>
      port.connections.map(({ node: target, output }) => ({
        label: choices.get(`${node.id}-${outputClass}-${target}-${output}`) ?? "",
        targetId: Number(target),
      })));
    return {
      id: node.id,
      name: node.data.title,
      kind: node.class,
      x: node.pos_x ?? 0,
      y: node.pos_y ?? 0,
      text: textOf(container),
      links,
    };
  });
}

/** Pages and popups as sibling `section` elements; a choice becomes a link to the section it leads to. */
export function sectionsOf(scenario: Element, nodes: StoredNode[]) {
  const doc = scenario.ownerDocument;
  const containers = containersOf(scenario);
  const sections = nodes.filter(node => node.class !== "branch");
  const fragment = doc.createDocumentFragment();
  for (const node of sections) {
    const container = containers.find(candidate => nodeIdOf(candidate) === node.id);
    if (!container) continue;
    const section = doc.createElement("section");
    section.id = `scenario-${node.id}`;
    const heading = doc.createElement("h2");
    heading.textContent = container.getAttribute("pagetitle") || node.data.title;
    section.append(heading);
    for (const child of container.children) {
      if (child.matches(`${buttonSelector}, script`)) continue;
      section.append(clean(child.cloneNode(true) as Element));
    }
    const choices = choicesOf(container);
    const list = doc.createElement("ul");
    for (const [identifier, name] of choices) {
      const target = Number(identifier.split("-")[2]);
      if (!sections.some(candidate => candidate.id === target)) continue;
      const item = doc.createElement("li");
      const link = doc.createElement("a");
      link.href = `#scenario-${target}`;
      link.textContent = name;
      item.append(link);
      list.append(item);
    }
    if (list.children.length) section.append(list);
    fragment.append(section);
  }
  return fragment.children.length ? fragment : null;
}

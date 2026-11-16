import type { EditorContent, NodeTemplate, StoredNode } from "./editor-content";

export type NodeKind = "page" | "origin" | "popup" | "branch";

/** One end of a connection: an output of one node wired to an input of another. */
export interface Link {
  outputId: number;
  inputId: number;
  outputClass: string;
  inputClass: string;
}

export interface InputPort {
  connections: { node: string; input: string }[];
}

export interface OutputPort {
  connections: { node: string; output: string }[];
}

/** A node of the diagram as it is stored in the document. */
export interface DiagramNode {
  id: number;
  data: { title: string; [key: string]: unknown };
  class: NodeKind | string;
  typenode: boolean;
  inputs: Record<string, InputPort>;
  outputs: Record<string, OutputPort>;
  pos_x: number;
  pos_y: number;
}

export type DiagramEvent =
  | { type: "nodeCreated" | "nodeRemoved" | "nodeMoved"; id: number }
  | { type: "connectionCreated" | "connectionRemoved"; link: Link }
  /** Something else about a node changed: its title, its outputs or which node starts the gamebook. */
  | { type: "changed" };

/** Why a connection is not made. */
export type Rejection = "missing" | "duplicate" | "branch-taken" | "branch-to-branch" | "self-loop";

const INPUT = "input_1";

/** `output_3` is the third output of a node. */
export function outputIndex(outputClass: string): number {
  return Number(outputClass.slice("output_".length));
}

/** The key that identifies a connection: it is also the `data-ww-key` of its path. */
export function linkKey({ outputId, inputId, outputClass, inputClass }: Link): string {
  return `${outputId}-${inputId}-${outputClass}-${inputClass}`;
}

export function parseLinkKey(key: string): Link | null {
  const [output, input, outputClass, inputClass] = key.split("-");
  const outputId = Number(output);
  const inputId = Number(input);
  if (!Number.isInteger(outputId) || !Number.isInteger(inputId) || !outputClass || !inputClass) return null;
  return { outputId, inputId, outputClass, inputClass };
}

/**
 * The nodes of a gamebook and the connections between them, in the format the
 * document stores. Every change is reported to the listener, in the order it
 * happens: removing a node reports its connections first.
 */
export class Diagram {
  #data: Record<string, DiagramNode> = {};
  #nextId = 1;
  #listeners = new Set<(event: DiagramEvent) => void>();

  /** The nodes in id order. The objects are the diagram's own: read them, do not change them. */
  get nodes(): DiagramNode[] {
    return Object.values(this.#data);
  }

  subscribe(listener: (event: DiagramEvent) => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #emit(event: DiagramEvent) {
    for (const listener of [...this.#listeners]) listener(event);
  }

  /** A copy of a node, so that callers can keep it while the diagram moves on. */
  node(id: number | string): DiagramNode | undefined {
    const node = this.#data[id];
    return node && structuredClone(node);
  }

  /** The graph as a document stores it. */
  export(): EditorContent {
    return { drawflow: { Home: { data: structuredClone(this.#data) } } };
  }

  /** Replaces the graph without reporting changes. */
  import(content: EditorContent) {
    const data = structuredClone(content.drawflow.Home.data) as Record<string, StoredNode>;
    this.#data = {};
    for (const [key, stored] of Object.entries(data)) {
      const { id, data: nodeData, class: kind, typenode, inputs, outputs, pos_x, pos_y } = stored;
      this.#data[key] = { id, data: nodeData, class: kind, typenode, inputs, outputs, pos_x, pos_y };
      this.#nextId = Math.max(this.#nextId, Number(id) + 1);
    }
  }

  clear() {
    this.#data = {};
  }

  get originId(): number | undefined {
    return this.nodes.find((node) => node.class === "origin")?.id;
  }

  /** Pages and popups have one output, a branch starts with none. */
  addNode(kind: NodeKind, title: string, x: number, y: number): DiagramNode {
    const id = this.#nextId++;
    const outputs: Record<string, OutputPort> = kind === "branch" ? {} : { output_1: { connections: [] } };
    this.#data[id] = {
      id,
      data: { title },
      class: kind,
      typenode: false,
      inputs: { [INPUT]: { connections: [] } },
      outputs,
      pos_x: x,
      pos_y: y,
    };
    this.#emit({ type: "nodeCreated", id });
    return this.node(id)!;
  }

  moveNode(id: number, x: number, y: number) {
    const node = this.#data[id];
    if (!node || (node.pos_x === x && node.pos_y === y)) return;
    node.pos_x = x;
    node.pos_y = y;
    this.#emit({ type: "nodeMoved", id });
  }

  setData(id: number, data: DiagramNode["data"]) {
    const node = this.#data[id];
    if (!node) return;
    node.data = structuredClone(data);
    this.#emit({ type: "changed" });
  }

  removeNode(id: number | string) {
    const node = this.#data[id];
    if (!node) return;
    for (const [outputClass, port] of Object.entries(node.outputs)) {
      for (const connection of [...port.connections]) {
        this.removeConnection(node.id, Number(connection.node), outputClass, connection.output);
      }
    }
    for (const [inputClass, port] of Object.entries(node.inputs)) {
      for (const connection of [...port.connections]) {
        this.removeConnection(Number(connection.node), node.id, connection.input, inputClass);
      }
    }
    delete this.#data[id];
    this.#emit({ type: "nodeRemoved", id: node.id });
  }

  /** Makes the one node the start of the gamebook. */
  setOrigin(id: number) {
    for (const node of this.nodes) {
      if (node.class === "origin") node.class = "page";
    }
    const node = this.#data[id];
    if (node) node.class = "origin";
    this.#emit({ type: "changed" });
  }

  /**
   * Whether the connection would break a rule, or null. A branch takes one
   * incoming connection, never comes from another branch, and does not lead
   * back to the node it branches off.
   */
  rejection({ outputId, inputId, outputClass, inputClass }: Link): Rejection | null {
    const from = this.#data[outputId];
    const to = this.#data[inputId];
    if (!from || !to || !from.outputs[outputClass] || !to.inputs[inputClass]) return "missing";
    if (to.inputs[inputClass].connections.some((c) => Number(c.node) === outputId && c.input === outputClass)) return "duplicate";
    if (to.class === "branch") {
      if (to.inputs[INPUT]?.connections.length > 0) return "branch-taken";
      if (from.class === "branch") return "branch-to-branch";
    } else if (from.class === "branch" && inputId === Number(from.inputs[INPUT]?.connections[0]?.node)) {
      return "self-loop";
    }
    return null;
  }

  /** Connects an output to an input. Returns why not if a rule forbids it. */
  addConnection(link: Link): Rejection | null {
    const rejection = this.rejection(link);
    if (rejection) return rejection;
    const { outputId, inputId, outputClass, inputClass } = link;
    this.#data[outputId].outputs[outputClass].connections.push({ node: String(inputId), output: inputClass });
    this.#data[inputId].inputs[inputClass].connections.push({ node: String(outputId), input: outputClass });
    this.#emit({ type: "connectionCreated", link });
    return null;
  }

  removeConnection(outputId: number | string, inputId: number | string, outputClass: string, inputClass: string) {
    const from = this.#data[outputId];
    const to = this.#data[inputId];
    const outgoing = from?.outputs[outputClass]?.connections;
    const incoming = to?.inputs[inputClass]?.connections;
    const out = outgoing?.findIndex((c) => c.node === String(inputId) && c.output === inputClass) ?? -1;
    const into = incoming?.findIndex((c) => c.node === String(outputId) && c.input === outputClass) ?? -1;
    if (out === -1 || into === -1) return;
    outgoing!.splice(out, 1);
    incoming!.splice(into, 1);
    this.#emit({
      type: "connectionRemoved",
      link: { outputId: from.id, inputId: to.id, outputClass, inputClass },
    });
  }

  addOutput(id: number | string) {
    const node = this.#data[id];
    if (!node) return;
    node.outputs[`output_${Object.keys(node.outputs).length + 1}`] = { connections: [] };
    this.#emit({ type: "changed" });
  }

  /** Removes an output with its connections; the outputs after it move up by one. */
  removeOutput(id: number | string, outputClass: string) {
    const node = this.#data[id];
    if (!node?.outputs[outputClass]) return;
    for (const connection of [...node.outputs[outputClass].connections]) {
      this.removeConnection(node.id, Number(connection.node), outputClass, connection.output);
    }
    delete node.outputs[outputClass];
    const outputs: Record<string, OutputPort> = {};
    const removed = outputIndex(outputClass);
    for (const [name, port] of Object.entries(node.outputs)) {
      const index = outputIndex(name);
      if (index <= removed) {
        outputs[name] = port;
        continue;
      }
      const renamed = `output_${index - 1}`;
      outputs[renamed] = port;
      for (const connection of port.connections) {
        const peer = this.#data[connection.node]?.inputs[connection.output];
        for (const back of peer?.connections ?? []) {
          if (back.node === String(node.id) && back.input === name) back.input = renamed;
        }
      }
    }
    node.outputs = outputs;
    this.#emit({ type: "changed" });
  }

  /** The ids of the nodes whose title or kind contains the text. */
  search(text: string): number[] {
    const needle = text.toLowerCase();
    return this.nodes
      .filter((node) => node.data.title.toLowerCase().includes(needle) || node.class.toLowerCase().includes(needle))
      .map((node) => node.id);
  }

  /**
   * Adds the nodes of a template with new ids, centred on the given point.
   * Returns the new id of each template id.
   */
  insert(template: NodeTemplate, centerX: number, centerY: number): Map<number, number> {
    const nodes = structuredClone(Object.values(template.drawflow.Home.data)) as StoredNode[];
    const xs = nodes.map((node) => node.pos_x);
    const ys = nodes.map((node) => node.pos_y);
    const dx = centerX - (Math.min(...xs) + Math.max(...xs)) / 2;
    const dy = centerY - (Math.min(...ys) + Math.max(...ys)) / 2;
    const ids = new Map(nodes.map((node) => [Number(node.id), this.#nextId++]));
    for (const node of nodes) {
      const id = ids.get(Number(node.id))!;
      for (const port of [...Object.values(node.inputs), ...Object.values(node.outputs)]) {
        for (const connection of port.connections) {
          connection.node = String(ids.get(Number(connection.node)) ?? connection.node);
        }
      }
      this.#data[id] = {
        id,
        data: node.data,
        class: node.class,
        typenode: node.typenode,
        inputs: node.inputs,
        outputs: node.outputs,
        pos_x: node.pos_x + dx,
        pos_y: node.pos_y + dy,
      };
    }
    return ids;
  }
}

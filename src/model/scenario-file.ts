import type { EditorContent } from "./editor-content";

export const scenarioFormat = "webwriter-branching-scenario";

/** The JSON file of a scenario: the graph as the document stores it and the markup of every page, popup and branch. */
export interface ScenarioFile {
  format: typeof scenarioFormat;
  version: 1;
  title: string;
  graph: EditorContent;
  containers: string[];
}

export type ScenarioFileProblem = "json" | "format" | "graph";

export class ScenarioFileError extends Error {
  constructor(readonly problem: ScenarioFileProblem) {
    super(problem);
  }
}

const kinds = ["origin", "page", "popup", "branch"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** The tag of the container element that belongs to a node of this class. */
export function containerTag(kind: string) {
  return kind === "popup" ? "webwriter-gamebook-popup"
    : kind === "branch" ? "webwriter-gamebook-branch"
    : "webwriter-gamebook-page";
}

/** Checks the whole file before anything is applied. Throws a `ScenarioFileError` for the first problem. */
export function parseScenarioFile(text: string): ScenarioFile {
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new ScenarioFileError("json"); }
  if (!isRecord(value) || value.format !== scenarioFormat || value.version !== 1
    || typeof value.title !== "string" || !Array.isArray(value.containers)
    || !value.containers.every(item => typeof item === "string")) {
    throw new ScenarioFileError("format");
  }
  const data = (value.graph as EditorContent | undefined)?.drawflow?.Home?.data;
  if (!isRecord(data)) throw new ScenarioFileError("graph");
  const nodes = Object.entries(data);
  const ids = new Set(nodes.map(([key]) => key));
  for (const [key, node] of nodes) {
    if (!isRecord(node) || String(node.id) !== key || !Number.isInteger(node.id)
      || typeof node.class !== "string" || !kinds.includes(node.class)
      || !isRecord(node.data) || typeof node.data.title !== "string"
      || !isRecord(node.inputs) || !isRecord(node.outputs)) {
      throw new ScenarioFileError("graph");
    }
    for (const port of [...Object.values(node.inputs), ...Object.values(node.outputs)]) {
      const connections = isRecord(port) ? port.connections : undefined;
      if (!Array.isArray(connections) || !connections.every(link => isRecord(link) && ids.has(String(link.node)))) {
        throw new ScenarioFileError("graph");
      }
    }
  }
  return value as unknown as ScenarioFile;
}

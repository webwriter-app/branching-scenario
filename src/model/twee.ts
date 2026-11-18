/** One passage of a Twee story: a node of the gamebook with its text and the choices that leave it. */
export interface TweePassage {
  id: number;
  name: string;
  kind: string;
  x: number;
  y: number;
  text: string;
  links: { label: string; targetId: number }[];
}

const escapeName = (name: string) => name.replace(/[\\[\]{}]/g, "\\$&");
const linkPart = (text: string) => text.replace(/\s+/g, " ").replace(/[[\]|]|->|<-/g, " ").trim();

/** Gives every passage a name that is unique in the story. */
function uniqueNames(passages: TweePassage[]) {
  const taken = new Set(["StoryTitle", "StoryData"]);
  return new Map(passages.map(passage => {
    const base = linkPart(passage.name) || `Node ${passage.id}`;
    let name = base;
    if (taken.has(name)) name = `${base} (${passage.id})`;
    taken.add(name);
    return [passage.id, name];
  }));
}

/** Twee 3 source with links in the `[[label->passage]]` form that Twine's story formats read. */
export function toTwee(title: string, passages: TweePassage[], startId: number | undefined, ifid: string) {
  const names = uniqueNames(passages);
  const x0 = Math.min(0, ...passages.map(passage => passage.x));
  const y0 = Math.min(0, ...passages.map(passage => passage.y));
  const start = startId === undefined ? undefined : names.get(startId);
  const data = {
    ifid,
    format: "Harlowe",
    "format-version": "3.3.9",
    ...(start ? { start } : {}),
  };
  const blocks = [
    `:: StoryTitle\n${title}`,
    `:: StoryData\n${JSON.stringify(data, null, 2)}`,
  ];
  for (const passage of passages) {
    const meta = JSON.stringify({ position: `${Math.round(passage.x - x0)},${Math.round(passage.y - y0)}`, size: "100,100" });
    const body = passage.text.split("\n").map(line => line.startsWith("::") ? `\\${line}` : line).join("\n");
    const links = passage.links.flatMap(({ label, targetId }) => {
      const target = names.get(targetId);
      if (target === undefined) return [];
      const to = linkPart(target);
      const text = linkPart(label);
      return [!text || text === to ? `[[${to}]]` : `[[${text}->${to}]]`];
    });
    const content = [body.trim(), links.join("\n")].filter(Boolean).join("\n\n");
    blocks.push(`:: ${escapeName(names.get(passage.id)!)} [${passage.kind}] ${meta}\n${content}`);
  }
  return blocks.join("\n\n\n") + "\n";
}

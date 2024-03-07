import nlp from "compromise/three";
import { usePlaybackStore } from "./store";

export const highlightWalker = (textChunks: string[], index: number) => {
  // @ts-expect-error
  if (!CSS.highlights) {
    throw new Error("Highlight API not available");
  }

  // @ts-expect-error
  const highlight = usePlaybackStore.getState().highlight ?? new Highlight();

  if (!usePlaybackStore.getState().highlight) {
    // @ts-expect-error
    CSS.highlights.set("readability-highlight", highlight);

    usePlaybackStore.setState({ highlight });
  }

  const body = document.body;
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, null);

  const searchText = textChunks[index];

  const chunks = nlp(searchText).clauses().out("array") as string[];

  highlight?.clear();

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const nodeText = node.textContent;
    if (!nodeText) continue;

    const matches = chunks
      .map((chunk) => {
        const matchIndex = nodeText.indexOf(chunk);
        if (matchIndex === -1) return null;
        return {
          matchIndex,
          matchLength: chunk.length,
        };
      })
      .filter((match) => match !== null) as {
      matchIndex: number;
      matchLength: number;
    }[];

    if (matches.length > 0) {
      console.log("hasMatches", {
        matches,
        chunks,
        nodeText,
      });

      matches.forEach((match) => {
        try {
          const matchRange = new Range();
          matchRange.setStart(node!, match.matchIndex);
          matchRange.setEnd(node!, match.matchIndex + match.matchLength);
          highlight?.add(matchRange);
        } catch (e) {
          console.log("Error highlighting", e);
        }
      });
    }
  }
};

import nlp from "compromise/one";

export const nlpChunks = (text: string, minSizePerChunk: number = 150) => {
  const sentences = nlp(text).fullSentences().out("array") as string[];

  console.log({ sentences });

  const chunks: string[] = [];

  let currentChunk: string = sentences[0];

  for (let i = 1; i < sentences.length; i++) {
    if (currentChunk.length > minSizePerChunk) {
      chunks.push(currentChunk);
      currentChunk = "";
    }

    currentChunk = `${currentChunk} ${sentences[i]}`;
  }

  chunks.push(currentChunk);

  return chunks;
};

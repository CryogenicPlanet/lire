// src/pages/content-script/index.tsx
import { createRoot } from "react-dom/client";
// import Content from "./content";

import { Readability } from "@mozilla/readability";

import { extComm } from "../comm";

const root = document.createElement("div");
root.id = "crx-root";
document.body.append(root);

function splitIntoChunks(
  text: string,
  minSizePerChunk: number = 300
): string[] {
  // Initialize an array to hold the chunks of text
  const chunks: string[] = [];
  // Define a regex to match full stops followed by whitespace or end of text
  const fullStopRegex = /\.(\s+|$)/g;
  // Define a regex to match other punctuation followed by whitespace
  const otherPunctuationRegex = /[!?;,]\s+/g;
  let match;
  // Start index for slicing the text
  let startIndex = 0;

  // Iterate over the text, finding full stops to determine chunk boundaries
  while ((match = fullStopRegex.exec(text)) !== null) {
    // Calculate the end index of the current chunk
    let endIndex = match.index + match[0].length;
    // If the chunk is smaller than the minimum size, attempt to extend it
    if (endIndex - startIndex < minSizePerChunk) {
      // Save the current lastIndex of fullStopRegex
      const currentLastIndex = fullStopRegex.lastIndex;
      // Look ahead for the next full stop or other punctuation
      const nextFullStopMatch = fullStopRegex.exec(text);
      const nextOtherPunctuationMatch = otherPunctuationRegex.exec(text);
      // Choose the closest next punctuation match
      const nextMatch =
        nextFullStopMatch && nextFullStopMatch.index < currentLastIndex + 20
          ? nextFullStopMatch
          : nextOtherPunctuationMatch &&
            nextOtherPunctuationMatch.index < currentLastIndex + 20
          ? nextOtherPunctuationMatch
          : null;

      // If there's a close enough next match, extend the current chunk to include it
      if (nextMatch) {
        endIndex = nextMatch.index + nextMatch[0].length;
        // Update the lastIndex for the next iteration to be after the extended chunk
        fullStopRegex.lastIndex = endIndex;
      } else {
        // Reset the lastIndex if no extension is made
        fullStopRegex.lastIndex = currentLastIndex;
      }
    }

    // Add the current chunk to the array of chunks
    chunks.push(text.substring(startIndex, endIndex));
    // Update the start index for the next chunk
    startIndex = endIndex;
  }

  // Handle any remaining text after the last full stop
  if (startIndex < text.length) {
    // Split the remaining text by other punctuation
    const remainingText = text.substring(startIndex);
    const remainingChunks = remainingText
      .split(otherPunctuationRegex)
      .filter((chunk) => chunk);

    // Combine small chunks with the previous one or add them as new chunks
    remainingChunks.forEach((chunk, index) => {
      if (
        chunks.length > 0 &&
        chunks[chunks.length - 1].length + chunk.length < minSizePerChunk
      ) {
        // If the last chunk is too small, combine it with the current chunk
        chunks[chunks.length - 1] += " " + chunk;
      } else if (index === 0 && chunks.length === 0) {
        // If it's the first chunk and no chunks have been added yet, just add it
        chunks.push(chunk);
      } else {
        // If the chunk is at the start of the remaining text, prepend a space
        chunks.push((index === 0 ? " " : "") + chunk);
      }
    });
  }

  return chunks;
}

// src/pages/content-script/content.ts
function playAudioQueue(chunks: { index: number; dataUrl: string }[]) {
  const sortedChunks = chunks.sort((a, b) => a.index - b.index);
  const audioElements = sortedChunks.map((chunk) => new Audio(chunk.dataUrl));
  let currentAudioIndex = 0;

  const playNextAudio = () => {
    if (currentAudioIndex < audioElements.length) {
      const audio = audioElements[currentAudioIndex];
      audio.onended = () => {
        currentAudioIndex++;
        playNextAudio();
      };
      audio.play();
      highlightCurrentTextChunk(currentAudioIndex); // Implement this function
    }
  };

  playNextAudio();
}
function highlightCurrentTextChunk(index: number) {
  // Logic to change the background color of the current text chunk to red
  // This will depend on how you've rendered thextext chunks in the DOM
}
extComm.onMsg("content", "startTTS", () => {
  // TODO: change to full body content later

  const documentClone = document.cloneNode(true);

  const content = new Readability(documentClone as Document, {
    keepClasses: true,
  }).parse();

  const text = content?.textContent;

  if (!text) throw new Error("no selected text");

  const textChunks = splitIntoChunks(text); // Implement this function

  extComm.sendMsg("background", "tts", [textChunks]).then((dataUrls) => {
    // Play audio from URLs and handle the queue
    const chunksWithIndex = dataUrls.map((dataUrl, index) => ({
      index,
      dataUrl,
    }));
    playAudioQueue(chunksWithIndex);
  });

  return true;
});

// createRoot(root).render(<Content />);

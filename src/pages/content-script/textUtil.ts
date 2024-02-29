// export function splitIntoChunks(
//   text: string,
//   minSizePerChunk: number = 300
// ): string[] {
//   // Initialize an array to hold the chunks of text
//   const chunks: string[] = [];
//   // Define a regex to match full stops followed by whitespace or end of text
//   const fullStopRegex = /\.(\s+|$)/g;
//   // Define a regex to match other punctuation followed by whitespace
//   const otherPunctuationRegex = /[!?;,]\s+/g;
//   let match;
//   // Start index for slicing the text
//   let startIndex = 0;

//   // Iterate over the text, finding full stops to determine chunk boundaries
//   while ((match = fullStopRegex.exec(text)) !== null) {
//     // Calculate the end index of the current chunk
//     let endIndex = match.index + match[0].length;
//     // If the chunk is smaller than the minimum size, attempt to extend it
//     if (endIndex - startIndex < minSizePerChunk) {
//       // Save the current lastIndex of fullStopRegex
//       const currentLastIndex = fullStopRegex.lastIndex;
//       // Look ahead for the next full stop or other punctuation
//       const nextFullStopMatch = fullStopRegex.exec(text);
//       const nextOtherPunctuationMatch = otherPunctuationRegex.exec(text);
//       // Choose the closest next punctuation match
//       const nextMatch =
//         nextFullStopMatch && nextFullStopMatch.index < currentLastIndex + 20
//           ? nextFullStopMatch
//           : nextOtherPunctuationMatch &&
//             nextOtherPunctuationMatch.index < currentLastIndex + 20
//           ? nextOtherPunctuationMatch
//           : null;

//       // If there's a close enough next match, extend the current chunk to include it
//       if (nextMatch) {
//         endIndex = nextMatch.index + nextMatch[0].length;
//         // Update the lastIndex for the next iteration to be after the extended chunk
//         fullStopRegex.lastIndex = endIndex;
//       } else {
//         // Reset the lastIndex if no extension is made
//         fullStopRegex.lastIndex = currentLastIndex;
//       }
//     }

//     // Add the current chunk to the array of chunks
//     chunks.push(text.substring(startIndex, endIndex));
//     // Update the start index for the next chunk
//     startIndex = endIndex;
//   }

//   // Handle any remaining text after the last full stop
//   if (startIndex < text.length) {
//     // Split the remaining text by other punctuation
//     const remainingText = text.substring(startIndex);
//     const remainingChunks = remainingText
//       .split(otherPunctuationRegex)
//       .filter((chunk) => chunk);

//     // Combine small chunks with the previous one or add them as new chunks
//     remainingChunks.forEach((chunk, index) => {
//       if (
//         chunks.length > 0 &&
//         chunks[chunks.length - 1].length + chunk.length < minSizePerChunk
//       ) {
//         // If the last chunk is too small, combine it with the current chunk
//         chunks[chunks.length - 1] += " " + chunk;
//       } else if (index === 0 && chunks.length === 0) {
//         // If it's the first chunk and no chunks have been added yet, just add it
//         chunks.push(chunk);
//       } else {
//         // If the chunk is at the start of the remaining text, prepend a space
//         chunks.push((index === 0 ? " " : "") + chunk);
//       }
//     });
//   }

//   return chunks;
// }

export const textToChunks = (text: string, minSizePerChunk: number = 300) => {
  const chunks: string[] = [];

  const fullStopRegex = new RegExp(/\.(\s+|$)/g);
  // Define a regex to match other punctuation followed by whitespace
  const otherPunctuationRegex = /[!?;,]\s+/g;

  let match: RegExpExecArray | null;

  let startIndex = 0;

  // Return one match at a time
  while ((match = fullStopRegex.exec(text)) !== null) {
    let endIndex = match.index + match[0].length;

    if (endIndex - startIndex > minSizePerChunk) {
      chunks.push(text.substring(startIndex, endIndex));
      startIndex = endIndex;
      continue;
    }

    // Too small, try to extend

    // Cache the lastIndex of fullStopRegex, can be used to reset if lookahead is not used
    const currentLastIndex = fullStopRegex.lastIndex;

    otherPunctuationRegex.lastIndex = currentLastIndex;

    const nextFullStopMatch = fullStopRegex.exec(text);
    const nextOtherPunctuationMatch = otherPunctuationRegex.exec(text);

    if (!nextFullStopMatch && !nextOtherPunctuationMatch) {
      chunks.push(text.substring(startIndex, endIndex));
      fullStopRegex.lastIndex = currentLastIndex;
      continue;
    }

    const nextFullStopEndIndex = nextFullStopMatch
      ? nextFullStopMatch.index + nextFullStopMatch[0].length
      : 0;

    const nextOtherPunctuationEndIndex = nextOtherPunctuationMatch
      ? nextOtherPunctuationMatch.index + nextOtherPunctuationMatch[0].length
      : 0;

    const diffFullStop = nextFullStopEndIndex - startIndex - minSizePerChunk;
    const diffOtherPunctuation =
      nextOtherPunctuationEndIndex - startIndex - minSizePerChunk;

    if (diffFullStop > 0 || diffOtherPunctuation > 0) {
      if (diffFullStop < diffOtherPunctuation) {
        // use full stop
        chunks.push(text.substring(startIndex, nextFullStopEndIndex));
        endIndex = nextFullStopEndIndex;
      } else {
        // use other punctuation
        chunks.push(text.substring(startIndex, nextOtherPunctuationEndIndex));
        endIndex = nextOtherPunctuationEndIndex;
      }
    } else {
      if (diffFullStop < diffOtherPunctuation) {
        // use other punctuation
        chunks.push(text.substring(startIndex, nextOtherPunctuationEndIndex));
        endIndex = nextOtherPunctuationEndIndex;
      } else {
        // use full stop
        chunks.push(text.substring(startIndex, nextFullStopEndIndex));

        endIndex = nextFullStopEndIndex;
      }
    }

    fullStopRegex.lastIndex = endIndex;

    startIndex = endIndex;
  }

  // Handle any remaining text after the last full stop
  if (startIndex < text.length) {
    chunks.push(text.substring(startIndex));
  }

  return chunks;
};

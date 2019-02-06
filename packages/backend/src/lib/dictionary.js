import english from "an-array-of-english-words";

// Filter a list of words, output only english ones
export const OnlyEnglishWords = arr => {
  return arr.filter(word => -1 !== english.indexOf(word));
};

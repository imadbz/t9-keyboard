import english from "an-array-of-english-words";
import SortedSet from "./sortedSet";

const sortedEnglish = new SortedSet();
sortedEnglish.add(english);

// Filter a list of words, output only english ones
export const OnlyEnglishWords = arr => {
  const listOfWords = new SortedSet();
  listOfWords.add(arr);

  return sortedEnglish.intersect(listOfWords);
};

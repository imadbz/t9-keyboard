import english from "an-array-of-english-words";
import SortedSet from "./sortedSet";

const sortedEnglish = new SortedSet();
sortedEnglish.add(english);

// Filter a list of words, output only english ones
export const OnlyEnglishWords = arr => {
  return arr.reduce((acc, letterComb, i) => {
    const newList = letterComb.reduce((list, letter) => {
      const wordsList = acc.filter(w => w.length >= i && w[i] === letter);
      list.push(...wordsList);
      return list;
    }, []);
    return newList;
  }, english);
};

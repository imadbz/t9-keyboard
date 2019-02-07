import english from "an-array-of-english-words";

const englishSortedObj = english.reduce((acc, word) => {
  if (!acc[word.length]) acc[word.length] = [];
  !acc[word.length].push(word);

  return acc;
}, {});

Object.keys(englishSortedObj).forEach(key => {
  englishSortedObj[key] = englishSortedObj[key].sort();
});

// Filter a list of words, output only english ones
export const OnlyEnglishWords = arr => {
  return arr.filter(word => -1 !== englishSortedObj[word.length].indexOf(word));
};

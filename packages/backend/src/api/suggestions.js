import { AllPossibleCombinations } from "../lib/combinations";
import { OnlyEnglishWords } from "../lib/dictionary";

// suggest a list of words based on a list of possible chars
// example:
// 		input:
// 		{
// 			keys: {
// 				"0": ["g","h","i"],
// 				"1": ["d","e","f"],
// 				"2": ["j","k","l"],
// 				"3": ["j","k","l"],
// 				"4": ["m","n","o"],
// 			},
// 			onlyEnglish: true
// 		}
//
// 		output:
// 			["hello"]

export default (req, res) => {
  const { keys, onlyEnglish } = req.body;

  const keysList = Object.keys(keys).map(key => keys[key]);

  let possibleCombs = [];

  if (onlyEnglish) possibleCombs = OnlyEnglishWords(keysList);
  else possibleCombs = AllPossibleCombinations(keysList);

  possibleCombs = possibleCombs
    .sort((a, b) => a.length - b.length)
    .slice(0, 10);

  res.json({
    suggestions: possibleCombs.slice(0, 10)
  });
};

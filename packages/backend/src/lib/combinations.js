// suggest a list of words based on a list of possible chars
// example:
// 		input:
// 			[["g","h","i"],["d","e","f"], ["j","k","l"], ["j","k","l"], ["m","n","o"]]

// 		output:
// 			["hello", "gdjjm", ...]

export const AllPossibleCombinations = arr => {
  if (arr.length == 0) return [];
  if (arr.length == 1) return arr[0];

  const result = [];
  const allCombinationsOfRest = AllPossibleCombinations(arr.slice(1)); // recur with the rest of array
  for (let i = 0; i < allCombinationsOfRest.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      result.push(arr[0][j] + allCombinationsOfRest[i]);
    }
  }
  return result;
};

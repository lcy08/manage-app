export const useName = (companyRef) => {
  const companyPrefix = companyRef.slice(0, 2)
  
  const getPrefix = (name) => {
    const words = name.split(" ");

    let prefix;

    if (words.length >= 2) {
      if (words[words.length - 1][0] === undefined) {
        prefix = words[0][0].toUpperCase() + "X";
      } else {
        prefix =
          words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
      }
    } else {
      const word = words[0];

      if (word[0] === undefined) {
        prefix = "XX";
      } else {
        prefix = word[0].toUpperCase() + (word[1] || "X").toUpperCase();
      }
    }
    return prefix
  }

  const getCode = (prefix, currentCount) => {
    const counter = ((currentCount ?? 0) + 1).toString().padStart(4, "0");
    return companyPrefix + prefix + counter;
  }
  
  return { getPrefix, getCode };
};

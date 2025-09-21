// Fetcher functions
export const postFetcher = (args) => {
  const url = args[0];
  const body = args[1];

  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
};

export const getFetcher = (...args) => fetch(...args).then((res) => res.json());

// Validation
export const validateArray = (
  DATA,
  dataKey,
  formattedFilters,
  filterKey,
  filterParamVal
) => {
  const filterArr = filterParamVal.split(",");
  const parsedArr = [...formattedFilters[filterKey]];
  filterArr.map((val) => {
    const exist = DATA.some(
      (data) => data[dataKey].toLowerCase() === val.toLowerCase()
    );
    const alreadyAdded = parsedArr.some(
      (filterVal) => filterVal.toLowerCase() === val.toLowerCase()
    );
    if (exist && !alreadyAdded) {
      parsedArr.push(val);
    }
  });

  return parsedArr;
};

export const validateNumber = (value, min, max) => {
  const formattedVal = Number(value);
  if (isNaN(value) || formattedVal < min || formattedVal > max) {
    return min;
  }
  return formattedVal;
};

export const validateID = (value, DATA, dataKey) => {
  const exist = DATA.some((data) => data[dataKey] === value);
  if (!exist) return "";

  return value;
};

export const validateBoolean = (value) => {
  const parsedValue = JSON.parse(value);
  if (typeof parsedValue !== "boolean") return false;

  return parsedValue;
};

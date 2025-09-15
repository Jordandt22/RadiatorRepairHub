// Fetcher function
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

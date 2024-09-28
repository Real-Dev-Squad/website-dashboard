// Utility functions
const parseProfileDiffParams = (uri, nextPageParamsObject) => {
  const urlSearchParams = new URLSearchParams(uri);
  for (const [key, value] of urlSearchParams.entries()) {
    nextPageParamsObject[key] = value;
  }
  return nextPageParamsObject;
};

const generateProfileDiffsParams = (nextPageParams, forApi = true) => {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(nextPageParams)) {
    if (!value) continue;
    urlSearchParams.append(key, value);
  }
  return `/${
    forApi ? 'profileDiffs' : 'profile-diffs'
  }?${urlSearchParams.toString()}`;
};

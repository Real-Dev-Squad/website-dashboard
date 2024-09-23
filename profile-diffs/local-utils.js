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

const getProfileDiffs = async (query = {}, nextLink) => {
  const finalUrl =
    API_BASE_URL +
    (nextLink || generateProfileDiffsParams({ ...query, dev: true }));
  const res = await fetch(finalUrl, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  if (res.status === 401) {
    return { notAuthorized: true };
  }
  return await res.json();
};

const users = {};

const getUser = async (userId) => {
  if (users[userId]) {
    return users[userId];
  }
  const userResponse = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const { user } = await userResponse.json();
  users[userId] = user;
  return user;
};

async function getActivityFeedData(query = {}, nextLink) {
  let finalUrl =
    API_BASE_URL + (nextLink || await  generateActivityFeedParams(query));

  const res = await fetch(finalUrl, {
    credentials: 'include',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
    },
  });
  return await res.json();
}

async function generateActivityFeedParams  (nextPageParams)  {
  const queryStringList = QUERY_STRING_PARAMS;
  const urlSearchParams = new URLSearchParams();

  if (queryStringList.length > 0)
    urlSearchParams.append('type', queryStringList.join(','));

  return `/logs?${urlSearchParams.toString()}`;
};
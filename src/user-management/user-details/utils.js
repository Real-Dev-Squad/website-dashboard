async function makeApiCall(
  url,
  method = 'get',
  body = null,
  headers = [],
  options = null,
) {
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      ...options,
    });
    return response;
  } catch (err) {
    console.error(MESSAGE_SOMETHING_WENT_WRONG, err);
    return err;
  }
}

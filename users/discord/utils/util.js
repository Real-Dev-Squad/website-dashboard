export const getUsers = async (tab, lastUserId = null, limit = 20) => {
  let URL = {
    in_discord: `${API_BASE_URL}/users/search/?role=in_discord`,
    verified: `${API_BASE_URL}/users/search/?verified=true`,
  };
  if (lastUserId) {
    URL[tab] += `&last_id=${lastUserId}`;
  }
  URL[tab] += `&limit=${limit}`;

  try {
    const response = await fetch(URL[tab], {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (!response.ok) {
      console.error('Failed to fetch:', response.status, response.statusText);
    }

    const data = await response.json();
    return data.users ?? [];
  } catch (err) {
    console.error(err);
  }
};

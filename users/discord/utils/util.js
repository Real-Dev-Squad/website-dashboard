export const getUsers = async (tab) => {
  let URL = {
    in_discord: `${API_BASE_URL}/users/search/?role=in_discord`,
    verified: `${API_BASE_URL}/users/search/?verified=true`,
  };

  try {
    const response = await fetch(URL[tab], {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });

    const data = await response.json();
    return data.users ?? [];
    
  } catch (err) {
    console.error(err);
  }
};

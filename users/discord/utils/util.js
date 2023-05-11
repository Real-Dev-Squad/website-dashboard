export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/inDiscord`, {
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

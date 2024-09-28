const getProfileDiff = async (id) => {
  try {
    const finalUrl = `${API_BASE_URL}/profileDiffs/${id}`;
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
    if (res.status === 404) {
      return { profileDiffExist: false };
    }
    return { profileDiffExist: true, ...(await res.json()).profileDiff };
  } catch (err) {
    throw err;
  }
};

const fetchUser = async (userId) => {
  try {
    const userResponse = await fetch(`${API_BASE_URL}/users?id=${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    if (userResponse.status === 404) {
      return { userExist: false };
    }
    const { user } = await userResponse.json();
    return { ...user, userExist: true };
  } catch (err) {
    throw err;
  }
};

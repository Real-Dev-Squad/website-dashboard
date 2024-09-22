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

function getDataItem(data, itemName) {
  const item = data[itemName];

  if (item) {
    return item;
  } else {
    if (itemName === YEARS_OF_EXPERIENCE && item === 0) return item;
    else return '';
  }
}

function checkDifferentValues(primaryData, secondaryData) {
  const diffValues = new Set();

  for (const listItem in primaryData) {
    const oldValue = getDataItem(primaryData, listItem);
    const newValue = getDataItem(secondaryData, listItem);
    const isValueEqual = String(oldValue).trim() === String(newValue).trim();

    if (!isValueEqual) {
      diffValues.add(listItem);
    }
  }

  return diffValues;
}

function wantedData(data) {
  const {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  } = data;
  return {
    id,
    first_name,
    last_name,
    email,
    phone,
    yoe,
    company,
    designation,
    github_id,
    linkedin_id,
    twitter_id,
    instagram_id,
    website,
  };
}

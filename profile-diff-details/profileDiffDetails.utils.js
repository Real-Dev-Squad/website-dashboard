function getUserDataItem(data, itemName) {
  const item = data[itemName];

  if (item || (itemName === YEARS_OF_EXPERIENCE && item === 0)) {
    return item;
  }

  return '';
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

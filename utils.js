async function getSelfUser() {
  const res = await fetch(`${API_BASE_URL}/users/self`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-type': 'application/json',
    },
  });
  const self_user = await res.json();
  if (res.status === 200) {
    return self_user;
  }
}

async function checkUserIsSuperUser() {
  const self_user = await getSelfUser();
  return self_user?.roles['super_user'];
}

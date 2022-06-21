import { SUPER_USER } from 'constants.js';

import {
  getProfileDiffs,
  getSelfUser,
  getUser,
  wantedData,
  createCard,
} from './utils.js';

const self_user = await getSelfUser();

if (self_user?.roles[SUPER_USER]) {
  const { profileDiffs } = await getProfileDiffs();
  if (profileDiffs === undefined || profileDiffs.length === 0) {
    document.getElementById('loader').innerHTML = 'No Profile Diffs !!!';
  } else {
    profileDiffs.forEach(async (profileDiff) => {
      const { userId } = profileDiff;

      const user = await getUser(userId);
      const { username } = user;

      const { id, ...oldData } = wantedData(user);
      const { id: profileDiffId, ...newData } = wantedData(profileDiff);

      createCard({ oldData, newData, userId, username, profileDiffId });
    });
  }
} else {
  document.getElementById('loader').innerHTML = 'You are not authorized !';
}

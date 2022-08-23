import { SUPER_USER } from './constants.js';

import {
  getProfileDiffs,
  getSelfUser,
  getUser,
  wantedData,
  createCard,
} from './utils.js';

// const self_user = await getSelfUser();
const self_user = {
  id: '7U9zxE3YI1HheyJ4VOJk',
  github_id: 'vin18',
  last_name: 'Raut',
  picture: {
    url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1661023015/profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1.png',
    publicId: 'profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1',
  },
  username: 'vinitraut ',
  github_display_name: 'Vinit Raut',
  linkedin_id: 'vinit-raut-404651148',
  roles: {
    archived: false,
  },
  incompleteUserDetails: false,
  first_name: 'Vinit ',
  yoe: 1,
  website: 'https://www.vinit.tech/',
  twitter_id: 'vinitraut18',
};

if (true || self_user?.roles[SUPER_USER]) {
  // const { profileDiffs } = await getProfileDiffs();
  const profileOldDiffs = [
    {
      id: '7U9zxE3YI1HheyJ4VOJk',
      userId: '7U9zxE3YI1HheyJ4VOJk',
      github_id: 'vin18',
      last_name: 'Raut',
      picture: {
        url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1661023015/profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1.png',
        publicId: 'profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1',
      },
      username: 'vinitraut ',
      github_display_name: 'Vinit Raut',
      linkedin_id: 'vinit-raut-404651148',
      roles: {
        archived: false,
      },
      incompleteUserDetails: false,
      first_name: 'Vinit ',
      yoe: 1,
      website: 'https://www.vinit.tech/',
      twitter_id: 'vinitraut18',
    },
  ];

  const profileNewDiffs = [
    {
      id: '7U9zxE3YI1HheyJ4VOJk',
      userId: '7U9zxE3YI1HheyJ4VOJk',
      github_id: 'vin18',
      last_name: 'Rauttt',
      picture: {
        url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1661023015/profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1.png',
        publicId: 'profile/7U9zxE3YI1HheyJ4VOJk/eziwyjsj5cv2yuznx4n1',
      },
      username: 'vinitraut ',
      github_display_name: 'Vinit Raut',
      linkedin_id: 'vinit-raut-404651148',
      roles: {
        archived: false,
      },
      incompleteUserDetails: false,
      first_name: 'Vinit ',
      yoe: 2,
      website: 'https://www.vinit.tech/',
      twitter_id: 'vinitraut19',
    },
  ];

  // if (profileDiffs === undefined || profileDiffs.length === 0) {
  // document.getElementById('loader').innerHTML = 'No Profile Diffs !!!';
  // } else {
  profileOldDiffs.forEach(async (profileDiff) => {
    const { userId } = profileDiff;

    // const user = await getUser(userId);
    // const { username } = user;

    const { username } = profileDiff;
    // const { id, ...oldData } = wantedData(user);
    const { id, ...oldData } = wantedData(profileDiff);
    const { id: profileDiffId, ...newData } = wantedData(profileNewDiffs[0]);

    createCard({ oldData, newData, userId, username, profileDiffId });
  });
}
// } else {
// document.getElementById('loader').innerHTML = 'You are not authorized !';
// }

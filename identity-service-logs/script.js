import {
  getIdentityLogs,
  getIsSuperUser,
  fillData,
  getUserCount,
} from './utils.js';

const { isSuperUser } = await getIsSuperUser();

if (isSuperUser) {
  const {
    verifiedUsersCount,
    blockedUsersCount,
    verifiedDeveloperCount,
    blockedDeveloperCount,
    developersLeftToVerifyCount,
    developersCount,
  } = await getUserCount();
  document.getElementById('verified').innerText = verifiedUsersCount;
  document.getElementById('blocked').innerText = blockedUsersCount;
  document.getElementById('developers').innerText = developersCount;
  document.getElementById('verifiedDevelopers').innerText =
    verifiedDeveloperCount;
  document.getElementById('blockedDevelopers').innerText =
    blockedDeveloperCount;
  document.getElementById('developersLeft').innerText =
    developersLeftToVerifyCount;
  const { identityLogs, next, prev } = await getIdentityLogs(
    '/logs?dev=true&type=PROFILE_BLOCKED,PROFILE_VERIFIED,PROFILE_DIFF_REJECTED,PROFILE_DIFF_APPROVED,PROFILE_DIFF_STORED&size=10',
  );
  fillData(identityLogs, next, prev);
} else {
  document.getElementById('loader').innerHTML = 'You are not authorized !';
}

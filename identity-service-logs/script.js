import {
  getIdentityLogs,
  getIsSuperUser,
  fillData,
  getUserCount,
  addIntersectionObserver,
} from './utils.js';

const { isSuperUser } = await getIsSuperUser();
const params = new URLSearchParams(window.location.search);

if (isSuperUser && params.has('dev') && params.get('dev') === 'true') {
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
  const { identityLogs, next } = await getIdentityLogs(
    '/logs?dev=true&type=PROFILE_BLOCKED,PROFILE_VERIFIED,PROFILE_DIFF_REJECTED,PROFILE_DIFF_APPROVED,PROFILE_DIFF_STORED&size=10',
  );
  fillData(identityLogs, next);
  addIntersectionObserver();
} else {
  document.getElementById('loader').innerHTML = 'You are not authorized !';
}

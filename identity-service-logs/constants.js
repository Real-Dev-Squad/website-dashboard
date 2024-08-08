export const SUPER_USER = 'super_user';
export const BORDER_COLOR = {
  PROFILE_VERIFIED: 'blue',
  PROFILE_BLOCKED: 'orangered',
  PROFILE_DIFF_REJECTED: 'red',
  PROFILE_DIFF_APPROVED: 'green',
  PROFILE_DIFF_STORED: '#ADD8E6',
};

export const TYPE_NAME = {
  PROFILE_VERIFIED: 'PROFILE SERVICE VERIFIED',
  PROFILE_BLOCKED: 'PROFILE SERVICE BLOCKED',
  PROFILE_DIFF_REJECTED: 'PROFILE DIFFERENCE REJECTED',
  PROFILE_DIFF_APPROVED: 'PROFILE DIFFERENCE APPROVED',
  PROFILE_DIFF_STORED: 'PROFILE DIFFERENCE STORED',
};

export const TYPE_DESCRIPTION = {
  PROFILE_VERIFIED: ({ username }) =>
    `${username}'s profile has been verified and is now officially authenticated.`,
  PROFILE_BLOCKED: ({ username, reason }) =>
    `${username}'s profile has been blocked. ${
      reason ? `Reason provided: "${reason}."` : 'No reason provided!'
    }`,
  PROFILE_DIFF_REJECTED: ({ username, adminUserName, profileDiffId, reason }) =>
    `${adminUserName} rejected a profile update request for ${username}. The request with Profile Diff ID ${profileDiffId} was declined due to: "${
      reason || ''
    }"`,
  PROFILE_DIFF_APPROVED: ({ username, adminUserName, profileDiffId, reason }) =>
    `${adminUserName} approved a profile update request for ${username}. The changes are now live. The request has a Profile Diff ID ${profileDiffId}. Message: "${
      reason || ''
    }"`,
  PROFILE_DIFF_STORED: ({ username }) =>
    `${username}'s profile changes have been saved for further review.`,
};

export const BACKGROUND_COLOR = {
  PROFILE_VERIFIED: 'rgba(0,0,255,0.2)',
  PROFILE_BLOCKED: 'rgba(255,69,0,0.2)',
  PROFILE_DIFF_REJECTED: 'rgba(255,0,0,0.2)',
  PROFILE_DIFF_APPROVED: 'rgba(0,128,0,0.2)',
  PROFILE_DIFF_STORED: 'rgb(173,216,230,0.2)',
};

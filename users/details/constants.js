const defaultAvatar = '../images/profile.svg';
const socialMedia = ['twitter_id', 'github_id', 'linkedin_id'];
const iconMapper = {
  twitter_id: {
    alt: 'twitter',
    src: '../images/twitter.svg',
    href: 'https://twitter.com',
  },
  github_id: {
    alt: 'github',
    src: '../images/github.svg',
    href: 'https://github.com',
  },
  linkedin_id: {
    alt: 'linkedIn',
    src: '../images/linkedin.svg',
    href: 'https://linkedin.com/in',
  },
};

const MESSAGE_NOT_FOUND = 'Not Found';
const MESSAGE_YEARS_OF_EXPERIENCE = 'Years of Experience';
const noProgressbarStatuses = ['COMPLETED', 'DONE', 'VERIFIED'];
const READABLE_STATUS = {
  UN_ASSIGNED: 'Unassigned',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  BLOCKED: 'Blocked',
  COMPLETED: 'Completed',
  NEEDS_REVIEW: 'Needs Review',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  SMOKE_TESTING: 'Smoke Testing',
  SANITY_CHECK: 'Sanity Check',
  REGRESSION_CHECK: 'Regression Check',
  MERGED: 'Merged',
  RELEASED: 'Released',
  VERIFIED: 'Verifed',
  DONE: 'Done',
};

// GLOBAL CONSTANTS  ====================================================================================================
const API_BASE_URL = 'https://api.realdevsquad.com';
const USER_MANAGEMENT_LINK = 'user-management-link';
const EXTENSION_REQUESTS_LINK = 'extension-requests-link';
const dummyPicture =
  'https://dashboard.realdevsquad.com/users/images/avatar.png';
const USER_MANAGEMENT_URL =
  'https://dashboard.realdevsquad.com/users/details/?username=';

// USERS CONSTANTS  ====================================================================================================
const RDS_API_USERS = `${API_BASE_URL}/users`;
const RDS_API_SKILLS = `${API_BASE_URL}/tags`;
const USER_LIST_ELEMENT = 'user-list';
const LOADER_ELEMENT = 'loader';
const TILE_VIEW_BTN = 'tile-view-btn';
const TABLE_VIEW_BTN = 'table-view-btn';
const USER_SEARCH_ELEMENT = 'user-search';
const DEFAULT_AVATAR = '/users/images/avatar.png';
const PAGINATION_ELEMENT = 'pagination';
const PREV_BUTTON = 'prevButton';
const NEXT_BUTTON = 'nextButton';
const USER_FETCH_COUNT = 100;
const NONE = 'NONE';
const OOO = 'OOO';
const ACTIVE = 'ACTIVE';
const IDLE = 'IDLE';
const FILTER_MODAL = 'filter-modal';
const FILTER_BUTTON = 'filter-button';
const AVAILABILITY_FILTER = 'filter-by-avaviability';
const APPLY_FILTER_BUTTON = 'apply-filter-button';
const CLEAR_BUTTON = 'clear-button';
const STATUS_LIST = ['ooo', 'active', 'idle'];

// USERS/DETAILS CONSTANTS  ====================================================================================================
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

// PROFILE CONSTANTS  ====================================================================================================
const YEARS_OF_EXPERIENCE = 'yoe';
const SUPER_USER = 'super_user';
const APPROVE_BUTTON_TEXT = 'Approve';
const REJECT_BUTTON_TEXT = 'Reject';
const APPROVAL_PROMPT_TEXT = 'Reason for Approval';
const ALERT_APPROVED = 'User Data Approved !!!';
const ALERT_ERROR = 'Something went wrong. Please check console errors.';
const ALERT_REJECTED = 'User Data Rejected!!!';
const OLD_DATA = 'old-data';
const NEW_DATA = 'new-data';
const DIFF_CLASS = 'diff';
const OLD_DIFF_CLASS = 'oldDiff';
const NEW_DIFF_CLASS = 'newDiff';

// ONLINE-MEMBERS CONSTANTS  ====================================================================================================
('use strict');
// Members Constants
const MEMBERS_CLASS = 'members';
const MEMBERS_CLASS_LIST = [MEMBERS_CLASS];
const MEMBERS_UL_CLASS_LIST = ['members-list'];
const MEMBERS_LIST_ID = 'members-list';
const MEMBERS_CONTAINER_CLASS_LIST = ['members-container'];
const MEMBERS_CONTAINER_ID = 'members-container';
const MEMBERS_ONLINE_CLASS = 'members-online';
const MEMBERS_ONLINE_HIDDEN_CLASS = 'members-online-hidden';
const MEMBERS_ONLINE_CLASS_LIST = [
  MEMBERS_ONLINE_CLASS,
  MEMBERS_ONLINE_HIDDEN_CLASS,
];

const PROFILE_NAME_CLASS = 'members-profile-and-name';
const PROFILE_NAME_CLASS_LIST = [PROFILE_NAME_CLASS];

// Members Search Constants
const MEMBERS_SEARCH_CLASS_LIST = ['members-search'];
const MEMBERS_SEARCH_INPUT_CLASS_LIST = ['members-search-input'];
const MEMBERS_SEARCH_ID = 'search-members';
const MEMBERS_SEARCH_PLACEHOLDER = 'Search for members';

// Task Constants
const TASKS_CONTAINER_ID = 'task-container';
const TASKS_CLASS_LIST = ['task'];
const TASKS_CONTAINER_CLASS_LIST = ['tasks-container'];

// RDS Api Constants
const RDS_API_MEMBERS = API_BASE_URL + '/members';
const RDS_API_TASKS_USERS = API_BASE_URL + '/tasks';
const RDS_CLOUDINARY_CLOUD_URL = `https://res.cloudinary.com/realdevsquad/image/upload`;

const RDS_SSE_ONLINE_URL = 'https://online.realdevsquad.com/online-members';

// Image Size constants
const RDS_PROFILE_IMAGE_SIZE = 'w_40,h_40';
const RDS_PROFILE_DEFAULT_IMAGE = '';

const PROFILE_IMAGE_CLASS = 'members-profile';
const PROFILE_IMAGE_CLASS_LIST = [PROFILE_IMAGE_CLASS];

/* MESSAGES CONSTANTS */
const MESSAGE_SOMETHING_WENT_WRONG =
  'Something went wrong. Please contact admin';
const MESSAGE_NO_TASK = 'No tasks found, create some for them please :P';
const MESSAGE_LOADING = 'LOADING...';

// EXTENSION-REQUESTS CONSTANTS  ====================================================================================================
const taskInfoModelHeadings = [
  { title: 'Title' },
  { title: 'Ends On', key: 'endsOn', time: true },
  { title: 'Purpose' },
  { title: 'Assignee' },
  { title: 'Created By', key: 'createdBy' },
  { title: 'Is Noteworthy', key: 'isNoteworthy' },
];

const extensionRequestCardHeadings = [
  { title: 'Title' },
  { title: 'Reason' },
  { title: 'Old Ends On', key: 'oldEndsOn', time: true },
  { title: 'New Ends On', key: 'newEndsOn', time: true },
  { title: 'Status', bold: true },
  { title: 'Assignee' },
  { title: 'Created At', key: 'timestamp', time: true },
  { title: 'Task', key: 'taskId' },
];

// DISCORD-GROUPS CONSTANTS  ====================================================================================================
const NO_SPACES_ALLOWED = 'Roles cannot have spaces';
const CANNOT_CONTAIN_GROUP = "Roles cannot contain 'group'.";

'use strict';

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
const TASKS_SUBCONTAINER_CLASS_LIST = ['task-subcontainer'];
const TASKS_CONTAINER_TITLE_CLASS_LIST = ['task-container-title'];
const TASKS_CLASS_LIST = ['task'];
const TASKS_CONTAINER_CLASS_LIST = ['tasks-container'];

// RDS Api Constants
const RDS_API_MEMBERS = API_BASE_URL + '/users';
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

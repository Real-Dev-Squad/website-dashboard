'use strict';

// Users Constants
const USERS_CLASS = 'users';
const USERS_CLASS_LIST = [USERS_CLASS];
const USERS_UL_CLASS_LIST = ['users-list'];
const USERS_LIST_ID = 'users-list';
const USERS_CONTAINER_CLASS_LIST = ['users-container'];
const USERS_CONTAINER_ID = 'users-container';
const USERS_ONLINE_CLASS = 'users-online';
const USERS_ONLINE_HIDDEN_CLASS = 'users-online-hidden';
const USERS_ONLINE_CLASS_LIST = [USERS_ONLINE_CLASS, USERS_ONLINE_HIDDEN_CLASS];

const PROFILE_NAME_CLASS = 'users-profile-and-name';
const PROFILE_NAME_CLASS_LIST = [PROFILE_NAME_CLASS];

// Users Search Constants
const USERS_SEARCH_CLASS_LIST = ['users-search'];
const USERS_SEARCH_INPUT_CLASS_LIST = ['users-search-input'];
const USERS_SEARCH_ID = 'search-users';
const USERS_SEARCH_PLACEHOLDER = 'Search for users';

// Task Constants
const TASKS_CONTAINER_ID = 'task-container';
const TASKS_SUBCONTAINER_CLASS_LIST = ['task-subcontainer'];
const TASKS_CONTAINER_TITLE_CLASS_LIST = ['task-container-title'];
const TASKS_CLASS_LIST = ['task'];
const TASKS_CONTAINER_CLASS_LIST = ['tasks-container'];

// RDS Api Constants
const RDS_API_USERS = API_BASE_URL + '/users';
const RDS_API_TASKS_USERS = API_BASE_URL + '/tasks';
const RDS_CLOUDINARY_CLOUD_URL = `https://res.cloudinary.com/realdevsquad/image/upload`;

const RDS_SSE_ONLINE_URL = 'https://online.realdevsquad.com/online-members';

// Image Size constants
const RDS_PROFILE_IMAGE_SIZE = 'w_40,h_40';
const RDS_PROFILE_DEFAULT_IMAGE = '';

const PROFILE_IMAGE_CLASS = 'users-profile';
const PROFILE_IMAGE_CLASS_LIST = [PROFILE_IMAGE_CLASS];

/* MESSAGES CONSTANTS */
const MESSAGE_SOMETHING_WENT_WRONG =
  'Something went wrong. Please contact admin';
const MESSAGE_NO_TASK = 'No tasks found, create some for them please :P';
const MESSAGE_LOADING = 'LOADING...';

const ACITIVITY_FEED_CONTAINER = 'activity_feed_container';

const logType = {
  PROFILE_DIFF_APPROVED: 'PROFILE_DIFF_APPROVED',
  PROFILE_DIFF_REJECTED: 'PROFILE_DIFF_REJECTED',
  REQUEST_CREATED: 'REQUEST_CREATED',
  REQUEST_APPROVED: 'REQUEST_APPROVED',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  REQUEST_BLOCKED: 'REQUEST_BLOCKED',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',
  TASK: 'task',
  TASK_REQUESTS: 'taskRequests',
  EXTENSION_REQUESTS: 'extensionRequests',
};

const CATEGORY = {
  ALL: 'all',
  OOO: 'ooo',
  TASK: 'task',
  TASK_REQUESTS: 'taskRequests',
  EXTENSION_REQUESTS: 'extensionRequests',
};

const LAST_ELEMENT_CONTAINER = '.virtual';

const ERROR_MESSAGE = {
  UNAUTHENTICATED:
    'You are unauthenticated to view this section, please login!',
  UNAUTHORIZED: 'You are unauthorized to view this section',
  LOGS_NOT_FOUND: 'No logs found',
  SERVER_ERROR: 'Unexpected error occurred',
};

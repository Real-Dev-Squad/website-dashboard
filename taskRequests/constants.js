const taskRequestStatus = {
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
};
const DEV_FEATURE_FLAG = 'dev';

const FILTER_MODAL = 'filter-modal';
const FILTER_BUTTON = 'filter-button';
const APPLY_FILTER_BUTTON = 'apply-filter-button';
const SEARCH_ELEMENT = 'assignee-search';
const SORT_BUTTON = '.sort-button';
const OLD_FILTER = '.container__filters';
const FILTER_CONTAINER = '.sort-filters';
const SORT_MODAL = 'sort-modal';
const ASSIGNEE_COUNT = 'ASSIGNEE_COUNT';
const ASSIGNEE_Desc = 'ASSIGNEE_COUNT-desc';
const CREATED_TIME = 'CREATED_TIME';
const CREATED_TIME_Desc = 'CREATED_TIME-desc';

const MessageStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const ErrorMessages = {
  UNAUTHENTICATED:
    'You are unauthenticated to view this section, please login!',
  UNAUTHORIZED: 'You are unauthrozed to view this section',
  NOT_FOUND: 'Task Requests not found',
  SERVER_ERROR: 'Unexpected error occurred',
};

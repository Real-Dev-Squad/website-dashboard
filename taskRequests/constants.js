const taskRequestStatus = {
  WAITING: 'WAITING',
  APPROVED: 'APPROVED',
};
const DEV_FEATURE_FLAG = 'dev';
const DEFAULT_PAGE_SIZE = 20;
const Status = {
  APPROVED: 'approved',
  PENDING: 'pending',
  DENIED: 'denied',
};

const Order = {
  REQUESTORS_COUNT_ASC: { requestors: 'asc' },
  REQUESTORS_COUNT_DESC: { requestors: 'desc' },
  CREATED_TIME_DESC: { created: 'desc' },
  CREATED_TIME_ASC: { created: 'asc' },
};

const FILTER_MODAL = 'filter-modal';
const FILTER_BUTTON = 'filter-button';
const APPLY_FILTER_BUTTON = 'apply-filter-button';
const SEARCH_ELEMENT = 'assignee-search';
const SORT_BUTTON = '.sort-button';
const CLEAR_BUTTON = 'clear-button';
const FILTER_CONTAINER = '.sort-filters';
const SORT_MODAL = 'sort-modal';
const ASSIGNEE_COUNT = 'REQUESTORS_COUNT_ASC';
const ASSIGNEE_DESC = 'REQUESTORS_COUNT_DESC';
const CREATED_TIME = 'CREATED_TIME_ASC';
const CREATED_TIME_DESC = 'CREATED_TIME_DESC';
const BACKDROP = '.backdrop';
const LAST_ELEMENT_CONTAINER = '.virtual';

const MessageStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const TaskRequestAction = {
  APPROVE: 'approve',
  REJECT: 'reject',
};
const ErrorMessages = {
  UNAUTHENTICATED:
    'You are unauthenticated to view this section, please login!',
  UNAUTHORIZED: 'You are unauthrozed to view this section',
  NOT_FOUND: 'Task Requests not found',
  SERVER_ERROR: 'Unexpected error occurred',
};

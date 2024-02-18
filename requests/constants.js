const DEV_FEATURE_FLAG = true;
const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const LAST_ELEMENT_CONTAINER = '.virtual';
const REQUEST_ACTION_BUTTON = 'request-action-button';
const SEARCH_BUTTON_ID = 'search_button';
const SORT_DROPDOWN_ID = 'sort_by';
const STATUS_DROPDOWN_ID = 'status';
const OOO_CONTAINER_ID = 'ooo-request-container';

const MessageStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const ErrorMessages = {
  UNAUTHENTICATED:
    'You are unauthenticated to view this section, please login!',
  UNAUTHORIZED: 'You are unauthrozed to view this section',
  NOT_FOUND: 'OOO Requests not found',
  SERVER_ERROR: 'Unexpected error occurred',
};

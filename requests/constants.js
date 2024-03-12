const DEV_FEATURE_FLAG = true;
const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const OOO_REQUEST_TYPE = 'OOO';
const REQUEST_CONTAINER_ID = 'request_container';
const OOO_TAB_ID = 'ooo_tab_link';

const DEFAULT_DATE_FORMAT = 'DD MMM YYYY';

const MessageStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

const ErrorMessages = {
  UNAUTHENTICATED:
    'You are unauthenticated to view this section, please login!',
  UNAUTHORIZED: 'You are unauthrozed to view this section',
  OOO_NOT_FOUND: 'OOO Requests not found',
  SERVER_ERROR: 'Unexpected error occurred',
};

const LAST_ELEMENT_CONTAINER = '.virtual';

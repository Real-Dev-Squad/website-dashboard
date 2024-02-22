const DEV_FEATURE_FLAG = true;
const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const OOO_REQUEST_TYPE = 'OOO';
const TASK_REQUEST_TYPE = 'TASK';
const EXTENSION_REQUEST_TYPE = 'EXTENSION';
const SORT_DROPDOWN_ID = 'sort_by';
const STATUS_DROPDOWN_ID = 'status';
const REQUEST_CONTAINER_ID = 'request_container';
const STATUS_ARROW_ICON_ID = 'status_arrow_icon';
const SORT_ARROW_ICON_ID = 'sort_arrow_icon';
const STATUS_DROPDOWN_DIV_ID = 'status_dropdown_div';
const SORT_DROPDOWN_DIV_ID = 'sort_dropdown_div';
const OOO_TAB_ID = 'ooo_tab_link';
const TASK_TAB_ID = 'task_tab_link';
const EXTENSION_TAB_ID = 'extension_tab_link';

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

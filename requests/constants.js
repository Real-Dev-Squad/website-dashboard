const DEV_FEATURE_FLAG = true;
const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const OOO_REQUEST_TYPE = 'OOO';
const TASK_REQUEST_TYPE = 'TASK';
const EXTENSION_REQUEST_TYPE = 'EXTENSION';
const REQUEST_CONTAINER_ID = 'request_container';
const EXTENSION_CONTAINER_ID = 'extension_container';
const OOO_TAB_ID = 'ooo_tab_link';
const TASK_TAB_ID = 'task_tab_link';
const EXTENSION_TAB_ID = 'extension_tab_link';
const SEARCH_FILTER_CONTAINER = 'search_filter_container'
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


const DEFAULT_AVATAR = '/images/avatar.png';
const EXTERNAL_LINK_ICON = '/images/external-link.svg';
const DOWN_ARROW_ICON = '/images/chevron-down.svg';
const CHECK_ICON = '/images/check-icon.svg';
const CHECK_ICON_WHITE = '/images/check-icon-white.svg';
const CANCEL_ICON = '/images/x-icon.svg';
const CANCEL_ICON_WHITE = '/images/x-icon-white.svg';
const EDIT_ICON = '/images/edit-icon.svg';
const ERROR_MESSAGE_RELOAD = 'Something went wrong, Please reload';

const DEFAULT_PAGE_SIZE = 5;

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

const FILTER_MODAL = 'filter-modal';
const FILTER_BUTTON = 'filter-button';
const APPLY_FILTER_BUTTON = 'apply-filter-button';
const CLEAR_BUTTON = 'clear-button';
const SEARCH_ELEMENT = 'assignee-search';
const SORT_BUTTON = '.sort-button';
const SORT_ASC_ICON = 'asc-sort-icon';
const SORT_DESC_ICON = 'desc-sort-icon';
const OLDEST_FIRST = 'Oldest first';
const NEWEST_FIRST = 'Newest first';

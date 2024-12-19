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
const LAST_ELEMENT_CONTAINER = '.virtual';
const SORT_BUTTON = '.sort-button';
const SORT_ASC_ICON = 'asc-sort-icon';
const SORT_DESC_ICON = 'desc-sort-icon';
const OLDEST_FIRST = 'Oldest first';
const NEWEST_FIRST = 'Newest first';

const UPDATE_TOAST_TIMING = 3000;

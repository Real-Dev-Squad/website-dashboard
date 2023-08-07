const ERROR_MESSAGE_RELOAD = 'Something went wrong, Please reload';
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

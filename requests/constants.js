const DEV_FEATURE_FLAG = true;
const Status = {
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
};

const SORT_DROPDOWN_ID = 'sort_by';
const STATUS_DROPDOWN_ID = 'status';
const REQUEST_CONTAINER_ID = 'request_container';

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

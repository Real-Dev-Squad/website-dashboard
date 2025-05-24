const CARD_REMOVAL_INITIAL_DELAY_MS = 800;
const CARD_REMOVAL_ANIMATION_DURATION_MS = 800;
const CARD_REMOVAL_ANIMATION_EASING = 'ease-out';
const DEADLINE_WARNING_THRESHOLD_DAYS = 3;

const ICONS = Object.freeze({
  DEFAULT_USER_AVATAR: '/images/avatar.png',
  EDIT: '/images/edit-icon.svg',
  CANCEL: '/images/x-icon.svg',
  CANCEL_WHITE: '/images/x-icon-white.svg',
  CHECK: '/images/check-icon.svg',
  CHECK_WHITE: '/images/check-icon-white.svg',
  ARROW_DOWN: '/images/chevron-down-black.svg',
});

const REQUEST_STATUS = Object.freeze({
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
  REJECTED: 'REJECTED',
});

const REQUEST_TYPE = Object.freeze({
  EXTENSION: 'EXTENSION',
  OOO: 'OOO',
  ONBOARDING: 'ONBOARDING',
});

const ERROR_MESSAGE = Object.freeze({
  UPDATE_REQUEST: 'Error updating request',
  DATE_INPUT_ERROR: 'Invalid date format. Please provide a valid date.',
  DEADLINE_PASSED: "Past date can't be the new deadline.",
});

const SUCCESS_MESSAGE = Object.freeze({
  APPROVED_MESSAGE: 'Request approved successfully',
  REJECTED_MESSAGE: 'Request rejected successfully',
});

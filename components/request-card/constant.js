const CARD_REMOVAL_INITIAL_DELAY_MS = 800;
const CARD_REMOVAL_ANIMATION_DURATION_MS = 800;
const CARD_REMOVAL_ANIMATION_EASING = 'ease-out';
const DEADLINE_WARNING_THRESHOLD_DAYS = 3;
const DEFAULT_USER_AVATAR = '/images/avatar.png';
const ICON_EDIT = '/images/edit-icon.svg';
const ICON_CANCEL = '/images/x-icon.svg';
const ICON_CANCEL_WHITE = '/images/x-icon-white.svg';
const ICON_CHECK = '/images/check-icon.svg';
const ICON_CHECK_WHITE = '/images/check-icon-white.svg';
const ICON_ARROW_DOWN = '/images/chevron-down-black.svg';

const RequestStatus = Object.freeze({
  APPROVED: 'APPROVED',
  PENDING: 'PENDING',
  DENIED: 'DENIED',
  REJECTED: 'REJECTED',
});

const RequestType = Object.freeze({
  EXTENSION: 'EXTENSION',
  OOO: 'OOO',
  ONBOARDING: 'ONBOARDING',
});

const ErrorMessage = Object.freeze({
  UPDATE_REQUEST: 'Error updating request',
  DATE_INPUT_ERROR: 'Invalid date format. Please provide a valid date.',
  DEADLINE_PASSED: "Past date can't be the new deadline.",
});

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
const SUCCESS_MESSAGE = 'Request updated successfully';
const APPROVED_MESSAGE = 'Request approved successfully';
const REJECTED_MESSAGE = 'Request rejected successfully';
const HOVER_CARD_HIDE_DELAY = 700;

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
});

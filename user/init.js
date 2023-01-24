const {
  RDS_API_USERS,
  USER_LIST_ELEMENT,
  LOADER_ELEMENT,
  TILE_VIEW_BTN,
  TABLE_VIEW_BTN,
  USER_SEARCH_ELEMENT,
  DEFAULT_AVATAR,
  PAGINATION_ELEMENT,
  PREV_BUTTON,
  NEXT_BUTTON,
  USER_FETCH_COUNT,
} = require('./constants');
const { init, showUserDataList } = require('./script');
// const { makeApiCall, debounce } = require('./utils');

const userListElement = document.getElementById(USER_LIST_ELEMENT);
const loaderElement = document.getElementById(LOADER_ELEMENT);
const tileViewBtn = document.getElementById(TILE_VIEW_BTN);
const tableViewBtn = document.getElementById(TABLE_VIEW_BTN);
const userSearchElement = document.getElementById(USER_SEARCH_ELEMENT);
const paginationElement = document.getElementById(PAGINATION_ELEMENT);
const prevBtn = document.getElementById(PREV_BUTTON);
const nextBtn = document.getElementById(NEXT_BUTTON);

init(
  prevBtn,
  nextBtn,
  tileViewBtn,
  tableViewBtn,
  userSearchElement,
  userListElement,
  paginationElement,
  loaderElement,
);
showUserDataList(
  page,
  userListElement,
  paginationElement,
  loaderElement,
  prevBtn,
  nextBtn,
);

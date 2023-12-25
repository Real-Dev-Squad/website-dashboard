const NO_SPACES_ALLOWED = 'Roles cannot have spaces';
const CANNOT_CONTAIN_GROUP = "Roles cannot contain 'group'.";
const DEV_FEATURE_FLAG = 'dev';
const SortByFields = [
  { fieldName: 'memberCount', idx: '1' },
  { fieldName: 'date._seconds', idx: '2' },
];

export {
  SortByFields,
  NO_SPACES_ALLOWED,
  CANNOT_CONTAIN_GROUP,
  DEV_FEATURE_FLAG,
};

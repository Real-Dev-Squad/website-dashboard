window.API_BASE_URL = 'https://api.realdevsquad.com';

if (
  window.location.hostname !== 'dashboard.realdevsquad.com' &&
  window.location.hostname !== 'localhost'
) {
  window.API_BASE_URL = 'https://staging-api.realdevsquad.com';
}

window.location.hostname !== 'dashboard.realdevsquad.com' ||
window.location.hostname !== 'http://localhost:8000'
  ? (window.API_BASE_URL = 'https://staging-api.realdevsquad.com')
  : (window.API_BASE_URL = 'https://api.realdevsquad.com');

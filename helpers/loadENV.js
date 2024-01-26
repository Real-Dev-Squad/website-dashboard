window.API_BASE_URL =
  window.location.hostname !== 'dashboard.realdevsquad.com'
    ? window.location.hostname !== 'localhost'
      ? 'https://staging-api.realdevsquad.com'
      : 'https://api.realdevsquad.com'
    : 'https://api.realdevsquad.com';

window.location.hostname !== 'dashboard.realdevsquad.com'
  ? (window.BASE_URL = 'https://staging-api.realdevsquad.com')
  : (window.BASE_URL = 'https://api.realdevsquad.com');

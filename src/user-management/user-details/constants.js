const API_BASE_URL = 'http://localhost:3000';
const username = 'manish591';
const userDetailsContainer = document.querySelector(
  '.user-details__top-column',
);
const userDetailsList = document.querySelector('.user-details__list');
const userTasksContainer = document.querySelector('.user-tasks');
const userProfessionalDetails = document.querySelector(
  '.user-details__professional',
);
const userDetailsYoe = document.querySelector('.user-details__yoe');
const getPrevTaskButton = document.querySelector('.pagination__prev-page');
const getNextTaskButton = document.querySelector('.pagination__next-page');
const defaultAvatar = '../images/profile.svg';

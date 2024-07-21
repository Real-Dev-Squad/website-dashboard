const DROPDOWN_OPTIONS = [
  {
    name: 'Home',
    link: 'https://dashboard.realdevsquad.com/',
  },
  {
    name: 'Status',
    link: 'https://my.realdevsquad.com/',
  },
  {
    name: 'Profile',
    link: 'https://my.realdevsquad.com/profile',
  },
  {
    name: 'Tasks',
    link: 'https://my.realdevsquad.com/tasks',
  },
  {
    name: 'Identity',
    link: 'https://my.realdevsquad.com/identity',
  },
];

async function handleUserSignin() {
  try {
    const self_user = await getSelfUser();
    if (self_user) {
      const signInButton = document.querySelector('.sign-in-btn');
      signInButton.style.display = 'none';
      const dropdown = document.getElementById('dropdown');
      const userInfo = document.querySelector('.user-info');
      const username = document.getElementById('user-name');
      const userImage = document.getElementById('user-img');
      const tasksNav = document.getElementById('tasksNav');
      username.innerText = `Hello, ${self_user.first_name}!`;
      userImage.setAttribute('src', self_user?.picture?.url);
      userInfo.classList.add('active');
      tasksNav.style.alignItems = 'center';
      const dropdownList = createElement({
        type: 'ul',
        attributes: {
          class: 'dropdown-list',
        },
      });

      DROPDOWN_OPTIONS.forEach((option) => {
        const listElement = createElement({
          type: 'li',
          attributes: {
            class: 'dropdown-item',
          },
        });
        const anchorElement = createElement({
          type: 'a',
          attributes: {
            class: 'dropdown-link',
          },
        });
        anchorElement.href = `${option.link}`;
        anchorElement.innerText = `${option.name}`;
        listElement.append(anchorElement);
        dropdownList.append(listElement);
      });
      const horizontalLine = createElement({
        type: 'hr',
        attributes: {
          class: 'line',
        },
      });

      dropdownList.append(horizontalLine);
      const signOutElement = createElement({
        type: 'li',
        attributes: {
          class: 'dropdown-item',
          id: 'signout-option',
        },
      });
      signOutElement.classList.add('dropdown-link');

      dropdownList.append(signOutElement);
      signOutElement.innerText = 'Sign Out';
      dropdown.append(dropdownList);

      userInfo.addEventListener('click', () => {
        if (dropdown.classList.contains('active')) {
          dropdown.classList.remove('active');
        } else {
          dropdown.classList.add('active');
        }
      });

      signOutElement.addEventListener('click', () => {
        getSelfUser('/auth/signout');
      });
    }
  } catch (error) {}
}

setTimeout(() => handleUserSignin(), 1000);

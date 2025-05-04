const { createElement } = react;
import { LoadingSpinner } from './LoadingSpinner.js';

export const UsersSection = ({
  users,
  showUser,
  handleUserSelected,
  paginateFetchedUsers,
  activeTab,
  currentPage,
  isLoading,
}) => {
  window.addEventListener(
    'scroll',
    debounce(() => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        paginateFetchedUsers(activeTab, currentPage + 1);
      }
    }, 200),
  );

  if (isLoading) {
    return LoadingSpinner();
  }

  return createElement(
    'aside',
    {
      class: 'users_section',
      'data-testid': 'users-section',
    },
    users?.map((user) => {
      return createElement(
        'div',
        {
          class: `user_card ${
            users[showUser].id === user.id ? 'active_tab' : ''
          }`,
          'data-testid': `user-card-${user.id}`,
          'data-key': user.id,
          onclick: () => handleUserSelected(user.id),
        },
        [
          createElement('img', {
            src: user?.picture?.url ?? dummyPicture,
            class: 'user_image',
          }),
          createElement('span', {}, [user.first_name + ' ' + user.last_name]),
        ],
      );
    }),
  );
};

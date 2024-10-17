const { createElement } = react;

export const UsersSection = ({ users, showUser, handleUserSelected }) => {
  if (users.length === 0) {
    return createElement('div', { class: 'users_section no_users' }, [
      createElement('div', {}, ['No users found']),
    ]);
  }

  return createElement(
    'aside',
    {
      class: 'users_section',
      onClick: handleUserSelected,
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

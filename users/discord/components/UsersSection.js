const { createElement } = react;

export const UsersSection = ({
  users,
  showUser,
  handleUserSelected,
  handleScroll,
  isLoading,
}) => {
  return createElement(
    'aside',
    {
      class: 'users_section',
      onclick: handleUserSelected,
      onscroll: handleScroll,
    },
    [
      ...users?.map((user) => {
        return createElement(
          'div',
          {
            class: `user_card ${
              users[showUser].id === user.id ? 'active_tab' : ''
            }`,
            data_key: user.id,
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
      isLoading && createElement('div', 'Load more users...'),
    ],
  );
};

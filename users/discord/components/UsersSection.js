const { createElement } = react;

export const UsersSection = ({ users, showUser, handleUserSelected }) => {
  return createElement(
    'aside',
    { class: 'users_section', onclick: handleUserSelected },
    users?.map((user) => {
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
  );
};

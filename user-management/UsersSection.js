// <script src="/constants.js"></script>
const { createElement } = react;

export const UsersSection = ({ users }) => {
  return createElement(
    'aside',
    { class: 'users_section' },
    users?.map((user) => {
      return createElement(
        'div',
        { class: 'user_card', key: user.id, onclick: () => {} },
        [
          createElement('img', {
            src:
              user?.picture?.url ??
              'https://dashboard.realdevsquad.com/users/images/avatar.png',
            class: 'user_image',
          }),
          createElement('div', {}, [user.first_name + ' ' + user.last_name]),
        ],
      );
    }),
  );
};

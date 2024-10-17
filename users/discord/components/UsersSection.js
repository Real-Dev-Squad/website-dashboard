const { createElement } = react;

export const UsersSection = ({
  users,
  showUser,
  handleUserSelected,
  fetchUsers,
  activeTab,
  currentPage,
  isLoading,
}) => {
  window.addEventListener(
    'scroll',
    debounce(() => {
      console.log('scroll triggered');
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        fetchUsers(activeTab, currentPage + 1);
      }
    }, 200),
  );

  if (isLoading) {
    return createElement('aside', { class: 'users_section' }, [
      createElement('div', { class: 'loading' }, ['Loading...']),
    ]);
  }

  return createElement(
    'aside',
    {
      class: 'users_section',
      onclick: handleUserSelected,
    },
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
          /* will uncomment this once we have actual paginated data from the API  */

          // createElement('span', {}, [
          //   user.first_name + ' ' + user.last_name + user.username,
          // ]),

          /* will remove this once we have actual paginated data from the API  */
          createElement('span', {}, [user.username]),
        ],
      );
    }),
  );
};

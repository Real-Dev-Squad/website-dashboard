const { createElement } = react;

export const UsersSection = ({
  users,
  showUser,
  handleUserSelected,
  fetchMoreUsers,
}) => {
  const handleScroll = (e) => {
    console.log('scroll triggered');

    const container = e.target;
    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop + clientHeight >= scrollHeight - 5) {
      isLoading = true;
      console.log('user scrolling');
      fetchMoreUsers();
    }
  };

  // handle scroll is not working - add event listener on every scroll element
  return createElement(
    'aside',
    {
      class: 'users_section',
      onclick: handleUserSelected,
      onscroll: handleScroll,
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
          // createElement('span', {}, [
          //   user.first_name + ' ' + user.last_name + user.username,
          // ]),
          createElement('span', {}, [user.username]),
        ],
      );
    }),
  );
};

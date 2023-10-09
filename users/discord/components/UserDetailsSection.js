// <script src="/constants.js"></script>
const { createElement } = react;

export const UserDetailsSection = ({
  user: { first_name, username, discordId, discordJoinedAt, picture },
}) => {
  return createElement('section', { class: 'user_details_section' }, [
    createElement('span', { class: 'profile_pic_container' }, [
      createElement(
        'img',
        { src: picture?.url ?? dummyPicture },
        { class: 'profile_pic' },
      ),
    ]),
    createElement('div', { class: 'user_details_container' }, [
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', { class: 'user_info' }, ['Name : ']),
        createElement('span', {}, [first_name]),
      ]),
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', { class: 'user_info' }, ['Username : ']),
        createElement('span', {}, [username]),
      ]),
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', { class: 'user_info' }, ['Discord ID : ']),
        createElement('span', {}, [discordId]),
      ]),
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', { class: 'user_info' }, [
          'Joined RDS server on : ',
        ]),
        createElement('span', {}, [new Date(discordJoinedAt).toUTCString()]),
      ]),
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', { class: 'user_info' }, ['User Management : ']),
        createElement(
          'a',
          {
            target: '_bllank',
            href: `${USER_MANAGEMENT_URL}${username}`,
          },
          [`${USER_MANAGEMENT_URL}${username}`],
        ),
      ]),
    ]),
  ]);
};

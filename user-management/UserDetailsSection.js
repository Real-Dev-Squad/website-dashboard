// <script src="/constants.js"></script>
const { createElement } = react;

export const UserDetailsSection = ({
  user: { first_name, username, discordId, joined_discord },
}) => {
  return createElement('section', { class: 'user_details_section' }, [
    createElement('div', { class: 'user_details_field' }, [
      createElement('span', {}, ['Name: ']),
      createElement('span', {}, [first_name]),
    ]),
    createElement('div', { class: 'user_details_field' }, [
      createElement('span', {}, ['Username: ']),
      createElement('span', {}, [username]),
    ]),
    createElement('div', { class: 'user_details_field' }, [
      createElement('span', {}, ['Discord ID: ']),
      createElement('span', {}, [discordId]),
    ]),
    createElement('div', { class: 'user_details_field' }, [
      createElement('span', {}, ['Joined RDS server on: ']),
      createElement('span', {}, [new Date(joined_discord).toUTCString()]),
    ]),
    createElement('div', { class: 'user_details_field' }, [
      createElement('span', {}, ['User Management: ']),
      createElement(
        'a',
        {
          target: '_bllank',
          href: `https://dashboard.realdevsquad.com/users/details/?username=${username}`,
        },
        [
          `https://dashboard.realdevsquad.com/users/details/?username=${username}`,
        ],
      ),
    ]),
  ]);
};

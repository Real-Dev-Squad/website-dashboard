// <script src="/constants.js"></script>
const { createElement } = react;

export const UserDetailsSection = ({
  user: { first_name, username, discordId, discordJoinedAt },
}) => {
  return createElement(
    'section',
    {
      'data-testid': 'user-details-section',
    },
    [
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
        createElement('span', {}, [new Date(discordJoinedAt).toUTCString()]),
      ]),
      createElement('div', { class: 'user_details_field' }, [
        createElement('span', {}, ['User Management: ']),
        createElement(
          'a',
          {
            target: '_bllank',
            href: `${USER_MANAGEMENT_URL}${username}`,
          },
          [`${USER_MANAGEMENT_URL}${username}`],
        ),
      ]),
    ],
  );
};

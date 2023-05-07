import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';

const { createElement, render } = react;

const rerender = function (element, container) {
  container.firstChild.remove();
  render(element, container);
};

const tabs = [
  { display_name: 'In Discord', id: 'in_discord' },
  { display_name: 'Linked Accounts', id: 'verified' },
  { display_name: 'Unlinked Accounts', id: 'not_verified' },
];

// TODO: This dummy data will be removed after the APIs are merged on the backend
const usersData = {
  in_discord: [
    {
      id: '2fQEmX2Eo9kya3sGvRL2',
      github_display_name: 'Bhavika Tibrewal',
      github_id: 'bhtibrewal',
      incompleteUserDetails: false,
      first_name: 'Bhavika',
      last_name: 'Tibrewal',
      username: 'bhavika-tibrewal',
      discordId: '688775365015240740',
      roles: {
        archived: false,
        super_user: true,
        inDiscord: true,
      },
      joined_discord: '2023-01-13T18:21:09.278000+00:00',
      picture: {
        url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1683338778/profile/sj9t9GBbJ0yvMtw4WXNd/soowyqwenocpit32vqbh.jpg',
      },
    },
    {
      id: 'bmvrT75ZIwUHu7wr5DUJ',
      incompleteUserDetails: false,
      first_name: 'Deipayan',
      last_name: 'Dash',
      discordId: '528222297970966539',
      roles: {
        archived: false,
        inDiscord: true,
      },
      joined_discord: '2023-04-28T12:24:05.465000+00:00',
    },
  ],
  verified: [],
  not_verified: [],
};

// const users = await getUsers();

let activeTab = 'in_discord';
let showUser = 0;

const handleTabNavigation = (e) => {
  const selectedTabId = e.target.getAttribute('data_key');
  if (selectedTabId) {
    activeTab = selectedTabId;
    rerender(App(), window['root']);
  }
};

const handleUserSelected = (e) => {
  const selectedUserId =
    e.target?.getAttribute('data_key') ||
    e.target.parentElement?.getAttribute('data_key');

  if (selectedUserId) {
    showUser = users?.findIndex((user) => user.id === selectedUserId);
    rerender(App(), window['root']);
  }
};

export const App = () => {
  const users = usersData[activeTab] ?? [];

  return createElement('main', {}, [
    TabsSection({ tabs, activeTab, handleTabNavigation }),
    UsersSection({
      users,
      showUser,
      handleUserSelected,
    }),
    UserDetailsSection({ user: users[showUser] ?? {} }),
  ]);
};

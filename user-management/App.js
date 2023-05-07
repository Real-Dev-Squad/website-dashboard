import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';
import { usersData } from './data.js';

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
    showUser = usersData[activeTab]?.findIndex(
      (user) => user.id === selectedUserId,
    );
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

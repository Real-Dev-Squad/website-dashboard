import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';
import { usersData } from './data.js';
import { NoUserFound } from './components/NoUserFound.js';

const { createElement, rerender } = react;

const tabs = [
  { display_name: 'In Discord', id: 'in_discord' },
  { display_name: 'Linked Accounts', id: 'verified' },
  { display_name: 'Unlinked Accounts', id: 'not_verified' },
];

// const users = await getUsers();
const urlParams = new URLSearchParams(window.location.search);

let activeTab = urlParams.get('tab') ?? 'in_discord';
const userParam = urlParams.get('user');
let showUser = usersData[activeTab]?.findIndex((user) => user.id === userParam);
showUser = showUser >= 0 ? showUser : 0;

const handleTabNavigation = (e) => {
  const selectedTabId = e.target.getAttribute('data_key');
  if (selectedTabId) {
    document.location.search = `tab=${selectedTabId}`;

    activeTab = selectedTabId;
    rerender(App(), window['root']);
  }
};
console.log(document.location.search);

const handleUserSelected = (e) => {
  const selectedUserId =
    e.target?.getAttribute('data_key') ||
    e.target.parentElement?.getAttribute('data_key');

  if (selectedUserId) {
    urlParams.set('user', selectedUserId);
    document.location.search = urlParams;
    showUser = usersData[activeTab]?.findIndex(
      (user) => user.id === selectedUserId,
    );
    rerender(App(), window['root']);
  }
};

export const App = () => {
  const users = usersData[activeTab] ?? [];

  if (users.length)
    return createElement('main', {}, [
      TabsSection({ tabs, activeTab, handleTabNavigation }),
      UsersSection({
        users,
        showUser,
        handleUserSelected,
      }),
      UserDetailsSection({ user: users[showUser] ?? {} }),
    ]);

  return createElement('main', {}, [
    TabsSection({ tabs, activeTab, handleTabNavigation }),
    NoUserFound(),
  ]);
};

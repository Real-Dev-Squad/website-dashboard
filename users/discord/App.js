import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';
import { NoUserFound } from './components/NoUserFound.js';
import { SearchField } from './components/SearchField.js';

const { createElement, rerender } = react;

const tabs = [
  { display_name: 'In Discord', id: 'in_discord' },
  { display_name: 'Linked Accounts', id: 'verified' },
];
export const usersData = {
  in_discord: null,
  verified: null,
};
const urlParams = new URLSearchParams(window.location.search);

let activeTab = urlParams.get('tab') ?? 'in_discord';

let showUser = 0;
usersData[activeTab] = await getUsers(activeTab);

let searchTerm = urlParams.get('search') ?? '';

const handleTabNavigation = async (e) => {
  const selectedTabId = e.target.getAttribute('data_key');
  if (selectedTabId) {
    document.location.search = `tab=${selectedTabId}`;

    activeTab = selectedTabId;

    if (!usersData[activeTab]) {
      const data = await getUsers(activeTab);

      usersData[activeTab] = data;
    }
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
    searchTerm = '';
    rerender(App(), window['root']);
  }
};
const users = usersData[activeTab] ?? [];

const filteredUsers = users.filter(
  (user) =>
    user.github_display_name &&
    user.github_display_name.toLowerCase().includes(searchTerm.toLowerCase()),
);

const handleSearchChange = (newSearchTerm) => {
  if (newSearchTerm) {
    searchTerm = newSearchTerm;
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('search', searchTerm);
    document.location.search = searchParams.toString();
  }
};

console.log(searchTerm);

export const App = () => {
  if (users.length) {
    return createElement('main', {}, [
      SearchField({
        onSearchChange: handleSearchChange,
        initialValue: searchTerm,
      }),
      TabsSection({ tabs, activeTab, handleTabNavigation }),
      UsersSection({
        users: searchTerm ? filteredUsers : users,
        showUser,
        handleUserSelected,
      }),
      filteredUsers.length > 0
        ? UserDetailsSection({ user: users[showUser] ?? {} })
        : null,
    ]);
  }

  return createElement('main', {}, [
    TabsSection({ tabs, activeTab, handleTabNavigation }),
    NoUserFound(),
  ]);
};

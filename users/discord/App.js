import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';
import { NoUserFound } from './components/NoUserFound.js';

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

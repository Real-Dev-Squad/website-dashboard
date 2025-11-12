import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers } from './utils/util.js';
import { NoUserFound } from './components/NoUserFound.js';

const { createElement, rerender } = react;

const tabs = [
  { display_name: 'In Discord', id: 'in_discord', value: 'in_discord' },
  { display_name: 'Linked Accounts', id: 'verified', value: 'verified' },
];
export const usersData = {
  in_discord: null,
  verified: null,
};
const urlParams = new URLSearchParams(window.location.search);
const isDev = urlParams.get('dev') === 'true';

let activeTab = urlParams.get('tab') ?? 'in_discord';
const INITIAL_USERS = 10;
let isLoading = false;
let currentPage = 1;
let showUser = 0;

if (!isDev) {
  usersData[activeTab] = await getUsers(activeTab);
}

export const paginateFetchedUsers = async (tabId, page = 1) => {
  if (isLoading) {
    return;
  }
  usersData[activeTab] = await getUsers(activeTab);

  isLoading = true;

  try {
    const start = (page - 1) * INITIAL_USERS;
    const end = start + INITIAL_USERS;

    const newUsers = usersData[tabId].slice(start, end);

    if (newUsers.length > 0) {
      if (page === 1) {
        usersData[tabId] = newUsers; // Initial load
      } else {
        const existingIds = new Set(usersData[tabId].map((user) => user.id));
        const uniqueNewUsers = newUsers.filter(
          (user) => !existingIds.has(user.id),
        );
        usersData[tabId] = [...usersData[tabId], ...uniqueNewUsers];
      }
      currentPage = page;
    }
  } catch (error) {
    console.error('Error fetching users', error);
  } finally {
    isLoading = false;
    rerender(App(), document.getElementById('root'));
  }
};

const handleTabNavigation = async (e) => {
  const selectedTabId = e.target.value;
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

const handleUserSelected = (userId) => {
  if (userId) {
    const selectedUserIndex = usersData[activeTab]?.findIndex(
      (user) => user.id === userId,
    );

    if (selectedUserIndex !== -1) {
      showUser = selectedUserIndex;
      rerender(App(), window['root']);
    }
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
        paginateFetchedUsers,
        activeTab,
        currentPage,
        isLoading,
      }),
      UserDetailsSection({ user: users[showUser] ?? {} }),
    ]);

  return createElement('main', {}, [
    TabsSection({ tabs, activeTab, handleTabNavigation }),
    NoUserFound(),
  ]);
};
if (isDev) {
  paginateFetchedUsers(activeTab, 1);
}

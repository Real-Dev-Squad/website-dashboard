import { TabsSection } from './components/TabsSection.js';
import { UsersSection } from './components/UsersSection.js';
import { UserDetailsSection } from './components/UserDetailsSection.js';
import { getUsers, mockUsersData } from './utils/util.js';
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
const INITIAL_USERS = 10;
let isLoading = false;
let currentPage = 1;
let showUser = 0;

/* this is the original function for fetching user data from the API, will remove it once 
the API pagination issue is resolved. Currently testing pagination using mock data.
 */
// usersData[activeTab] = await getUsers(activeTab);

export const fetchUsers = async (tabId, page = 1) => {
  if (isLoading) {
    return;
  }

  isLoading = true;

  try {
    const start = (page - 1) * INITIAL_USERS;
    const end = start + INITIAL_USERS;

    const newUsers = mockUsersData[tabId].slice(start, end);

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
        fetchUsers,
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

fetchUsers(activeTab, 1);

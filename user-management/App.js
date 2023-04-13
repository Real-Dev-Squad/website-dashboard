import { TabsSection } from './TabsSection.js';
import { UsersSection } from './UsersList.js';
import { UserDetailsSection } from './UserDetailsSection.js';
import react from './react.js';
const { createElement } = react;

export const App = createElement('main', {}, [
  TabsSection(),
  UsersSection(),
  UserDetailsSection(),
]);

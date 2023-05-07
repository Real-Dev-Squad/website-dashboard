import { TabsSection } from './TabsSection.js';
import { UsersSection } from './UsersSection.js';
import { UserDetailsSection } from './UserDetailsSection.js';

const { createElement } = react;
// const users = [
//   {
//     id: 'sj9t9GBbJ0yvMtw4WXNd',
//     profileURL: 'https://my-profile-service.onrender.com',
//     website: 'https://bhavikatibrewal.netlify.app/',
//     incompleteUserDetails: false,
//     discordId: '688775365015240740',
//     roles: {
//       archived: false,
//     },
//     joined_RDS: '2023-01-13T18:21:09.278000+00:00',
//     profileStatus: 'PENDING',
//     linkedin_id: 'bhavika-tibrewal',
//     last_name: 'Tibrewal',
//     yoe: 0,
//     picture: {
//       publicId: 'profile/sj9t9GBbJ0yvMtw4WXNd/nkj3nypuhdb20zlppj1q',
//       url: 'https://res.cloudinary.com/realdevsquad/image/upload/v1679773687/profile/sj9t9GBbJ0yvMtw4WXNd/nkj3nypuhdb20zlppj1q.png',
//     },
//     github_display_name: 'Bhavika Tibrewal',
//     company: 'Rupifi',
//     github_id: 'bhtibrewal',
//     twitter_id: 'bhtibrewal',
//     first_name: 'Bhavika',
//     username: 'bhavika-tibrewal',
//   },
// ];
const tabs = [
  { display_name: 'In Discord', id: 'in_discord' },
  { display_name: 'Linked Accounts', id: 'verified' },
  { display_name: 'Unlinked Accounts', id: 'not_verified' },
];
const activeTab = 'in_discord';
const showUser = 0;
const RDS_API = 'https://api.realdevsquad.com';
const API_BASE_URL = 'http://localhost:3000';
const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/inDiscord`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-type': 'application/json',
      },
    });
    const data = await response.json();
    return data.users ?? [];
    console.log(response);
  } catch (err) {}
};
const users = await getUsers();

export const App = createElement('main', {}, [
  TabsSection({ tabs, activeTab }),
  UsersSection({ users }),
  UserDetailsSection({ user: users?.[0] }),
]);

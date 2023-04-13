import react from './react.js';
const { createElement } = react;
const user = {
  image: 'https://avatars.githubusercontent.com/u/42600164?v=4',
  name: 'bhavika',
  roles: ['reactjs', 'Typescript'],
};
export const UserDetailsSection = () => {
  return createElement('section', { class: 'user_details' }, [
    createElement('div', {}, [`name : ${user.name}`]),
  ]);
};

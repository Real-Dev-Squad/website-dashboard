import react from './react.js';
const { createElement } = react;
const users = [
  {
    id: 1,
    image: 'https://avatars.githubusercontent.com/u/42600164?v=4',
    name: 'bhavika',
    roles: ['reactjs', 'Typescript'],
  },
];
export const UsersSection = () => {
  return createElement(
    'aside',
    {},

    Array(20)
      .fill('')
      .map((user) => {
        return createElement('div', { class: 'user_card', key: users[0].id }, [
          createElement('img', { src: users[0].image, class: 'user_image' }),
          createElement('div', {}, [users[0].name]),
        ]);
      }),
  );
};

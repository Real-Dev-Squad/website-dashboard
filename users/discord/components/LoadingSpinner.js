const { createElement } = react;

export const LoadingSpinner = () => {
  return createElement('aside', { class: 'users_section' }, [
    createElement('div', { class: 'loading' }, ['Loading...']),
  ]);
};

const { createElement } = react;
export const NoUserFound = () => {
  return createElement('section', { class: 'no_user_found' }, [
    'No User Found',
  ]);
};

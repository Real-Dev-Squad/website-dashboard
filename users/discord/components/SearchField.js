const { createElement } = react;

export const SearchField = ({ onSearchChange, initialValue }) =>
  createElement('section', { class: 'search_section' }, [
    createElement('input', {
      class: 'search_field',
      type: 'text',
      placeholder: 'Search users...',
      value: initialValue,
    }),
    createElement(
      'button',
      {
        class: 'search_button',
        onclick: () => {
          onSearchChange(document.querySelector('.search_field').value);
        },
      },
      ['Search'],
    ),
  ]);

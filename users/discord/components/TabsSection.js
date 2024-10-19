const { createElement } = react;

export const TabsSection = ({ tabs, activeTab, handleTabNavigation }) => {
  return createElement(
    'div',
    {
      class: 'tabs_section',
      onclick: handleTabNavigation,
      'data-testid': 'tabs-section',
    },
    tabs.map((tabItem) => {
      return createElement(
        'span',
        {
          data_key: `${tabItem.id}`,
          class: `tab ${activeTab === tabItem.id ? 'active_tab' : ''}`,
        },
        [tabItem.display_name],
      );
    }),
  );
};

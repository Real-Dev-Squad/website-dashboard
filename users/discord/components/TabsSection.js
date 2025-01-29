const { createElement } = react;

export const TabsSection = ({ tabs, activeTab, handleTabNavigation }) => {
  return createElement(
    'select',
    {
      class: 'tabs_section',
      onchange: handleTabNavigation,
      'data-testid': 'tabs-section-select',
    },
    tabs.map((tabItem) => {
      return createElement(
        'option',
        {
          data_key: `${tabItem.id}`,
          class: `tab ${activeTab === tabItem.id ? 'active_tab' : ''}`,
          value: `${tabItem.value}`,
          ...(activeTab === tabItem.id && { selected: 'true' }),
        },
        [tabItem.display_name],
      );
    }),
  );
};

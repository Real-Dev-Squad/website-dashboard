const { createElement } = react;

export const TabsSection = ({ tabs, activeTab, handleTabNavigation }) => {
  return createElement(
    'select',
    { class: 'tabs_section', onchange: handleTabNavigation }, // use onChange
    tabs.map((tabItem) => {
      return createElement(
        'option',
        {
          data_key: `${tabItem.id}`,
          class: `tab ${activeTab === tabItem.id ? 'active_tab' : ''}`,
          value: `${tabItem.value}`,
          ...(activeTab === tabItem.id && { selected: 'true' }), // Apply selected="" if activeTab matches tabItem.id
          // selected: activeTab === tabItem.id ? true : false,
        },
        [tabItem.display_name],
      );
    }),
  );
};

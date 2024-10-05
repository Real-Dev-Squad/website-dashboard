const { createElement } = react;

export const TabsSection = ({ tabs, activeTab, handleTabNavigation }) => {
  return createElement(
    'select',
    { class: 'tabs_section', onclick: handleTabNavigation },
    tabs.map((tabItem) => {
      return createElement(
        'option',
        {
          data_key: `${tabItem.id}`,
          class: `tab ${activeTab === tabItem.id ? 'active_tab' : ''}`,
          value: `${tabItem.value}`, // added a value property to each option
        },
        [tabItem.display_name],
      );
    }),
  );
};

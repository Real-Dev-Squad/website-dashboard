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
          // currently active_tab is alson not updating in chrome, check that issue
          value: `${tabItem.value}`,
          //look up: "https://www.w3schools.com/tags/tryit.asp?filename=tryhtml_option_selected"
          ...(activeTab === tabItem.id && { selected: 'true' }), // Apply selected="" if activeTab matches tabItem.id
          // selected: activeTab === tabItem.id ? true : false,
        },
        [tabItem.display_name],
      );
    }),
  );
};

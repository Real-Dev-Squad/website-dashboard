const { createElement } = react;

const handleTabNavigation = (e) => {
  console.log(e.target);
};

export const TabsSection = ({ tabs, activeTab }) =>
  createElement(
    'div',
    { class: 'tabs_section', onclick: handleTabNavigation },
    tabs.map((tabItem) => {
      return createElement(
        'span',
        { class: `tab ${activeTab === tabItem.id ? 'active_tab' : ''}` },
        [tabItem.display_name],
      );
    }),
  );

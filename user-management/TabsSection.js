import react from './react.js';
const { createElement } = react;
const tabs = ['isInDiscord', 'Verified', 'Not Verified'];
const handleTabNavigation = (e) => {
  console.log(e.target);
};

export const TabsSection = () =>
  createElement(
    'div',
    { class: 'tabs_section', onclick: handleTabNavigation },
    tabs.map((tabItem) => {
      return createElement('span', { class: 'tab' }, [tabItem]);
    }),
  );

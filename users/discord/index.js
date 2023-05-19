import { App } from './App.js';
// const urlParams = new URLSearchParams(window.location.search);

// if (!urlParams.get('dev')) history.back();

window['root'].lastElementChild?.remove();
react.render(App(), window['root']);

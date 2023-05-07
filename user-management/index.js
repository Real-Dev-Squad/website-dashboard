import { App } from './App.js';

window['root'].lastElementChild?.remove();
react.render(App(), window['root']);

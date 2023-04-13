import react, { render } from './react.js';
import { App } from './App.js';

console.log(App);
window['root'].lastElementChild?.remove();
render(App, window['root']);

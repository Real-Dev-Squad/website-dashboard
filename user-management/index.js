// <script src="/constants.js"></script>
import { App } from './App.js';

// console.log(App);
window['root'].lastElementChild?.remove();
react.render(App(), window['root']);

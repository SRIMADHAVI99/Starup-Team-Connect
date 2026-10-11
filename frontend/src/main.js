import { initApp } from './app.js';

let appInitialized = false;

function bootstrap() {
  if (appInitialized) return;
  appInitialized = true;
  initApp();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  bootstrap();
} else {
  document.addEventListener('DOMContentLoaded', bootstrap);
}

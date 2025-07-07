/**
 * React application entry point responsible for mounting the root component to the DOM.
 * Configures React DOM root with strict mode for enhanced development debugging and
 * performance warnings. Serves as the bridge between the HTML document and React
 * component tree, initializing the entire project management application.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

/**
 * Creates React DOM root element for modern concurrent rendering features.
 * Targets the HTML element with ID 'root' for application mounting with type safety.
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

/**
 * Renders the complete application component tree into the DOM root.
 * Wraps the App component with React.StrictMode for development-time debugging,
 * double-rendering detection, and deprecated API warnings to ensure code quality.
 */
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

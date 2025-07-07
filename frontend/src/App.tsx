/**
 * Main application component serving as the root of the React component tree.
 * Provides Redux store context to all child components and establishes the primary
 * layout structure with responsive design. Acts as the entry point for the entire
 * project management application with centralized state management integration.
 */
import { Provider } from 'react-redux';
import { store } from './store';
import ProjectList from './components/Project/ProjectList';

/**
 * Root application component that wraps the entire application with Redux Provider.
 * Establishes the main layout structure with responsive container and background styling.
 * Provides centralized state management access to all child components through Redux store.
 * 
 * @returns JSX element containing the complete application structure with Redux integration
 */
function App() {
  return (
    <Provider store={store}>
      {/** Full-height container with light gray background for consistent app appearance */}
      <div className="min-h-screen bg-gray-50 py-8">
        {/** Responsive container with maximum width constraints and horizontal padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/** Main content area displaying the project management interface */}
          <ProjectList />
        </div>
      </div>
    </Provider>
  );
}

export default App;

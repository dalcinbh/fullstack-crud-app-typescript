import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import ProjectList from './components/Project/ProjectList';

function App() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProjectList />
        </div>
      </div>
    </Provider>
  );
}

export default App;

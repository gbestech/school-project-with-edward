
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { SettingsProvider } from './contexts/SettingsContext';
import { DesignProvider } from './contexts/DesignContext';
import ThemeProvider from './components/ThemeProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import FaviconUpdater from './components/FaviconUpdater';

function App() {
  return (
    <SettingsProvider>
      <FaviconUpdater />
      <DesignProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} />
        </ThemeProvider>
      </DesignProvider>
    </SettingsProvider>
  );
}

export default App;

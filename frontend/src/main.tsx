import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import {router} from './routes'// Adjust the path to where your router file is located
import './i18n'; 
import { SettingsProvider } from './contexts/SettingsContext'

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
    </StrictMode>,
  );
} else {
  throw new Error("Root element not found");
}

// // import 'react-quill/dist/quill.snow.css';
// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App'
// import './i18n'

// const rootElement = document.getElementById('root');
// if (rootElement) {
//   createRoot(rootElement).render(
//     <StrictMode>
//       <App />
//     </StrictMode>,
//   );
// } else {
//   throw new Error("Root element not found");
// }
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initI18n } from "./i18n";  // ✅ import the function (NOT auto-run)

async function bootstrap() {
  await initI18n();  // ✅ wait for school name to load

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();    // ✅ initialize app AFTER i18n loads

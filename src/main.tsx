import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// A previously installed production PWA worker can keep serving an old bundle
// on localhost. Development must always render the source currently being edited.
if (import.meta.env.DEV && import.meta.env.VITE_PWA_DEV !== "true" && "serviceWorker" in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.unregister());
  });

  void caches?.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

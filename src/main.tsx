import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store'
import './index.css'
import App from './App'

// Регистрация service worker для PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Используем путь с учетом base path для GitHub Pages
    const swPath = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swPath)
      .then((registration) => {
        console.log('Service Worker зарегистрирован:', registration.scope);
      })
      .catch((error) => {
        console.error('Ошибка регистрации Service Worker:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)

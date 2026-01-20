import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SymptomsList } from './pages/SymptomsList';
import { SymptomDetail } from './pages/SymptomDetail';
import { isTauri } from './config/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Для Tauri используем HashRouter (работает с протоколом tauri://)
  // Для web используем BrowserRouter с basename для GitHub Pages
  const Router = isTauri ? HashRouter : BrowserRouter;
  const basename = isTauri ? undefined : '/front-thromb';

  return (
    <Router basename={basename}>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/symptoms" element={<SymptomsList />} />
            <Route path="/symptoms/:id" element={<SymptomDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

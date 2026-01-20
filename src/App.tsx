import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { SymptomsList } from './pages/SymptomsList';
import { SymptomDetail } from './pages/SymptomDetail';
import { isTauri } from './config/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  // Для Tauri basename не нужен, для web нужен только на GitHub Pages
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

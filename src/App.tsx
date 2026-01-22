import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { SymptomsList } from './pages/SymptomsList';
import { SymptomDetail } from './pages/SymptomDetail';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssessmentsListPage } from './pages/AssessmentsListPage';
import { AssessmentDetailPage } from './pages/AssessmentDetailPage';
import { getProfile } from './api/auth';
import { setUser, setLoading } from './store/authSlice';
import { AppDispatch } from './store/store';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Проверка активной сессии при загрузке приложения
    const checkSession = async () => {
      try {
        dispatch(setLoading(true));
        const user = await getProfile();
        dispatch(setUser(user));
      } catch (error) {
        // Сессия не активна или произошла ошибка
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkSession();
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/symptoms" element={<SymptomsList />} />
      <Route path="/symptoms/:id" element={<SymptomDetail />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deep-vein-thrombosis"
        element={
          <ProtectedRoute>
            <AssessmentsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deep-vein-thrombosis/:id"
        element={
          <ProtectedRoute>
            <AssessmentDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router basename="/front-thromb">
      <div className="App">
        <Navbar />
        <main className="main-content">
          <AppContent />
        </main>
      </div>
    </Router>
  );
}

export default App;

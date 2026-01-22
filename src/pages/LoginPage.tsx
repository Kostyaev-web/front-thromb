import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { login } from '../api/auth';
import { setUser, setAuthToken, setLoading, setError, clearError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import './LoginPage.css';

export function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Очищаем ошибки при размонтировании
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    dispatch(clearError());

    if (!username || !password) {
      setFormError('Заполните все поля');
      return;
    }

    try {
      dispatch(setLoading(true));
      const { user, token } = await login(username, password);
      dispatch(setUser(user));
      if (token) {
        dispatch(setAuthToken(token));
        // Сохраняем токен в localStorage для использования в перехватчиках axios
        try {
          localStorage.setItem('authState', JSON.stringify({ authToken: token }));
        } catch {
          // Игнорируем ошибки
        }
      }
      navigate('/');
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка входа';
      dispatch(setError(errorMessage));
      setFormError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Container className="login-container">
      <Card className="login-card">
        <Card.Body>
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h2>Вход в систему</h2>
            <p className="text-muted">Войдите в свой аккаунт для продолжения</p>
          </div>

          {(error || formError) && (
            <Alert variant="danger" dismissible onClose={() => {
              setFormError(null);
              dispatch(clearError());
            }}>
              {error || formError}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Имя пользователя</Form.Label>
              <Form.Control
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </Button>
          </Form>

          <div className="login-footer">
            <p className="text-center">
              Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}


import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { register } from '../api/auth';
import { setLoading, setError, clearError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import './RegisterPage.css';

export function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    // Если уже авторизован, редирект на главную
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    dispatch(clearError());

    // Валидация
    if (!formData.username || !formData.password) {
      setFormError('Имя пользователя и пароль обязательны');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Пароль должен содержать минимум 6 символов');
      return;
    }

    try {
      dispatch(setLoading(true));
      await register({
        username: formData.username,
        email: formData.email || undefined,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        password: formData.password,
      });
      // После успешной регистрации перенаправляем на страницу входа
      navigate('/login', { state: { message: 'Регистрация успешна. Пожалуйста, войдите.' } });
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка регистрации';
      dispatch(setError(errorMessage));
      setFormError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <Container className="register-container">
      <Card className="register-card">
        <Card.Body>
          <div className="register-header">
            <div className="register-icon">📝</div>
            <h2>Регистрация</h2>
            <p className="text-muted">Создайте новый аккаунт</p>
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
              <Form.Label>Имя пользователя *</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Введите имя пользователя"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Введите email (необязательно)"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                placeholder="Введите имя (необязательно)"
                value={formData.first_name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Фамилия</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                placeholder="Введите фамилию (необязательно)"
                value={formData.last_name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль *</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Введите пароль (минимум 6 символов)"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
                minLength={6}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Подтвердите пароль *</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100 register-button"
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
                  Регистрация...
                </>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
          </Form>

          <div className="register-footer">
            <p className="text-center">
              Уже есть аккаунт? <Link to="/login">Войти</Link>
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}


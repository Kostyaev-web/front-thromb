import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getProfile, updateProfile } from '../api/auth';
import { setUser, setLoading, setError, clearError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import './ProfilePage.css';

export function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Загружаем профиль один раз при монтировании
  useEffect(() => {
    if (!user) {
      let cancelled = false;
      const loadProfile = async () => {
        try {
          dispatch(setLoading(true));
          const profile = await getProfile();
          if (!cancelled) {
            dispatch(setUser(profile));
            setFormData({
              username: profile.username || '',
              email: profile.email || '',
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
            });
          }
        } catch (err: any) {
          if (!cancelled) dispatch(setError(err.message || 'Ошибка загрузки профиля'));
        } finally {
          if (!cancelled) dispatch(setLoading(false));
        }
      };
      loadProfile();
      return () => { cancelled = true; };
    } else {
      // Если user уже есть, просто синхронизируем formData (только при монтировании)
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [dispatch]); // Убираем user из зависимостей, чтобы не было циклов

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    dispatch(clearError());

    if (!formData.username.trim()) {
      setFormError('Имя пользователя обязательно');
      return;
    }

    try {
      dispatch(setLoading(true));
      const updatedUser = await updateProfile(formData);
      
      // Обновляем пользователя в Redux
      dispatch(setUser(updatedUser));
      
      // Обновляем formData с новым профилем после сохранения
      setFormData({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
      });
      
      setIsEditing(false);
      setSuccessMessage('Профиль успешно обновлен');
    } catch (err: any) {
      const message = err.message || 'Ошибка обновления профиля';
      dispatch(setError(message));
      setFormError(message);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormError(null);
    // Восстанавливаем данные из Redux
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  };

  if (isLoading && !user) {
    return (
        <Container className="profile-container">
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </Spinner>
          </div>
        </Container>
    );
  }

  return (
      <>
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Личный кабинет' }
        ]} />
        <Container className="profile-container">
          <div className="profile-header">
            <h1>Личный кабинет</h1>
            <p className="text-muted">Управление профилем пользователя</p>
          </div>

          {successMessage && (
              <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
                {successMessage}
              </Alert>
          )}

          {(error || formError) && (
              <Alert variant="danger" dismissible onClose={() => { setFormError(null); dispatch(clearError()); }}>
                {error || formError}
              </Alert>
          )}

          <Card className="profile-card">
            <Card.Body>
              <div className="profile-actions">
                {!isEditing && (
                    <Button
                        variant="primary"
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                    >
                      Редактировать профиль
                    </Button>
                )}
              </div>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Имя пользователя *</Form.Label>
                  <Form.Control
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                      required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Имя</Form.Label>
                  <Form.Control
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Фамилия</Form.Label>
                  <Form.Control
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={!isEditing || isLoading}
                  />
                </Form.Group>

                {isEditing && (
                    <div className="profile-form-actions">
                      <Button variant="primary" type="submit" disabled={isLoading}>
                        {isLoading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                              Сохранение...
                            </>
                        ) : 'Сохранить'}
                      </Button>
                      <Button variant="secondary" type="button" onClick={handleCancel} disabled={isLoading} className="ms-2">
                        Отмена
                      </Button>
                    </div>
                )}
              </Form>

              <div className="profile-info-section">
                <hr />
                <h5>Информация о аккаунте</h5>
                <p className="text-muted">
                  <strong>Дата регистрации:</strong>{' '}
                  {user?.date_joined
                      ? new Date(user.date_joined).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                      : 'Не указана'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </>
  );
}

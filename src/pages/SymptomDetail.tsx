import { useState, useEffect } from 'react';
import { Container, Spinner, Button, Alert } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getSymptomById } from '../api/symptoms';
import { Symptom } from '../types';
import { RootState, AppDispatch } from '../store/store';
import { addSymptomToDraft, clearError } from '../store/assessmentsSlice';
import './SymptomDetail.css';

export function SymptomDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { loading: addingSymptom, error: addError } = useSelector((state: RootState) => state.assessments);
  const [symptom, setSymptom] = useState<Symptom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSymptom(parseInt(id));
    }
  }, [id]);

  const loadSymptom = async (symptomId: number) => {
    setLoading(true);
    try {
      const data = await getSymptomById(symptomId);
      setSymptom(data);
    } catch (error) {
      console.error('Ошибка загрузки симптома:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPointsLabel = (points: number): string => {
    const lastDigit = points % 10;
    const lastTwoDigits = points % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'баллов';
    }
    if (lastDigit === 1) {
      return 'балл';
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return 'балла';
    }
    return 'баллов';
  };

  if (loading) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Симптомы', path: '/symptoms' },
          { label: 'Загрузка...' }
        ]} />
        <Container className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </Spinner>
        </Container>
      </>
    );
  }

  if (!symptom) {
    return (
      <>
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Симптомы', path: '/symptoms' },
          { label: 'Не найдено' }
        ]} />
        <Container className="text-center py-5">
          <p>Симптом не найден</p>
          <Link to="/symptoms" className="back-link">Вернуться к списку симптомов</Link>
        </Container>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Симптомы', path: '/symptoms' },
        { label: symptom.name }
      ]} />
      <Container className="symptom-detail-container">
        <div className="symptom-detail">
          <div className="detail-image-section">
            <img
              src={symptom.image_url}
              alt={symptom.name}
              className="detail-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                // Генерируем SVG placeholder
                const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#E8F0F5"/><text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#005BBB" text-anchor="middle" dominant-baseline="middle">🩺</text><text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle" dominant-baseline="middle">Wells Method</text></svg>`;
                target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
              }}
            />
          </div>
          <div className="detail-info-section">
            <h2>{symptom.name}</h2>
            {symptom.category && (
              <p className="category-badge">{symptom.category}</p>
            )}
            
            <div className="description-block">
              <h3>Описание</h3>
              <p>{symptom.description}</p>
            </div>

            <div className="risk-factor-block">
              <h3>Факторы риска</h3>
              <p>{symptom.risk_factor}</p>
            </div>

            <div className="points-block">
              <h3>Баллы по шкале Уэллса</h3>
              <div className="points-display">
                <span className="big-points">{symptom.points}</span>
                <span>{getPointsLabel(symptom.points)}</span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="symptom-action-section">
                <Button
                  variant="success"
                  size="lg"
                  onClick={async () => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    try {
                      await dispatch(addSymptomToDraft(symptom.id)).unwrap();
                      // Можно показать уведомление об успехе
                    } catch (error) {
                      console.error('Ошибка добавления симптома:', error);
                    }
                  }}
                  disabled={addingSymptom}
                >
                  {addingSymptom ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Добавление...
                    </>
                  ) : (
                    'Добавить в заявку'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {addError && (
          <Alert variant="danger" dismissible onClose={() => dispatch(clearError())}>
            {addError}
          </Alert>
        )}
      </Container>
    </>
  );
}


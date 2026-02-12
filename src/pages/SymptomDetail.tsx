import { useState, useEffect } from 'react';
import { Container, Spinner, Button, Alert, Carousel } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getSymptomById, getRecentlyViewedSymptoms } from '../api/symptoms';
import { Symptom } from '../types';
import { RootState, AppDispatch } from '../store/store';
import { addSymptomToDraft, clearError } from '../store/assessmentsSlice';
import { setCurrentSymptom, setError, setLoading } from '../store/symptomsSlice';
import './SymptomDetail.css';

export function SymptomDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { loading: addingSymptom, error: addError } = useSelector((state: RootState) => state.assessments);
  const { currentSymptom: symptom, loading } = useSelector((state: RootState) => state.symptoms);
  const [recentlyViewedSymptoms, setRecentlyViewedSymptoms] = useState<Symptom[]>([]);
  const [, setLoadingRecentlyViewed] = useState(false);

  useEffect(() => {
    if (id) {
      loadSymptom(parseInt(id));
    }

    return () => {
      dispatch(setCurrentSymptom(null));
    };
  }, [dispatch, id]);

  useEffect(() => {
    // Загружаем недавно просмотренные симптомы только для неавторизованных пользователей
    if (!isAuthenticated && id) {
      loadRecentlyViewedSymptoms(parseInt(id));
    }
  }, [isAuthenticated, id]);

  const loadSymptom = async (symptomId: number) => {
    dispatch(setLoading(true));
    dispatch(setCurrentSymptom(null));
    try {
      const data = await getSymptomById(symptomId);
      dispatch(setCurrentSymptom(data));
    } catch (error) {
      dispatch(setError('Ошибка загрузки симптома'));
      console.error('Ошибка загрузки симптома:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const loadRecentlyViewedSymptoms = async (currentSymptomId: number) => {
    setLoadingRecentlyViewed(true);
    try {
      const data = await getRecentlyViewedSymptoms();
      // Фильтруем текущий симптом из списка
      const filteredSymptoms = data.results.filter(s => s.id !== currentSymptomId);
      // Берем только первые 6 симптомов
      setRecentlyViewedSymptoms(filteredSymptoms.slice(0, 6));
    } catch (error) {
      console.error('Ошибка загрузки недавно просмотренных симптомов:', error);
      setRecentlyViewedSymptoms([]);
    } finally {
      setLoadingRecentlyViewed(false);
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

        {/* Блок недавно просмотренных симптомов (только для неавторизованных пользователей) */}
        {!isAuthenticated && recentlyViewedSymptoms.length > 0 && (
          <div className="recently-viewed-section">
            <h3 className="recently-viewed-title">
              Недавно просмотренные
            </h3>
            <Carousel 
              indicators={recentlyViewedSymptoms.length > 4}
              controls={recentlyViewedSymptoms.length > 4}
              interval={null}
              className="recently-viewed-carousel"
            >
              {Array.from({ length: Math.ceil(recentlyViewedSymptoms.length / 4) }).map((_, slideIndex) => (
                <Carousel.Item key={slideIndex}>
                  <div className="recently-viewed-grid">
                    {recentlyViewedSymptoms
                      .slice(slideIndex * 4, slideIndex * 4 + 4)
                      .map(symptomItem => (
                        <div key={symptomItem.id} className="symptom-card-mini">
                          <Link to={`/symptoms/${symptomItem.id}`} className="symptom-card-link">
                            <div className="symptom-card-image-wrapper">
                              <img
                                src={symptomItem.image_url}
                                alt={symptomItem.name}
                                className="symptom-card-image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  const svg = `<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#E8F0F5"/><text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" fill="#005BBB" text-anchor="middle" dominant-baseline="middle">🩺</text><text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" fill="#666666" text-anchor="middle" dominant-baseline="middle">Wells Method</text></svg>`;
                                  target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
                                }}
                              />
                              <div className="symptom-card-overlay">
                              </div>
                            </div>
                            <div className="symptom-card-content">
                              <h4 className="symptom-card-title">{symptomItem.name}</h4>
                              <div className="symptom-card-points">
                                <span className="points-value">{symptomItem.points}</span>
                                <span className="points-label">{getPointsLabel(symptomItem.points)}</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      ))}
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          </div>
        )}
      </Container>
    </>
  );
}
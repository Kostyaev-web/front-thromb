import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { getSymptoms } from '../api/symptoms';
import { Symptom } from '../types';
import './SymptomsList.css';

export function SymptomsList() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await getSymptoms();
        if (isMounted) {
          setSymptoms(data.results);
        }
      } catch (error) {
        console.error('Ошибка загрузки симптомов:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadSymptoms = async (search?: string) => {
    setLoading(true);
    try {
      const data = await getSymptoms(search);
      setSymptoms(data.results);
    } catch (error) {
      console.error('Ошибка загрузки симптомов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    loadSymptoms(searchInput);
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

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Симптомы' }
      ]} />
      <Container className="symptoms-container">
        {/* Блок поиска */}
        <div className="search-section">
          <Form onSubmit={handleSearch}>
            <Form.Group className="d-flex gap-2">
              <Form.Control
                type="text"
                placeholder="Поиск симптомов DVT или факторов риска..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="search-input"
              />
              <Button type="submit" variant="primary" className="search-btn">
                Искать симптомы
              </Button>
            </Form.Group>
          </Form>
        </div>

        {/* Список симптомов */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Загрузка...</span>
            </Spinner>
          </div>
        ) : (
          <div className="symptoms-grid">
            {symptoms.map((symptom) => (
              <Card key={symptom.id} className="symptom-card">
                <Link to={`/symptoms/${symptom.id}`} className="card-link">
                  <Card.Img
                    variant="top"
                    src={symptom.image_url}
                    alt={symptom.name}
                    className="symptom-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Генерируем SVG placeholder
                      const svg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#E8F0F5"/><text x="50%" y="45%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#005BBB" text-anchor="middle" dominant-baseline="middle">🩺</text><text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#666666" text-anchor="middle" dominant-baseline="middle">Wells Method</text></svg>`;
                      target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
                    }}
                  />
                  <Card.Body className="symptom-info">
                    <Card.Title className="symptom-title">{symptom.name}</Card.Title>
                    {symptom.category && (
                      <Card.Text className="category">{symptom.category}</Card.Text>
                    )}
                    <div className="points">
                      <span className="points-value">{symptom.points}</span>
                      <span className="points-label">{getPointsLabel(symptom.points)}</span>
                    </div>
                  </Card.Body>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {!loading && symptoms.length === 0 && (
          <div className="text-center py-5">
            <p>Симптомы не найдены</p>
          </div>
        )}
      </Container>
    </>
  );
}

